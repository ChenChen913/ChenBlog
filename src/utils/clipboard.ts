/**
 * Clipboard Utility
 * 
 * Provides robust clipboard copy functionality with fallback support
 * for environments where the Clipboard API is unavailable or fails.
 * 
 * Requirements: 3.2, 3.4
 */

/**
 * Copy text to clipboard with fallback support
 * 
 * Primary method: Uses modern navigator.clipboard.writeText() API
 * Fallback method: Uses legacy document.execCommand('copy') for older browsers
 * 
 * @param text - The text content to copy to clipboard
 * @returns Promise<boolean> - true if copy succeeded, false otherwise
 * 
 * @example
 * ```typescript
 * const success = await copyToClipboard('Hello World');
 * if (success) {
 *   console.log('Copied successfully!');
 * } else {
 *   console.error('Copy failed');
 * }
 * ```
 * 
 * Requirements: 3.2, 3.4
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Primary method: Modern Clipboard API
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback method', err);
    
    // Fallback method: Legacy execCommand approach
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      
      // Position off-screen to avoid visual flash
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      textarea.setAttribute('readonly', ''); // Prevent mobile keyboard
      
      document.body.appendChild(textarea);
      
      try {
        // Select the text
        textarea.select();
        textarea.setSelectionRange(0, text.length); // For mobile devices
        
        // Execute copy command
        const success = document.execCommand('copy');
        
        if (success) {
          return true;
        } else {
          throw new Error('execCommand returned false');
        }
      } finally {
        // Always clean up the textarea
        document.body.removeChild(textarea);
      }
    } catch (fallbackErr) {
      console.error('All copy methods failed', {
        clipboardError: err,
        fallbackError: fallbackErr,
      });
      return false;
    }
  }
}
