(function () {
  var legacyHost = 'm0hamedseo-bot.github.io';
  var oldOrigin = 'https://m0hamedseo-bot.github.io';
  var newOrigin = 'https://m0hamedseo-bot-github-io.pages.dev';

  function normalizePath(path) {
    if (path === '/index.html') return '/';
    if (/\/index\.html$/i.test(path)) return path.slice(0, -'index.html'.length);
    if (/\.html$/i.test(path)) return path.slice(0, -5);
    return path;
  }

  function migrateUrl(value) {
    if (typeof value !== 'string') return value;
    value = value.replace(oldOrigin, newOrigin);
    if (value.indexOf(newOrigin) === 0) {
      var rest = value.slice(newOrigin.length);
      var cut = rest.search(/[?#]/);
      var path = cut < 0 ? rest : rest.slice(0, cut);
      var suffix = cut < 0 ? '' : rest.slice(cut);
      return newOrigin + normalizePath(path) + suffix;
    }
    if (value.charAt(0) === '/' && value.indexOf('//') !== 0) {
      var pos = value.search(/[?#]/);
      var path = pos < 0 ? value : value.slice(0, pos);
      var suffix = pos < 0 ? '' : value.slice(pos);
      return normalizePath(path) + suffix;
    }
    return value;
  }

  // Redirect visitors from the old GitHub Pages host to the matching Cloudflare URL.
  if (location.hostname === legacyHost) {
    location.replace(newOrigin + normalizePath(location.pathname) + location.search + location.hash);
    return;
  }

  // Keep SEO metadata and structured data aligned with the Cloudflare Pages origin.
  document.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach(function (link) {
    link.href = migrateUrl(link.href);
  });

  document.querySelectorAll('meta[property="og:url"], meta[name="twitter:url"]').forEach(function (meta) {
    meta.setAttribute('content', migrateUrl(meta.getAttribute('content')));
  });

  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
    try {
      var data = JSON.parse(script.textContent);
      function walk(value) {
        if (Array.isArray(value)) {
          value.forEach(walk);
        } else if (value && typeof value === 'object') {
          Object.keys(value).forEach(function (key) {
            if (typeof value[key] === 'string') value[key] = migrateUrl(value[key]);
            else walk(value[key]);
          });
        }
      }
      walk(data);
      script.textContent = JSON.stringify(data);
    } catch (error) {
      // Leave invalid or non-JSON-LD script content untouched.
    }
  });
}());

(function () {
  var storageKey = 'mohamed-seo-language-preference';
  var currentLang = (document.documentElement.lang || 'ar').toLowerCase().indexOf('en') === 0 ? 'en' : 'ar';
  var savedChoice = null;

  try {
    savedChoice = localStorage.getItem(storageKey);
  } catch (error) {
    savedChoice = null;
  }

  document.querySelectorAll('[data-language-switch]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = link.getAttribute('data-target-lang');
      if (target === 'ar' || target === 'en') {
        try { localStorage.setItem(storageKey, target); } catch (error) {}
      }
    });
  });

  if (savedChoice === 'ar' || savedChoice === 'en') return;

  var browserLangs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  var browserPrefersEnglish = browserLangs.some(function (lang) {
    return /^en(?:-|$)/i.test(lang);
  });
  var targetLang = browserPrefersEnglish ? 'en' : 'ar';

  if (targetLang === currentLang) return;

  var targetLink = document.querySelector('[data-language-switch][data-target-lang="' + targetLang + '"]');
  if (!targetLink) return;

  var banner = document.createElement('aside');
  banner.className = 'language-suggestion';
  banner.setAttribute('role', 'status');

  var message = document.createElement('p');
  message.textContent = currentLang === 'ar'
    ? 'يبدو أن لغة متصفحك هي الإنجليزية. هل تفضّل مشاهدة الموقع باللغة الإنجليزية؟'
    : 'Your browser appears to use Arabic. Would you prefer to view this website in Arabic?';

  var switchLink = document.createElement('a');
  switchLink.href = targetLink.href;
  switchLink.textContent = currentLang === 'ar' ? 'View in English' : 'عرض الموقع بالعربية';
  switchLink.addEventListener('click', function () {
    try { localStorage.setItem(storageKey, targetLang); } catch (error) {}
  });

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = currentLang === 'ar' ? 'ليس الآن' : 'Not now';
  dismiss.addEventListener('click', function () {
    try { localStorage.setItem(storageKey, currentLang); } catch (error) {}
    banner.remove();
  });

  banner.appendChild(message);
  banner.appendChild(switchLink);
  banner.appendChild(dismiss);

  var header = document.querySelector('header');
  if (header && header.parentNode) header.parentNode.insertBefore(banner, header.nextSibling);
}());