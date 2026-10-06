import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostMetaBySlug, loadPostContent, getAllPosts, type Post } from '../utils/markdown';
import { incrementViews, getViews } from '../utils/storage';
import { useAppContext } from '../context/AppContext';
import { usePostContext } from '../context/PostContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import TableOfContents from '../components/TableOfContents';
import PostNavigation from '../components/PostNavigation';
import RelatedPosts from '../components/RelatedPosts';
import { Lightbox } from '../components/Lightbox';
import { ArrowLeft, Eye, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CodeBlock from '../components/CodeBlock';
import { getCategoryLabel } from '../config/categories';
import { formatDate } from '../utils/dateFormat';
import { parseMarkdownHeadings } from '../utils/headingParser';
import StatusView from '../components/StatusView';
import ArticleFontSizeControl from '../components/ArticleFontSizeControl';
import JsonLd from '../components/JsonLd';
import Comments from '../components/Comments';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  readArticleFontSizeMode,
  saveArticleFontSizeMode,
  type ArticleFontSizeMode,
} from '../utils/article-font-size';
import { getSafeLinkAttributes, isSafeResourceUrl, toTrustedEmbedUrl } from '../utils/security';

const SAFE_MARKDOWN_TAGS = new Set([
  'a',
  'audio',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'details',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'input',
  'ins',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'source',
  'span',
  'strong',
  'summary',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
  'video',
  'iframe',
]);

const DROP_MARKDOWN_TAGS = new Set([
  'base',
  'embed',
  'form',
  'frame',
  'frameset',
  'link',
  'meta',
  'object',
  'script',
  'style',
  'svg',
  'math',
  'textarea',
]);

const GLOBAL_MARKDOWN_ATTRS = new Set([
  'aria-hidden',
  'aria-label',
  'className',
  'id',
  'role',
  'title',
]);

const TAG_MARKDOWN_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'rel', 'target', 'title']),
  audio: new Set(['controls', 'preload', 'src', 'title']),
  iframe: new Set(['allow', 'allowFullScreen', 'src', 'title']),
  img: new Set(['alt', 'height', 'loading', 'referrerPolicy', 'src', 'title', 'width']),
  input: new Set(['checked', 'disabled', 'type']),
  source: new Set(['src', 'type']),
  td: new Set(['align']),
  th: new Set(['align']),
  video: new Set(['controls', 'height', 'preload', 'src', 'title', 'width']),
};

function rehypeSanitizeMarkdown() {
  return (tree: any) => {
    const sanitizeChildren = (node: any) => {
      if (!Array.isArray(node.children)) {
        return;
      }

      node.children = node.children.flatMap((child: any) => {
        const sanitized = sanitizeNode(child);
        return Array.isArray(sanitized) ? sanitized : sanitized ? [sanitized] : [];
      });
    };

    const sanitizeNode = (node: any): any | any[] | null => {
      if (!node || node.type !== 'element') {
        return node;
      }

      const tagName = String(node.tagName || '').toLowerCase();

      if (DROP_MARKDOWN_TAGS.has(tagName)) {
        return null;
      }

      sanitizeChildren(node);

      if (!SAFE_MARKDOWN_TAGS.has(tagName)) {
        return Array.isArray(node.children) ? node.children : null;
      }

      const sourceProps = node.properties ?? {};
      const safeProps: Record<string, unknown> = {};
      const tagAttrs = TAG_MARKDOWN_ATTRS[tagName] ?? new Set<string>();

      Object.entries(sourceProps).forEach(([key, value]) => {
        if (/^on/i.test(key) || key === 'style') {
          return;
        }

        if (GLOBAL_MARKDOWN_ATTRS.has(key) || tagAttrs.has(key)) {
          safeProps[key] = value;
        }
      });

      if (tagName === 'a') {
        const attrs = getSafeLinkAttributes(String(sourceProps.href ?? ''));
        if (!attrs.href) {
          delete safeProps.href;
          delete safeProps.target;
          delete safeProps.rel;
        } else {
          Object.assign(safeProps, attrs);
        }
      }

      if (['img', 'audio', 'video', 'source'].includes(tagName)) {
        const src = String(sourceProps.src ?? '');
        if (!isSafeResourceUrl(src)) {
          return null;
        }
        safeProps.src = src.trim();
      }

      if (tagName === 'iframe') {
        const embedSrc = toTrustedEmbedUrl(String(sourceProps.src ?? ''));
        if (!embedSrc) {
          return null;
        }
        safeProps.src = embedSrc;
        safeProps.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        safeProps.allowFullScreen = true;
      }

      if (tagName === 'input') {
        if (sourceProps.type !== 'checkbox') {
          return null;
        }
        safeProps.type = 'checkbox';
        safeProps.disabled = true;
        if (sourceProps.checked) {
          safeProps.checked = true;
        }
      }

      node.properties = safeProps;
      return node;
    };

    sanitizeChildren(tree);
  };
}

