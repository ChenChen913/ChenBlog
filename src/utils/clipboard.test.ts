/**
 * Unit tests for clipboard utility
 * 
 * Tests the copyToClipboard function with both modern Clipboard API
 * and legacy execCommand fallback.
 * 
 * Requirements: 3.2, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  // Store original implementations
  let originalClipboard: Clipboard | undefined;
  let originalExecCommand: typeof document.execCommand;

  beforeEach(() => {
    // Store originals
    originalClipboard = navigator.clipboard;
    originalExecCommand = document.execCommand;
  });

  afterEach(() => {
    // Restore originals
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
    document.execCommand = originalExecCommand;
    
    // Clean up any leftover textareas
    document.querySelectorAll('textarea').forEach(el => el.remove());
  });

  describe('Primary method: Clipboard API', () => {
    it('should successfully copy text using navigator.clipboard.writeText', async () => {
      // Mock successful clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await copyToClipboard('Hello World');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('Hello World');
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const result = await copyToClipboard('');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('');
    });

    it('should handle multiline text', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const multilineText = 'Line 1\nLine 2\nLine 3';
      const result = await copyToClipboard(multilineText);

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(multilineText);
    });

    it('should handle special characters', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const specialText = 'const x = "test"; // Comment\n\t<div>HTML</div>';
      const result = await copyToClipboard(specialText);

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(specialText);
    });
  });

  describe('Fallback method: execCommand', () => {
    it('should use fallback when Clipboard API fails', async () => {
      // Mock clipboard API to fail
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard API not available'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      // Mock successful execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;

      const result = await copyToClipboard('Fallback test');

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      
      // Verify textarea was cleaned up
      expect(document.querySelectorAll('textarea').length).toBe(0);
    });

    it('should create and remove temporary textarea', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Failed')) },
        writable: true,
        configurable: true,
      });

      // Mock execCommand
      let textareaCreated = false;
      const mockExecCommand = vi.fn(() => {
        // Check if textarea exists when execCommand is called
        textareaCreated = document.querySelectorAll('textarea').length === 1;
        return true;
      });
      document.execCommand = mockExecCommand;

      await copyToClipboard('Test');

      expect(textareaCreated).toBe(true);
      expect(document.querySelectorAll('textarea').length).toBe(0);
    });

    it('should set correct textarea properties', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Failed')) },
        writable: true,
        configurable: true,
      });

      let capturedTextarea: HTMLTextAreaElement | null = null;
      const mockExecCommand = vi.fn(() => {
        capturedTextarea = document.querySelector('textarea');
        return true;
      });
      document.execCommand = mockExecCommand;

      await copyToClipboard('Test content');

      expect(capturedTextarea).not.toBeNull();
      expect(capturedTextarea?.value).toBe('Test content');
      expect(capturedTextarea?.style.position).toBe('fixed');
      expect(capturedTextarea?.style.opacity).toBe('0');
      expect(capturedTextarea?.hasAttribute('readonly')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should return false when both methods fail', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')) },
        writable: true,
        configurable: true,
      });

      // Mock execCommand to fail
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await copyToClipboard('Test');

      expect(result).toBe(false);
    });

    it('should return false when execCommand throws', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')) },
        writable: true,
        configurable: true,
      });

      // Mock execCommand to throw
      document.execCommand = vi.fn().mockImplementation(() => {
        throw new Error('execCommand not supported');
      });

      const result = await copyToClipboard('Test');

      expect(result).toBe(false);
    });

    it('should clean up textarea even when execCommand fails', async () => {
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Failed')) },
        writable: true,
        configurable: true,
      });

      // Mock execCommand to throw after textarea is created
      document.execCommand = vi.fn().mockImplementation(() => {
        throw new Error('Failed');
      });

      await copyToClipboard('Test');

      // Textarea should still be cleaned up
      expect(document.querySelectorAll('textarea').length).toBe(0);
    });

    it('should log errors when both methods fail', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock both methods to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')) },
        writable: true,
        configurable: true,
      });
      document.execCommand = vi.fn().mockReturnValue(false);

      await copyToClipboard('Test');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle very long text', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const longText = 'x'.repeat(10000);
      const result = await copyToClipboard(longText);

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(longText);
    });

    it('should handle text with unicode characters', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      const unicodeText = '你好世界 🚀 émojis';
      const result = await copyToClipboard(unicodeText);

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(unicodeText);
    });
  });
});
