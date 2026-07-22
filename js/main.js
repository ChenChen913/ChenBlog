// Copy Code
function copyCode(btn) {
  const lines = btn.closest('.rounded-\\[1\\.5rem\\]')
                   ?.querySelectorAll('.code-line') || [];
  const text = Array.from(lines).map(l => l.textContent).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    const key = btn.getAttribute('data-i18n-copied') || (lang === 'zh' ? '已复制 ✓' : 'Copied ✓');
    const orig = btn.textContent;
    btn.textContent = key;
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Lightbox
  document.querySelectorAll('article img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const o = document.createElement('div');
      o.className = 'fixed inset-0 z-[200] flex items-center justify-center cursor-zoom-out';
      o.style.cssText = 'background:rgba(0,0,0,0.8);backdrop-filter:blur(8px)';
      const i = img.cloneNode();
      i.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:1rem;object-fit:contain';
      o.appendChild(i);
      o.addEventListener('click', () => o.remove());
      document.addEventListener('keydown', e => e.key==='Escape' && o.remove(), {once:true});
      document.body.appendChild(o);
    });
  });

  // TOC Intersection Observer
  const tocLinks = document.querySelectorAll('.toc-item');
  const headings = document.querySelectorAll('article h2, article h3');
  if (tocLinks.length > 0 && headings.length > 0) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(l => {
            const active = l.getAttribute('data-id') === e.target.id;
            l.classList.toggle('text-primary', active);
            l.classList.toggle('border-primary', active);
            l.classList.toggle('border-transparent', !active);
            l.classList.toggle('text-on-surface-variant', !active);
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headings.forEach(h => obs.observe(h));
  }

  // Back to top
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove('opacity-0','translate-y-2','pointer-events-none');
        backToTopBtn.classList.add('opacity-100','translate-y-0');
      } else {
        backToTopBtn.classList.add('opacity-0','translate-y-2','pointer-events-none');
        backToTopBtn.classList.remove('opacity-100','translate-y-0');
      }
    });
  }

  // Search Toggle
  const searchBtns = document.querySelectorAll('.search-toggle');
  const searchPanel = document.getElementById('search-panel');
  if (searchBtns && searchPanel) {
    searchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchPanel.classList.toggle('hidden');
      });
    });
    document.addEventListener('click', (e) => {
      if (!searchPanel.contains(e.target) && !Array.from(searchBtns).some(btn => btn.contains(e.target))) {
        searchPanel.classList.add('hidden');
      }
    });
  }
});
