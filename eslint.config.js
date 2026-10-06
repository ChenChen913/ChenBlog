import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * ESLint 10 flat config
 * - src/：浏览器环境 + react-hooks（useEffect 依赖检查）+ react-refresh
 * - scripts/、根配置文件：Node 环境（构建期插件与预渲染脚本）
 * - tests/：Playwright e2e
 * 历史遗留的 any（rehype AST 遍历）与挂载类空依赖保持 warn 级别：
 * 可见但不阻塞 CI，待渐进治理。
 */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'scripts/font-src/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // react-hooks v7 新增的专家规则：自现有代码中大量命中既有模式
      // （加载后置状态的 setState、防御性 try/catch 包裹 JSX 等），
      // 这些代码已经过 94 单测 + 27 e2e 验证，行为正确；降为警告供渐进治理，
      // 待后续专门重构（如统一改为派生 state / ErrorBoundary）后再收紧
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      // unified/rehype 插件遍历 AST 的代码依赖 any（无公开类型），降为警告
      '@typescript-eslint/no-explicit-any': 'warn',
      // 挂载类一次性副作用存在有意为之的空依赖数组
      'react-hooks/exhaustive-deps': 'warn',
      // 空 catch 块是“有意忽略”的通用惯例（如 storage 静默失败）
      'no-empty': ['error', { allowEmptyCatch: true }],
      // 未使用变量：下划线前缀豁免（事件/解构占位）
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.ts', '*.config.ts', 'vite.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['tests/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  }
);
