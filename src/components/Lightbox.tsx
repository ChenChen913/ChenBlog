import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'

interface LightboxProps {
  src: string
  alt: string
  onClose: () => void
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const lightboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // 将焦点移入模态框
    if (lightboxRef.current) {
      lightboxRef.current.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      ref={lightboxRef}
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="lightbox-overlay"
      onClick={onClose}
      tabIndex={-1}
    >
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="关闭"
      >
        <X size={24} />
      </button>
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        src={src}
        alt={alt}
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}
