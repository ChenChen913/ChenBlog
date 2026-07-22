import React from 'react';
import StatusView from '../components/StatusView';

export default function NotFound() {
  return (
    <StatusView
      code="404"
      title="页面不存在"
      description="你访问的页面可能已经移动、被删除，或者地址输入有误。"
      hint="你可以返回首页继续浏览文章，或者检查链接地址是否正确。"
      primaryActionLabel="返回首页"
      primaryActionTo="/"
    />
  );
}
