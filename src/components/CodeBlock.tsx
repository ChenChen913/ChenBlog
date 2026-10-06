import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import {
  extractCodeText,
  formatCodeLanguageLabel,
  resolveCodeLanguage,
} from '../utils/code-extraction';
import { getHighlightedTokens, type HighlightResult } from '../utils/shiki-highlighter';
import { subscribeThemeDetection } from '../utils/theme-detection';
import type { CodeBlockProps } from './CodeBlock.types';

function getTokenStyle(color?: string, fontStyle = 0): React.CSSProperties {
  return {
    color,
    fontStyle: (fontStyle & 1) === 1 ? 'italic' : 'normal',
    fontWeight: (fontStyle & 2) === 2 ? 700 : 400,
    textDecoration: (fontStyle & 4) === 4 ? 'underline' : 'none',
  };
}

function CodeBlockErrorFallback({ code, languageLabel }: { code: string; languageLabel: string }) {
  const lines = code === '' ? [''] : code.split('\n');

  return (
    <div className="code-block not-prose my-8">
      <div className="code-block__header">
        <div className="code-block__header-left">
          <div className="code-block__window-controls" aria-hidden="true">
            <span className="code-block__window-dot code-block__window-dot--red" />
            <span className="code-block__window-dot code-block__window-dot--yellow" />
            <span className="code-block__window-dot code-block__window-dot--green" />
          </div>
          <span className="code-block__language">{languageLabel}</span>
        </div>
        <span className="code-block__status-text">Plain text fallback</span>
      </div>

      <pre className="code-block__semantic">
        <code>{code}</code>
      </pre>

      <div className="code-block__viewport">
        <div className="code-block__rows">
          {lines.map((line, index) => (
            <div className="code-block__row" key={`${index}-${line}`}>
              <div className="code-block__line-number" aria-hidden="true">
                {index + 1}
              </div>
              <div className="code-block__line-content">
                <span className="code-block__code code-block__code--plain">{line || '\u200B'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CodeBlockContainer({
  children,
  className,
  showLineNumbers = true,
  enableWordWrap = true,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');
  const [highlighted, setHighlighted] = useState<HighlightResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const resetFeedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      return subscribeThemeDetection(setThemeMode);
    } catch (error) {
      console.error('Theme detection setup failed:', error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resetFeedbackTimerRef.current !== null) {
        window.clearTimeout(resetFeedbackTimerRef.current);
      }
    };
  }, []);

  const codeText = useMemo(() => extractCodeText(children), [children]);
  const language = useMemo(() => resolveCodeLanguage(className, children), [children, className]);
  const languageLabel = useMemo(() => formatCodeLanguageLabel(language), [language]);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setHasError(false);

    getHighlightedTokens(codeText, language, themeMode)
      .then(result => {
        if (!isMounted) {
          return;
        }
        setHighlighted(result);
      })
      .catch(error => {
        console.error('Failed to render highlighted code block:', error);
        if (isMounted) {
          setHasError(true);
          setHighlighted(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [codeText, language, themeMode]);

  const lineTotal = highlighted?.lines.length ?? Math.max(codeText.split('\n').length, 1);

  const handleCopy = async () => {
    const success = await copyToClipboard(codeText);

    if (resetFeedbackTimerRef.current !== null) {
      window.clearTimeout(resetFeedbackTimerRef.current);
    }

    if (success) {
      setCopied(true);
      setCopyError(false);
      setAriaLiveMessage('Code copied to clipboard');
      resetFeedbackTimerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
      return;
    }

    setCopied(false);
    setCopyError(true);
    setAriaLiveMessage('Copy failed');
    resetFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyError(false);
    }, 2000);
  };

  if (hasError) {
    return <CodeBlockErrorFallback code={codeText} languageLabel={languageLabel} />;
  }

  return (
    <div className="code-block not-prose my-8">
      <div aria-live="polite" className="sr-only" role="status">
        {ariaLiveMessage}
      </div>

      <div className="code-block__header">
        <div className="code-block__header-left">
          <div className="code-block__window-controls" aria-hidden="true">
            <span className="code-block__window-dot code-block__window-dot--red" />
            <span className="code-block__window-dot code-block__window-dot--yellow" />
            <span className="code-block__window-dot code-block__window-dot--green" />
          </div>
          <span className="code-block__language">{languageLabel}</span>
        </div>

        <button
          aria-label={copied ? 'Code copied' : copyError ? 'Copy failed' : 'Copy code'}
          className="code-block__copy-button"
          onClick={handleCopy}
          type="button"
        >
          {copied ? (
            <>
              <Check className="code-block__copy-icon code-block__copy-icon--success" size={15} />
              <span>Copied</span>
            </>
          ) : copyError ? (
            <>
              <AlertCircle
                className="code-block__copy-icon code-block__copy-icon--error"
                size={15}
              />
              <span>Retry</span>
            </>
          ) : (
            <>
              <Copy className="code-block__copy-icon" size={15} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="code-block__semantic">
        <code>{codeText}</code>
      </pre>

      <div className="code-block__viewport" style={maxHeight ? { maxHeight } : undefined}>
        {isLoading ? (
          <div className="code-block__rows" aria-hidden="true">
            {Array.from({ length: lineTotal }).map((_, index) => (
              <div className="code-block__row" key={index}>
                <div className="code-block__line-number">{showLineNumbers ? index + 1 : ''}</div>
                <div className="code-block__line-content">
                  <div
                    className="code-block__skeleton"
                    style={{ width: `${40 + ((index * 13) % 45)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="code-block__rows"
            style={
              highlighted
                ? ({
                    '--code-block-bg': highlighted.bg,
                    '--code-block-fg': highlighted.fg,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {(highlighted?.lines ?? []).map((line, index) => {
              const isEmptyLine =
                line.tokens.length === 0 || line.tokens.every(token => token.content === '');

              return (
                <div className="code-block__row" key={`${index}-${language}`}>
                  <div className="code-block__line-number" aria-hidden="true">
                    {showLineNumbers ? index + 1 : ''}
                  </div>
                  <div className="code-block__line-content">
                    <span
                      className={`code-block__code ${enableWordWrap ? '' : 'code-block__code--nowrap'}`}
                    >
                      {isEmptyLine ? (
                        <span className="code-block__empty-line" aria-hidden="true">
                          {'\u200B'}
                        </span>
                      ) : (
                        line.tokens.map((token, tokenIndex) => (
                          <span
                            className="code-block__token"
                            key={`${index}-${tokenIndex}`}
                            style={getTokenStyle(token.color, token.fontStyle)}
                          >
                            {token.content}
                          </span>
                        ))
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CodeBlock(props: CodeBlockProps) {
  try {
    return <CodeBlockContainer {...props} />;
  } catch (error) {
    console.error('CodeBlock render error:', error);
    return (
      <CodeBlockErrorFallback
        code={extractCodeText(props.children)}
        languageLabel={formatCodeLanguageLabel(
          resolveCodeLanguage(props.className, props.children)
        )}
      />
    );
  }
}
