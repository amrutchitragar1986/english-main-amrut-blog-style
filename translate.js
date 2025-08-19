/* =========================
   Cookie helpers (fallback)
========================= */
function setCookie(name, value, days){
  const d = new Date(); d.setTime(d.getTime() + days*864e5);
  const base = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = base + secure;
  const path = location.pathname.replace(/[^/]*$/, '');
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=${path || '/'}; SameSite=Lax${secure}`;
}
function applyViaCookie(from, to){
  const val = `/${from}/${to}`;
  setCookie('googtrans', val, 1);
  setTimeout(()=>location.reload(), 50);
}

/* =========================
   Google Translate loader (on-demand)
========================= */
let _gteLoading = false, _gteLoaded = false;
function loadGoogleTranslate(){
  if (_gteLoaded) return Promise.resolve(true);
  if (_gteLoading) return window._gteReadyPromise;

  _gteLoading = true;
  const PAGE_LANG = (document.documentElement.lang || 'en').slice(0,2);
  const INCLUDED  = ['en','kn','hi','mr'];

  window._gteReadyPromise = new Promise((resolve) => {
    window.googleTranslateElementInit = function(){
      try {
        new google.translate.TranslateElement(
          { pageLanguage: PAGE_LANG, includedLanguages: INCLUDED.join(','), autoDisplay: false },
          'google_translate_element'
        );
      } catch(e) {}
      const observer = new MutationObserver((_muts, obs) => {
        if (document.querySelector('.goog-te-combo')) {
          obs.disconnect();
          _gteLoaded = true;
          resolve(true);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(()=>{ _gteLoaded = true; resolve(true); }, 4000);
    };
    const s = document.createElement('script');
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = function(){ _gteLoading = false; _gteLoaded = false; resolve(false); };
    document.head.appendChild(s);
  });
  return window._gteReadyPromise.finally(()=>{ _gteLoading = false; });
}

/* =========================
   Change language
========================= */
function changeLanguage(to){
  const from = (document.documentElement.lang || 'en').slice(0,2);
  if (to === from) return;

  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    if (combo.value !== to) {
      combo.value = to;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return;
  }

  loadGoogleTranslate().then(() => {
    const trySet = () => {
      const c = document.querySelector('.goog-te-combo');
      if (!c) return false;
      if (c.value !== to) {
        c.value = to;
        c.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    };
    if (trySet()) return;

    const obs = new MutationObserver((_m,o)=>{ if (trySet()) o.disconnect(); });
    obs.observe(document.body, { childList:true, subtree:true });
    setTimeout(()=>{ obs.disconnect(); applyViaCookie(from,to); }, 6000);
  });
}

/* =========================
   Language menu wiring
========================= */
(function(){
  const wrapper = document.getElementById('lwa-lang');
  if (!wrapper) return;

  const toggle = wrapper.querySelector('.lang-toggle');
  const menu   = document.getElementById('lwa-lang-menu');
  const btns   = wrapper.querySelectorAll('.lang-btn');
  if (!toggle || !menu || !btns.length) return;

  let menuOpen = false;
  const openMenu = () => { menu.style.display='block'; toggle.setAttribute('aria-expanded','true'); menuOpen=true; };
  const closeMenu = () => { menu.style.display='none'; toggle.setAttribute('aria-expanded','false'); menuOpen=false; };

  toggle.addEventListener('click', e=>{ e.preventDefault(); menuOpen?closeMenu():loadGoogleTranslate().finally(openMenu); });
  document.addEventListener('click', e=>{ if (!wrapper.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e=>{ if (e.key==='Escape') closeMenu(); });

  btns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const to=btn.getAttribute('data-lang')||'en';
      closeMenu();
      loadGoogleTranslate().then(()=>changeLanguage(to));
    });
  });
})();
