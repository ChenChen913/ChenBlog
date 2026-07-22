const i18n = {
  zh: { nav_home:'首页', nav_posts:'文章', nav_categories:'分类',
        nav_highlights:'精选', nav_about:'关于', toc:'目录',
        copy:'复制', copied:'已复制 ✓', subscribe:'订阅更新',
        related:'相关文章', view_all:'查看全部', permalink:'原始链接',
        search_placeholder: '搜索文章…', recent_posts: '近期文章' },
  en: { nav_home:'Home', nav_posts:'Posts', nav_categories:'Categories',
        nav_highlights:'Highlights', nav_about:'About', toc:'Contents',
        copy:'Copy', copied:'Copied ✓', subscribe:'Subscribe',
        related:'Related', view_all:'View All', permalink:'Permalink',
        search_placeholder: 'Search posts...', recent_posts: 'Recent Posts' }
};
let lang = safeGet('lang-preference') || 'zh';
function setLang(l) {
  lang = l; safeSet('lang-preference', l);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (i18n[l][k]) {
      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.placeholder = i18n[l][k];
      } else {
        el.textContent = i18n[l][k];
      }
    }
  });
  document.querySelectorAll('.lang-toggle-cn').forEach(el => {
    el.classList.toggle('text-primary', l === 'zh');
    el.classList.toggle('text-stone-400', l !== 'zh');
  });
  document.querySelectorAll('.lang-toggle-en').forEach(el => {
    el.classList.toggle('text-primary', l === 'en');
    el.classList.toggle('text-stone-400', l !== 'en');
  });
}

function toggleLang() {
  setLang(lang === 'zh' ? 'en' : 'zh');
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(lang);
});
