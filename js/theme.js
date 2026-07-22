function getBeijingHour() {
  return new Date(Date.now() + 8 * 3600000).getUTCHours();
}
function getAutoTheme() {
  const h = getBeijingHour();
  return (h >= 20 || h < 6) ? 'dark' : 'light';
}
function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

function applyTheme(t) {
  document.documentElement.classList.toggle('dark', t === 'dark');
  document.querySelectorAll('.theme-icon').forEach(icon => {
    icon.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
  });
  const hljsLight = document.getElementById('hljs-theme-light');
  const hljsDark = document.getElementById('hljs-theme-dark');
  if (hljsLight && hljsDark) {
    if (t === 'dark') {
      hljsLight.setAttribute('disabled', 'disabled');
      hljsDark.removeAttribute('disabled');
    } else {
      hljsDark.setAttribute('disabled', 'disabled');
      hljsLight.removeAttribute('disabled');
    }
  }
}

function toggleTheme() {
  const curr = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next = curr === 'dark' ? 'light' : 'dark';
  safeSet('theme-preference', next);
  applyTheme(next);
}

applyTheme(safeGet('theme-preference') || getAutoTheme());
setInterval(() => {
  if (!safeGet('theme-preference')) applyTheme(getAutoTheme());
}, 60000);
