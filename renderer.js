const view = document.getElementById('view');
const home = document.getElementById('home');
const address = document.getElementById('address');

// Run a webview call only when it is ready, so errors don't break the UI.
function safe(fn) {
  try { return fn(); } catch (_) { return undefined; }
}

// Turns what the user typed into an http(s) URL, or a search query.
function normalize(raw) {
  const s = raw.trim();
  if (!s) return null;
  let candidate;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    candidate = s;
  } else if (!s.includes('.') || /\s/.test(s)) {
    return 'https://search.brave.com/search?q=' + encodeURIComponent(s);
  } else {
    candidate = 'https://' + s;
  }
  try {
    const u = new URL(candidate);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null;
  } catch (_) {
    return null;
  }
}

function showHome() {
  home.hidden = false;
  view.hidden = true;
  address.value = '';
}

function go(raw) {
  const url = normalize(raw);
  if (!url) {
    address.value = raw;
    address.select();
    return;
  }
  home.hidden = true;
  view.hidden = false;
  address.value = url;
  view.src = url;
}

address.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') go(address.value);
});
document.getElementById('go').addEventListener('click', () => go(address.value));
document.getElementById('home').addEventListener('click', showHome);
document.getElementById('back').addEventListener('click', () => {
  if (!home.hidden) return;
  safe(() => view.canGoBack() && view.goBack());
});
document.getElementById('forward').addEventListener('click', () => {
  if (!home.hidden) return;
  safe(() => view.canGoForward() && view.goForward());
});

document.querySelectorAll('[data-url]').forEach((btn) => {
  btn.addEventListener('click', () => go(btn.dataset.url));
});

// Keep the address bar in sync with the page being viewed.
view.addEventListener('did-navigate', (e) => { address.value = e.url; });
view.addEventListener('did-navigate-in-page', (e) => {
  if (e.isMainFrame) address.value = e.url;
});
