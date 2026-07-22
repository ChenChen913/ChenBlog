#!/usr/bin/env python3
"""
HealthFit 数据导出脚本
功能：将 JSON/TXT/SQLite 数据导出为 Markdown 报告

隐私设计：
  private_sexual_health.json 默认被排除在所有导出之外。
  如需包含，请使用 --include-private 参数运行，并在交互式提示中确认。
  这是 SKILL.md 中"二次确认"承诺的实际实现。
"""

import json
import argparse
from datetime import datetime
from pathlib import Path

# ─── 敏感文件名单 ─────────────────────────────────────────────────────────────
PRIVATE_JSON_FILES = {
    "private_sexual_health.json",
}
# ─────────────────────────────────────────────────────────────────────────────


def get_skill_dir() -> Path:
    return Path(__file__).parent.parent


def get_data_dir() -> Path:
    return get_skill_dir() / "data"


def get_export_dir() -> Path:
    return get_skill_dir() / "exports"


def _confirm_private_inclusion() -> bool:
    """
    在导出敏感数据前进行交互式二次确认。
    仅当用户明确输入"yes"时返回 True。
    """
    print()
    print("⚠️  警告：你请求将私密敏感数据纳入本次导出。")
    print("   涉及文件：" + "、".join(sorted(PRIVATE_JSON_FILES)))
    print("   导出的 Markdown 报告将以明文形式包含这些数据。")
    print()
    answer = input('   请输入 yes 确认，或输入其他任意内容跳过私密数据：').strip().lower()
    if answer == "yes":
        print("   ✓ 已确认 —— 私密数据将被纳入本次导出。")
        return True
    else:
        print("   ✗ 已跳过 —— 私密数据不会出现在导出报告中（安全默认值）。")
        return False


def load_json(file_path: Path):
    """加载 JSON 文件；文件不存在时返回 None。"""
    if not file_path.exists():
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ─── 各模块导出函数 ────────────────────────────────────────────────────────────

def export_profile() -> str:
    profile = load_json(get_data_dir() / "json" / "profile.json")
    if not profile or not profile.get("nickname"):
        return "## 用户档案\n\n暂无数据（请先完成建档）\n"

    md = "## 用户档案\n\n"
    md += f"- **昵称：** {profile.get('nickname', '未设置')}\n"
    md += f"- **性别：** {profile.get('gender', '未设置')}\n"
    md += f"- **年龄：** {profile.get('age', '未设置')}\n"
    md += f"- **身高：** {profile.get('height_cm', '未设置')} cm\n"
    md += f"- **体重：** {profile.get('weight_kg', '未设置')} kg\n"
    md += f"- **体脂率：** {profile.get('body_fat_pct', '未设置')}%\n"
    md += f"- **BMI：** {profile.get('bmi', '未设置')}\n"
    md += f"- **目标：** {profile.get('primary_goal', '未设置')}\n"
    md += f"- **目标体重：** {profile.get('target_weight_kg', '未设置')} kg\n"
    return md + "\n"


def export_tcm_profile() -> str:
    tcm = load_json(get_data_dir() / "json" / "tcm_profile.json")
    if not tcm or not tcm.get("primary_constitution"):
        return "## 中医体质档案\n\n暂无数据（请先完成体质辨识）\n"

    md = "## 中医体质档案\n\n"
    md += f"- **主体质：** {tcm.get('primary_constitution', '未设置')}\n"
    md += f"- **兼夹体质：** {', '.join(tcm.get('secondary_constitutions', [])) or '无'}\n"
    md += f"- **辨识日期：** {tcm.get('created_at', '未设置')}\n"
    md += f"- **最近复查：** {tcm.get('last_assessed', '未设置')}\n"

    tongue_records = tcm.get("tongue_records", [])
    if tongue_records:
        md += "\n### 舌象记录\n\n"
        for record in tongue_records[-3:]:
            md += (
                f"- **{record.get('date')}**："
                f"{record.get('body_color')} {record.get('body_shape')}，"
                f"{record.get('coating')}\n"
            )
    return md + "\n"


