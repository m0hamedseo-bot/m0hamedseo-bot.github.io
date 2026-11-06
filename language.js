(function () {
  var oldOrigin = 'https://m0hamedseo-bot-github-io.pages.dev';
  var siteOrigin = 'https://m0hamedseo-bot.github.io';

  function withHtmlPath(path) {
    var match = path.match(/^([^?#]*)(.*)$/);
    var pathname = match[1];
    var suffix = match[2];

    if (pathname === '/index.html') pathname = '/';
    else if (pathname === '/blog/index.html') pathname = '/blog/';
    else if (pathname === '/index-en' || pathname === '/blog/index-en') pathname += '.html';
    else if (pathname === '/blog') pathname = '/blog/';
    else if (pathname !== '/' && !pathname.endsWith('/') && !/\.[^/]+$/.test(pathname)) pathname += '.html';

    return pathname + suffix;
  }

  function migrateUrl(value) {
    if (typeof value !== 'string') return value;
    if (value.indexOf(oldOrigin) === 0) {
      return siteOrigin + withHtmlPath(value.slice(oldOrigin.length) || '/');
    }
    if (value.charAt(0) === '/' && value.indexOf('//') !== 0) {
      return withHtmlPath(value);
    }
    return value;
  }

  document.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach(function (link) {
    link.href = migrateUrl(link.href);
  });

  document.querySelectorAll('meta[property="og:url"], meta[name="twitter:url"]').forEach(function (meta) {
    meta.setAttribute('content', migrateUrl(meta.getAttribute('content')));
  });

  document.querySelectorAll('a[href^="/"]').forEach(function (link) {
    link.setAttribute('href', migrateUrl(link.getAttribute('href')));
  });

  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
    try {
      var data = JSON.parse(script.textContent);
      function walk(value) {
        if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === 'object') {
          Object.keys(value).forEach(function (key) {
            if (typeof value[key] === 'string') value[key] = migrateUrl(value[key]);
            else walk(value[key]);
          });
        }
      }
      walk(data);
      script.textContent = JSON.stringify(data);
    } catch (error) {
      // Keep malformed JSON-LD untouched.
    }
  });

  var articlePath = location.pathname.match(/^\/blog\/([^/]+?)(?:\.html)?\/?$/);
  if (articlePath && articlePath[1] !== 'index-en' && articlePath[1] !== 'index') {
    var slug = articlePath[1];
    var language = (document.documentElement.lang || 'ar').toLowerCase().indexOf('en') === 0 ? 'en' : 'ar';
    var platformKey = slug.split('-')[0];
    var platformNames = {
      salla: { ar: 'سلة', en: 'Salla' },
      zid: { ar: 'زد', en: 'Zid' },
      shopify: { ar: 'Shopify', en: 'Shopify' },
      woocommerce: { ar: 'WooCommerce', en: 'WooCommerce' },
      expandcart: { ar: 'إكسباند كارت', en: 'ExpandCart' },
      magento: { ar: 'Magento', en: 'Adobe Commerce' },
      'wix-stores': { ar: 'Wix Stores', en: 'Wix Stores' },
      bigcommerce: { ar: 'BigCommerce', en: 'BigCommerce' },
      opencart: { ar: 'OpenCart', en: 'OpenCart' },
      prestashop: { ar: 'PrestaShop', en: 'PrestaShop' }
    };
    if (slug.indexOf('wix-stores-') === 0) platformKey = 'wix-stores';
    var platform = platformNames[platformKey] && platformNames[platformKey][language];
    if (platform && document.title.indexOf(platform + ' | ') !== 0) {
      document.title = platform + ' | ' + document.title;
      var description = document.querySelector('meta[name="description"]');
      if (description) {
        var prefix = language === 'ar' ? 'دليل SEO لمتجر ' + platform + ': ' : platform + ' store SEO guide: ';
        if (description.content.indexOf(prefix) !== 0) description.content = prefix + description.content;
      }
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = document.title;
      var ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && description) ogDescription.content = description.content;
      var twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = document.title;
      var twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription && description) twitterDescription.content = description.content;
    }
  }
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