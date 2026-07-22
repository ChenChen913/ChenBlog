import React from 'react';
import StatusView from './StatusView';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application render error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <StatusView
          code="500"
          title="页面渲染出现异常"
          description="页面在渲染过程中遇到了未预期的问题，建议返回首页或刷新后重试。"
          hint="如果这个问题持续出现，通常意味着某个组件在运行时抛出了错误。"
          primaryActionLabel="返回首页"
          primaryActionTo="/"
        />
      );
    }

    return this.props.children;
  }
}
