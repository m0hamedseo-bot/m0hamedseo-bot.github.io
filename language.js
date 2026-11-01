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