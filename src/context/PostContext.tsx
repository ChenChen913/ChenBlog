import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type { HeadingNode } from '../utils/headingParser';

interface PostContextType {
  headings: HeadingNode[];
  setHeadings: (h: HeadingNode[]) => void;
}

const PostContext = createContext<PostContextType>({ headings: [], setHeadings: () => {} });

export function PostProvider({ children }: { children: ReactNode }) {
  const [headings, setHeadingsState] = useState<HeadingNode[]>([]);
  const prevHeadingsRef = useRef<string>('');

  // 使用 useCallback 包装 setHeadings，避免每次渲染都创建新函数
  const setHeadings = useCallback((newHeadings: HeadingNode[]) => {
    // 只在 headings 真正变化时更新（使用 JSON 比较避免引用变化）
    const newHeadingsStr = JSON.stringify(newHeadings);
    if (newHeadingsStr !== prevHeadingsRef.current) {
      prevHeadingsRef.current = newHeadingsStr;
      setHeadingsState(newHeadings);
    }
  }, []);

  // 使用 useMemo 缓存 value 对象，避免每次渲染都创建新对象导致 Context 消费者不必要的重渲染
  const value = useMemo(() => ({ headings, setHeadings }), [headings, setHeadings]);

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePostContext() {
  return useContext(PostContext);
}