def export_daily_logs() -> str:
    daily_dir = get_data_dir() / "json" / "daily"
    if not daily_dir.exists():
        return "## 每日日志\n\n暂无数据\n"

    logs = sorted(daily_dir.glob("*.json"), reverse=True)[:7]
    md = "## 最近 7 天日志\n\n"
    for log_file in logs:
        data = load_json(log_file)
        if not data:
            continue
        md += f"### {log_file.stem}\n\n"
        metrics = data.get("metrics", {})
        if metrics.get("weight_kg"):
            md += f"- **体重：** {metrics['weight_kg']} kg\n"
        if metrics.get("sleep_hours"):
            md += f"- **睡眠：** {metrics['sleep_hours']} 小时\n"
        if metrics.get("energy_level"):
            md += f"- **精力：** {metrics['energy_level']}/10\n"
        workout_ids = data.get("workout_ids", [])
        if workout_ids:
            md += f"- **运动：** {len(workout_ids)} 次\n"
        md += "\n"
    return md


def export_achievements() -> str:
    achievements_file = get_data_dir() / "txt" / "achievements.txt"
    if not achievements_file.exists():
        return "## 成就记录\n\n暂无成就\n"

    with open(achievements_file, "r", encoding="utf-8") as f:
        content = f.read()

    lines = [ln for ln in content.split("\n") if ln.strip() and not ln.startswith("#")]
    if len(lines) <= 1:
        return "## 成就记录\n\n暂无成就\n"
    return "## 成就记录\n\n" + "\n".join(lines) + "\n"


def export_sexual_health() -> str:
    """
    导出性健康数据。
    仅在用户显式传入 --include-private 并确认后调用。
    """
    sh = load_json(get_data_dir() / "json" / "private_sexual_health.json")
    if not sh or not sh.get("privacy_confirmed"):
        return "## 性健康记录\n\n暂无数据\n"

    md = "## 性健康记录\n\n"
    md += "> ⚠️ 本节包含高度敏感的隐私数据。\n\n"

    common = sh.get("common_data", {})
    if common:
        md += "### 通用数据\n\n"
        md += f"- **频率（每周）：** {common.get('frequency_weekly', '未设置')}\n"
        md += f"- **事后疲劳程度：** {common.get('post_sex_fatigue_level', '未设置')}\n"
        md += f"- **影响次日训练：** {common.get('affects_next_day_training', '未设置')}\n\n"

    male = sh.get("male_data")
    if male:
        md += "### 男性专项\n\n"
        md += f"- **勃起功能评分：** {male.get('erectile_function_score', '未设置')}\n"
        md += f"- **晨勃频率：** {male.get('morning_erection_frequency', '未设置')}\n"
        md += f"- **症状：** {', '.join(male.get('symptoms', [])) or '无'}\n\n"

    female = sh.get("female_data")
    if female:
        md += "### 女性专项\n\n"
        for k, v in female.items():
            md += f"- **{k}：** {v}\n"
        md += "\n"

    return md


# ─── 报告组装 ──────────────────────────────────────────────────────────────────

def generate_report(include_private: bool = False) -> str:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    md = "# HealthFit 健康数据导出报告\n\n"
    md += f"**导出时间：** {timestamp}\n"
    md += f"**私密数据是否包含：** {'是（用户已确认）' if include_private else '否（默认排除）'}\n\n"
    md += "---\n\n"

    md += export_profile()
    md += "---\n\n"
    md += export_tcm_profile()
    md += "---\n\n"
    md += export_daily_logs()
    md += "---\n\n"
    md += export_achievements()

    if include_private:
        md += "---\n\n"
        md += export_sexual_health()

    return md


# ─── 命令行入口 ────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="HealthFit 数据导出工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "隐私说明：\n"
            "  private_sexual_health.json 默认被排除在导出报告之外。\n"
            "  使用 --include-private 参数可将其纳入导出，但需通过交互式二次确认。"
        ),
    )
    parser.add_argument(
        "--include-private",
        action="store_true",
        default=False,
        help="将私密/敏感数据纳入导出报告（需要交互式二次确认）。",
    )
    return parser.parse_args()


def main() -> Path:
    print("🔵 HealthFit 数据导出工具")
    print("=" * 50)

    args = parse_args()

    # 私密数据的二次确认门控
    include_private = False
    if args.include_private:
        include_private = _confirm_private_inclusion()

    export_dir = get_export_dir()
    export_dir.mkdir(parents=True, exist_ok=True)

    print("正在生成导出报告...")
    report = generate_report(include_private=include_private)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = export_dir / f"export_{timestamp}.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"✓ 报告已导出 → {report_file}")
    print("=" * 50)
    print("✅ 导出完成！")

    if not include_private and PRIVATE_JSON_FILES:
        print()
        print("ℹ️  私密数据已被排除在本次导出之外（安全默认值）。")
        print("   如需导出私密数据，请使用 --include-private 参数重新运行。")

    return report_file


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ 导出失败：{e}")
        raise
