import { useEffect } from 'react';

/**
 * JSON-LD 结构化数据注入器
 * - 单例 <script type="application/ld+json"> 挂到 <head>，
 *   路由/数据变化时原子替换，避免残留
 * - 预渲染快照同样包含，爬虫无需执行 JS 即可读取
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'page-jsonld';
    script.textContent = serialized;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [serialized]);

  return null;
}
