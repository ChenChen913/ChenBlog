import React from 'react';
import { useParams } from 'react-router-dom';
import StatusView from '../components/StatusView';

const statusMap: Record<string, { code: string; title: string; description: string; hint: string; primaryActionLabel?: string; primaryActionTo?: string; retry?: boolean; }> = {
  '200': {
    code: '200',
    title: '请求已成功完成',
    description: '当前状态说明页用于展示常见状态码的含义与后续引导。',
    hint: '200 通常表示资源正常可用，如果你仍然觉得页面异常，更可能是内容、缓存或脚本层的问题。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '300': {
    code: '300',
    title: '资源存在多个可选入口',
    description: '服务器提示当前资源需要进一步选择或跳转，建议返回入口页重新进入。',
    hint: '这类状态通常与重定向或路径变更有关，检查链接来源会更稳妥。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '400': {
    code: '400',
    title: '请求参数不正确',
    description: '浏览器发出的请求无法被正确处理，通常是地址、参数或提交数据格式异常。',
    hint: '如果你是从站内链接进入，请刷新重试；如果是手动输入地址，建议检查路径拼写。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '401': {
    code: '401',
    title: '当前访问需要身份验证',
    description: '该内容需要登录或验证后才能继续访问。',
    hint: '如果未来接入账号系统，这类页面可引导到登录页；当前项目会优先引导你回到公开内容区域。',
    primaryActionLabel: '浏览公开内容',
    primaryActionTo: '/',
  },
  '402': {
    code: '402',
    title: '该内容暂不可直接访问',
    description: '当前资源被标记为受限状态，可能需要额外授权或后续开通。',
    hint: '402 在现代网站里并不常见，但保留引导页可以避免用户看到生硬报错。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '403': {
    code: '403',
    title: '你暂时无权访问该内容',
    description: '服务器已识别请求，但当前内容不可访问。',
    hint: '在博客场景下，这类情况通常对应草稿、私有内容或未公开页面。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '404': {
    code: '404',
    title: '页面不存在',
    description: '你访问的页面可能已移动、删除，或者地址本身有误。',
    hint: '如果这是站内旧链接，建议从首页或分类页重新进入。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  '408': {
    code: '408',
    title: '请求等待超时',
    description: '页面等待响应时间过长，请稍后重试。',
    hint: '如果你的网络波动较大，建议先刷新页面或检查代理和网络连接。',
    retry: true,
  },
  '429': {
    code: '429',
    title: '请求过于频繁',
    description: '当前访问频率过高，请稍后再试。',
    hint: '如果后续接入接口或 AI 服务，这类状态页可避免用户误以为页面彻底损坏。',
    retry: true,
  },
  '500': {
    code: '500',
    title: '服务器出现异常',
    description: '页面在处理请求时遇到了未预期问题。',
    hint: '建议刷新页面或返回首页；如果多次出现，通常需要进一步排查服务端或渲染逻辑。',
    retry: true,
  },
  '502': {
    code: '502',
    title: '上游服务响应异常',
    description: '当前请求依赖的上游服务返回了无效结果。',
    hint: '这类问题通常不是用户操作造成的，稍后重试通常更有效。',
    retry: true,
  },
  '503': {
    code: '503',
    title: '服务暂时不可用',
    description: '当前服务正在维护或短时过载，请稍后再试。',
    hint: '如果是部署或接口波动引发，建议先回到首页浏览本地可用内容。',
    primaryActionLabel: '返回首页',
    primaryActionTo: '/',
  },
  network: {
    code: 'NETWORK',
    title: '网络连接异常',
    description: '当前设备似乎无法稳定连接网络，页面资源可能加载不完整。',
    hint: '请检查网络、代理或 DNS 配置，恢复后再刷新页面。',
    retry: true,
  },
};

export default function StatusPage() {
  const { code = '404' } = useParams();
  const config = statusMap[code] || statusMap['404'];

  return (
    <StatusView
      code={config.code}
      title={config.title}
      description={config.description}
      hint={config.hint}
      primaryActionLabel={config.primaryActionLabel || (config.retry ? '重新加载' : undefined)}
      primaryActionTo={config.primaryActionTo}
      onPrimaryAction={config.retry ? () => window.location.reload() : undefined}
    />
  );
}