/**
 * rehype 插件：按文档顺序给 h1/h2/h3 分配 toc-h-N 的 ID
 * 在 unified 管道内运行，完全独立于 React 渲染周期，不受重渲染影响
 * 与 headingParser.ts 使用相同的编号逻辑，保证 TOC 和正文 ID 严格对应
 */
function rehypeSequentialIds() {
  return (tree: any) => {
    let count = 0;
    function walk(node: any) {
      if (
        node.type === 'element' &&
        (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3')
      ) {
        if (!node.properties) node.properties = {};
        node.properties.id = `toc-h-${count++}`;
      }
      if (node.children) {
        node.children.forEach(walk);
      }
    }
    walk(tree);
  };
}

function rehypeHighlightMarks() {
  return (tree: any) => {
    const splitHighlightText = (value: string) => {
      const parts = value.split(/(==.+?==)/g);
      if (parts.length === 1) {
        return [{ type: 'text', value }];
      }

      return parts
        .filter(part => part !== '')
        .map(part => {
          if (part.startsWith('==') && part.endsWith('==')) {
            return {
              type: 'element',
              tagName: 'mark',
              properties: { className: ['markdown-highlight'] },
              children: [{ type: 'text', value: part.slice(2, -2) }],
            };
          }

          return { type: 'text', value: part };
        });
    };

    const walk = (node: any) => {
      if (!node.children) {
        return;
      }

      node.children = node.children.flatMap((child: any) => {
        if (child.type === 'text' && typeof child.value === 'string') {
          return splitHighlightText(child.value);
        }

        walk(child);
        return child;
      });
    };

    walk(tree);
  };
}

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const safeSrc = isSafeResourceUrl(src) ? src.trim() : undefined;

  if (!safeSrc) {
    return null;
  }

  return (
    <>
      <img
        src={safeSrc}
        alt={alt}
        className="article-image cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox src={safeSrc} alt={alt} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function VideoPlayer({ src, title }: { src?: string; title?: string }) {
  if (!src) return null;

  const embedSrc = toTrustedEmbedUrl(src);
  if (embedSrc) {
    return (
      <div className="video-container not-prose my-6">
        <div className="video-wrapper">
          <iframe
            src={embedSrc}
            title={title || 'Video'}
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  const safeSrc = isSafeResourceUrl(src) ? src.trim() : undefined;
  if (!safeSrc) {
    return null;
  }

  return (
    <div className="video-container not-prose my-6">
      <div className="video-wrapper">
        <video src={safeSrc} controls className="video-native" preload="metadata">
          您的浏览器不支持视频播放
        </video>
      </div>
    </div>
  );
}

function AudioPlayer({ src }: { src: string }) {
  const safeSrc = isSafeResourceUrl(src) ? src.trim() : undefined;

  if (!safeSrc) {
    return null;
  }

  return (
    <div className="audio-container not-prose my-4">
      <audio src={safeSrc} controls className="audio-player" preload="metadata">
        您的浏览器不支持音频播放
      </audio>
    </div>
  );
}

/** 正文加载骨架：与液态玻璃质感一致的轻量占位，避免布局抖动 */
function ArticleBodySkeleton() {
  return (
    <div id="post-content-skeleton" className="space-y-4 py-4" aria-hidden="true">
      {[92, 100, 96, 88, 100, 75].map((width, index) => (
        <div
          key={index}
          className="h-4 rounded-full bg-stone-200/70 dark:bg-stone-700/40 animate-pulse"
          style={{ width: `${width}%`, animationDelay: `${index * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function Post() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(0);
  const [articleFontSize, setArticleFontSize] = useState<ArticleFontSizeMode>(() =>
    readArticleFontSizeMode()
  );

  // 同步元数据 + 按需正文：头部信息（标题/日期/分类）即刻渲染，
  // 正文 chunk 到达后再补齐，TOC 随正文一起更新
  const postMeta = useMemo(() => (slug ? getPostMetaBySlug(slug) : undefined), [slug]);
  const [loadedContent, setLoadedContent] = useState<{ slug: string; content: string } | null>(
    null
  );
  const [contentFailed, setContentFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!slug || !postMeta) {
      return;
    }
    let cancelled = false;
    setLoadedContent(null);
    setContentFailed(false);
    loadPostContent(slug)
      .then(content => {
        if (cancelled) return;
        if (content == null) {
          setContentFailed(true);
        } else {
          setLoadedContent({ slug, content });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContentFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, postMeta, retryCount]);

  const post = useMemo<Post | undefined>(() => {
    if (!postMeta) return undefined;
    if (loadedContent?.slug === slug) {
      return { ...postMeta, content: loadedContent.content };
    }
    return postMeta;
  }, [postMeta, loadedContent, slug]);

  // 解析 Markdown 标题，构建 TOC 树形结构
  // ID 由 rehypeSequentialIds 插件在 unified 管道内统一分配，与此处编号严格对应
  const headings = useMemo(() => {
    try {
      return parseMarkdownHeadings(post?.content || '').headings;
    } catch (error) {
      console.error('Heading parse error:', error);
      return [];
    }
  }, [post]);

  // 共享 headings 给手机端目录
  const { setHeadings } = usePostContext();
  useEffect(() => {
    setHeadings(headings);
  }, [headings, setHeadings]);

  // 用于从 DOM 提取标题的 ref
  const contentRef = useRef<HTMLDivElement>(null);

  // 提前计算所有 frontmatter 相关的 memos（避免在 early return 后调用 hooks）
  const safeCoverImage = useMemo(() => {
    const coverImage = post?.frontmatter.coverImage;
    return coverImage && /^https?:\/\//i.test(coverImage) ? coverImage : undefined;
  }, [post]);

  const displayTitle = useMemo(() => {
    const { title, title_en } = post?.frontmatter ?? { title: '', title_en: undefined };
    return lang === 'en' && title_en ? title_en : title;
  }, [lang, post]);

  const categoryLabel = useMemo(() => {
    return getCategoryLabel(post?.frontmatter.category ?? '', lang === 'en' ? 'en' : 'zh');
  }, [post, lang]);

  const formattedDate = formatDate(post?.frontmatter.date ?? '', lang === 'en' ? 'en' : 'zh');

  // 上一篇 / 下一篇：getAllPosts 已按日期倒序，时间线上 newer 在前、older 在后
  const { newerPost, olderPost } = useMemo(() => {
    if (!postMeta) return { newerPost: undefined, olderPost: undefined };
    const posts = getAllPosts();
    const index = posts.findIndex(item => item.slug === postMeta.slug);
    return {
      newerPost: index > 0 ? posts[index - 1] : undefined,
      olderPost: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
    };
  }, [postMeta]);

  // 🔧 SEO：文章页动态元数据（标题/描述/og:article 随文章内容更新）
  usePageMeta({
    title:
      post && !post.frontmatter.draft
        ? `${post.frontmatter.title} | MaoChen Blog`
        : 'MaoChen - Personal Blog',
    description: post?.excerpt?.replace(/\.\.\.$/, '') || undefined,
    ogType: 'article',
    imageUrl: post?.frontmatter.coverImage,
  });

  const handleCopyLink = useCallback(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            console.error('Failed to copy link');
          });
      }
    }
  }, []);

  const handleArticleFontSizeChange = useCallback((mode: ArticleFontSizeMode) => {
    setArticleFontSize(mode);
    saveArticleFontSizeMode(mode);
  }, []);

  useEffect(() => {
    if (slug && post && !post.frontmatter.draft) {
      const viewed = sessionStorage.getItem(`viewed-${slug}`);
      if (!viewed) {
        setViews(incrementViews(slug));
        sessionStorage.setItem(`viewed-${slug}`, '1');
      } else {
        setViews(getViews(slug));
      }
    }
  }, [slug, post]);

  if (!post) {
    return (
      <motion.div id="post-not-found" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <StatusView
          code="404"
          title="文章不存在"
          description="这篇文章可能已经移动、删除，或者当前地址中的 slug 不正确。"
          hint="你可以返回首页重新进入，也可以从分类页继续浏览其他文章。"
          primaryActionLabel="返回首页"
          primaryActionTo="/"
        />
      </motion.div>
    );
  }

  if (post.frontmatter.draft) {
    return (
      <motion.div id="post-draft" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <StatusView
          code="403"
          title="这篇文章暂未公开"
          description="当前内容仍处于草稿或未发布状态，因此暂时无法直接阅读。"
          hint="你可以先返回首页浏览其他已经公开的文章。"
          primaryActionLabel="返回首页"
          primaryActionTo="/"
        />
      </motion.div>
    );
  }

  const { date, category, tags } = post.frontmatter;

  return (
    <>
      {/* 🔧 SEO：文章页 JSON-LD 结构化数据（BlogPosting） */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.frontmatter.title,
          description: post.excerpt?.replace(/\.\.\.$/, '') || undefined,
          datePublished: post.frontmatter.date,
          dateModified: post.frontmatter.date,
          keywords: post.frontmatter.tags?.join(', ') || undefined,
          author: { '@type': 'Person', name: 'MaoChen' },
          inLanguage: 'zh-CN',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id':
              typeof window !== 'undefined'
                ? window.location.origin + window.location.pathname
                : undefined,
          },
          image:
            safeCoverImage ||
            (typeof window !== 'undefined'
              ? new URL('/og-image.png', window.location.origin).href
              : undefined),
        }}
      />
      <div className="article-page">
        {/* 左侧主要内容 */}
        <motion.article
          id={`post-article-${post.slug}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex-1 min-w-0"
        >
          <button
            id="back-button"
            aria-label={lang === 'en' ? 'Back to previous page' : '返回上一页'}
            onClick={() => {
              // 简化返回逻辑：尝试返回上一页，如果失败则返回首页
              if (typeof window !== 'undefined' && window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="post-back-btn back-btn-glass"
          >
            <ArrowLeft size={20} />
            {t('nav_back')}
          </button>

          <header id="post-header" className="mb-10">
            <div
              id="post-meta-top"
              className="flex items-center gap-3 mb-4 text-sm font-medium text-stone-500 dark:text-stone-400"
            >
              <Link
                id={`category-link-${category}`}
                to="/categories"
                className="text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline"
              >
                {categoryLabel}
              </Link>
              <span>•</span>
              <time id="post-date" dateTime={date}>
                {formattedDate}
              </time>
            </div>

            <h1
              id="post-title"
              className="text-2xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mb-6 leading-tight font-kai"
            >
              {displayTitle}
            </h1>

            <ArticleFontSizeControl
              mode={articleFontSize}
              language={lang === 'en' ? 'en' : 'zh'}
              onChange={handleArticleFontSizeChange}
            />

            <div
              id="post-meta-bottom"
              className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-6"
            >
              <div
                id="post-stats"
                className="flex flex-wrap items-center gap-3 text-sm text-stone-500 dark:text-stone-400"
              >
                <span id="post-views" className="flex items-center gap-1.5">
                  <Eye size={16} />
                  {views} {t('views')}
                </span>
              </div>

              <button
                id="copy-link-button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
                <span className="hidden sm:inline">{copied ? t('copied') : t('copy')}</span>
              </button>
            </div>
          </header>

          {safeCoverImage && (
            <div
              id="post-cover-image-container"
              className="mb-10 aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800"
            >
              <img
                id="post-cover-image"
                src={safeCoverImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div
            id="post-content"
            ref={contentRef}
            className="article-body max-w-none"
            data-article-font-size={articleFontSize}
          >
            {post.content === undefined ? (
              contentFailed ? (
                <div
                  id="post-content-error"
                  className="not-prose flex flex-col items-center gap-4 py-16 text-center"
                  role="alert"
                >
                  <p className="text-stone-600 dark:text-stone-400">
                    {lang === 'en'
                      ? 'Failed to load this article. Please check your network and try again.'
                      : '正文加载失败，请检查网络后重试。'}
                  </p>
                  <button
                    onClick={() => setRetryCount(count => count + 1)}
                    className="px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {lang === 'en' ? 'Retry' : '重新加载'}
                  </button>
                </div>
              ) : (
                <ArticleBodySkeleton />
              )
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeHighlightMarks,
                  rehypeSanitizeMarkdown,
                  rehypeSequentialIds,
                  [rehypeKatex, { throwOnError: false, strict: false }],
                ]}
                components={{
                  pre({ children, ...props }) {
                    return <CodeBlock {...props}>{children}</CodeBlock>;
                  },
                  img({ src, alt }) {
                    if (!src) return null;
                    return <ArticleImage src={src} alt={alt || ''} />;
                  },
                  a({ href, children, ...props }) {
                    const safeAttributes = getSafeLinkAttributes(href);
                    if (!safeAttributes.href) {
                      return <>{children}</>;
                    }

                    return (
                      <a {...props} {...safeAttributes}>
                        {children}
                      </a>
                    );
                  },
                  video({ src }) {
                    return <VideoPlayer src={src} />;
                  },
                  iframe({ src, title }) {
                    if (!src) return null;
                    return <VideoPlayer src={src} title={title} />;
                  },
                  audio({ src }) {
                    if (!src) return null;
                    return <AudioPlayer src={src} />;
                  },
                  p: ({ children }) => {
                    return <p className="mb-4">{children}</p>;
                  },

                  // h1 渲染器
                  h1: ({ children, id, ...props }) => (
                    <h1
                      id={id}
                      {...props}
                      style={{
                        fontSize: 'var(--article-h1-size)',
                        lineHeight: '1.4',
                        fontWeight: '700',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        color: 'rgb(15 23 42)',
                      }}
                      className="dark:!text-stone-200 heading-anchor"
                    >
                      {children}
                    </h1>
                  ),

                  // h2 渲染器：ID 已由 rehypeSequentialIds 插件注入，直接透传
                  h2: ({ children, id, ...props }) => (
                    <h2
                      id={id}
                      {...props}
                      style={{
                        fontSize: 'var(--article-h2-size)',
                        lineHeight: '1.4',
                        fontWeight: '700',
                        marginTop: '2rem',
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid rgb(228 228 231)',
                        color: 'rgb(15 23 42)',
                      }}
                      className="dark:!border-stone-700/30 dark:!text-stone-200 heading-anchor"
                    >
                      {children}
                    </h2>
                  ),

                  // h3 渲染器：ID 已由 rehypeSequentialIds 插件注入，直接透传
                  h3: ({ children, id, ...props }) => (
                    <h3
                      id={id}
                      {...props}
                      style={{
                        fontSize: 'var(--article-h3-size)',
                        lineHeight: '1.4',
                        fontWeight: '700',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        color: 'rgb(15 23 42)',
                      }}
                      className="dark:!text-stone-200 heading-anchor"
                    >
                      {children}
                    </h3>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            )}
          </div>

          <footer
            id="post-footer"
            className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800"
          >
            <div id="post-tags" className="flex flex-wrap gap-2">
              {tags?.map(tag => (
                <span
                  key={tag}
                  id={`tag-${tag}`}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-lg text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 上一篇 / 下一篇导航 */}
            <div className="mt-8">
              <PostNavigation newerPost={newerPost} olderPost={olderPost} />
            </div>
          </footer>

          {/* 相关文章推荐（按标签交集，回退同分类） */}
          <RelatedPosts currentSlug={post.slug} tags={tags} category={category} />
        </motion.article>
        <TableOfContents parsedHeadings={headings} />
      </div>

      {/* giscus 评论（未配置环境变量时渲染 null，零开销） */}
      <Comments />
    </>
  );
}
