#!/usr/bin/env python3
"""
HealthFit 数据备份脚本
功能：备份 data/ 目录到 data/db/backup/

隐私设计：
  private_sexual_health.json 默认被排除在所有备份之外。
  如需包含，请使用 --include-private 参数运行，并在交互式提示中确认。
  这是 SKILL.md 中"二次确认"承诺的实际实现。
"""

import sys
import shutil
import json
import argparse
from datetime import datetime
from pathlib import Path

# ─── 敏感文件名单 ─────────────────────────────────────────────────────────────
# 此名单中的文件默认被排除在备份之外。
# 用户须同时满足以下两个条件才能将其包含在备份中：
#   1. 运行时附加 --include-private 参数
#   2. 在交互式提示中手动输入"yes"确认
PRIVATE_FILES = {
    "private_sexual_health.json",
}
# ─────────────────────────────────────────────────────────────────────────────


def get_skill_dir() -> Path:
    """获取 HealthFit skill 根目录（本脚本所在目录的上两级）"""
    return Path(__file__).parent.parent


def get_data_dir() -> Path:
    return get_skill_dir() / "data"


def get_backup_dir() -> Path:
    return get_skill_dir() / "data" / "db" / "backup"


def _confirm_private_inclusion() -> bool:
    """
    在备份敏感文件前进行交互式二次确认。
    仅当用户明确输入"yes"时返回 True。
    """
    print()
    print("⚠️  警告：你请求将私密敏感文件纳入本次备份。")
    print("   涉及文件：" + "、".join(sorted(PRIVATE_FILES)))
    print("   这些文件可能包含性健康记录等高度敏感的个人数据。")
    print()
    answer = input('   请输入 yes 确认，或输入其他任意内容跳过私密文件：').strip().lower()
    if answer == "yes":
        print("   ✓ 已确认 —— 私密文件将被纳入本次备份。")
        return True
    else:
        print("   ✗ 已跳过 —— 私密文件不会被备份（安全默认值）。")
        return False


def _copy_json_dir(json_dir: Path, dest: Path, include_private: bool) -> dict:
    """
    将 json/ 目录复制到目标路径，并对私密文件进行过滤。

    返回摘要字典：{copied: [...], skipped: [...]}
    """
    dest.mkdir(parents=True, exist_ok=True)
    summary = {"copied": [], "skipped": []}

    # 复制顶层 JSON 文件（按名单过滤）
    for src_file in json_dir.glob("*.json"):
        if src_file.name in PRIVATE_FILES:
            if include_private:
                shutil.copy2(src_file, dest / src_file.name)
                summary["copied"].append(src_file.name)
            else:
                summary["skipped"].append(src_file.name)
        else:
            shutil.copy2(src_file, dest / src_file.name)
            summary["copied"].append(src_file.name)

    # 完整复制 daily/ 子目录（该目录中不存在私密文件）
    daily_src = json_dir / "daily"
    if daily_src.exists():
        shutil.copytree(daily_src, dest / "daily")
        daily_count = len(list((dest / "daily").glob("*.json")))
        summary["copied"].append(f"daily/（{daily_count} 个文件）")

    return summary


def create_backup(include_private: bool = False) -> Path:
    """
    在 data/db/backup/ 下创建带时间戳的备份。

    Args:
        include_private: 若为 True（且用户已确认），则同时备份私密文件。
                         若为 False（默认），私密文件将被静默排除。
    """
    data_dir = get_data_dir()
    backup_dir = get_backup_dir()
    backup_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = backup_dir / f"backup_{timestamp}"
    backup_path.mkdir(parents=True, exist_ok=True)

    print(f"开始备份 → {backup_path}")
    print(f"私密文件处理方式：{'包含（用户已确认）' if include_private else '排除（默认安全值）'}")
    print()

    json_summary = {"copied": [], "skipped": []}
    txt_count = 0
    db_count = 0

    # ── JSON 目录 ──────────────────────────────────────────────────────────────
    json_dir = data_dir / "json"
    if json_dir.exists():
        json_summary = _copy_json_dir(json_dir, backup_path / "json", include_private)
        print(f"✓ 已备份 JSON 文件：{len(json_summary['copied'])} 个")
        if json_summary["skipped"]:
            print(f"  ⚠ 已排除（私密）：{', '.join(json_summary['skipped'])}")

    # ── TXT 目录 ───────────────────────────────────────────────────────────────
    txt_dir = data_dir / "txt"
    if txt_dir.exists():
        dest_txt = backup_path / "txt"
        dest_txt.mkdir(exist_ok=True)
        for f in txt_dir.glob("*.txt"):
            shutil.copy2(f, dest_txt / f.name)
        txt_count = len(list(dest_txt.glob("*.txt")))
        print(f"✓ 已备份 TXT 日志：{txt_count} 个")

    # ── SQLite 数据库 ──────────────────────────────────────────────────────────
    db_dir = data_dir / "db"
    if db_dir.exists():
        dest_db = backup_path / "db"
        dest_db.mkdir(exist_ok=True)
        for db_file in db_dir.glob("*.db"):
            shutil.copy2(db_file, dest_db / db_file.name)
            db_count += 1
        print(f"✓ 已备份 SQLite 数据库：{db_count} 个")

    # ── 备份清单 ───────────────────────────────────────────────────────────────
    manifest = {
        "backup_time": timestamp,
        "backup_path": str(backup_path),
        "include_private": include_private,
        "private_files_excluded": json_summary["skipped"],
        "files": {
            "json_copied": len(json_summary["copied"]),
            "json_skipped": len(json_summary["skipped"]),
            "txt": txt_count,
            "db": db_count,
        },
    }
    with open(backup_path / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print()
    print(f"✓ 备份清单已写入 → {backup_path / 'manifest.json'}")
    return backup_path


def cleanup_old_backups(keep_count: int = 4) -> None:
    """删除最旧的备份目录，仅保留最近 `keep_count` 个。"""
    backup_dir = get_backup_dir()
    if not backup_dir.exists():
        return
    backups = sorted([d for d in backup_dir.iterdir() if d.is_dir()], reverse=True)
    for old_backup in backups[keep_count:]:
        print(f"  正在删除旧备份：{old_backup.name}")
        shutil.rmtree(old_backup)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="HealthFit 数据备份工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "隐私说明：\n"
            "  敏感文件（如 private_sexual_health.json）默认被排除在备份之外。\n"
            "  使用 --include-private 参数可将其纳入备份，但需通过交互式二次确认。"
        ),
    )
    parser.add_argument(
        "--include-private",
        action="store_true",
        default=False,
        help="将私密/敏感文件纳入备份（需要交互式二次确认）。",
    )
    parser.add_argument(
        "--keep",
        type=int,
        default=4,
        metavar="N",
        help="保留最近备份的数量（默认：4）。",
    )
    return parser.parse_args()


if __name__ == "__main__":
    print("🔵 HealthFit 数据备份工具")
    print("=" * 50)

    args = parse_args()

    # 私密文件的二次确认门控
    include_private = False
    if args.include_private:
        include_private = _confirm_private_inclusion()

    try:
        backup_path = create_backup(include_private=include_private)
        cleanup_old_backups(keep_count=args.keep)
        print("=" * 50)
        print("✅ 备份完成！")
        if not include_private and PRIVATE_FILES:
            print()
            print("ℹ️  私密文件已被排除在本次备份之外（安全默认值）。")
            print("   如需备份私密文件，请使用 --include-private 参数重新运行。")
    except Exception as e:
        print(f"❌ 备份失败：{e}")
        raise
