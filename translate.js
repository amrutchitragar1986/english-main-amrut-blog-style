/* ===========================
   Amrut – Comment Form Popup
   =========================== */
function openAmrutCommentForm(){
  var url="https://docs.google.com/forms/d/e/1FAIpQLSdfwLcC4JCgtet2XQ3y6zP2CglIJfB7Fh_Qp9jQTkgA31lv5Q/viewform?embedded=true";
  var w=820,h=1000;
  var dualLeft=(window.screenLeft!==undefined)?window.screenLeft:screen.left;
  var dualTop=(window.screenTop!==undefined)?window.screenTop:screen.top;
  var width=window.innerWidth||document.documentElement.clientWidth||screen.width;
  var height=window.innerHeight||document.documentElement.clientHeight||screen.height;
  var left=Math.max(0,(width-w)/2+dualLeft);
  var top=Math.max(0,(height-h)/2+dualTop);
  var features="scrollbars=yes,resizable=yes,width="+w+",height="+h+",top="+top+",left="+left;
  var win=window.open(url,"amrutCommentForm",features);
  if(!win){ window.open(url,"_blank","noopener,noreferrer"); return false; }
  try{ win.opener=null; win.focus(); }catch(e){}
  return false;
}

/* ===========================
   Cookie helpers (safe, scoped)
   =========================== */
function setCookieAllScopes(name,value,days){
  var exp=new Date(Date.now()+days*864e5).toUTCString();
  var host=location.hostname;
  var root=host.replace(/^www\./,'');
  // Set for root (with dot) and current host
  document.cookie=name+"="+value+"; expires="+exp+"; path=/; domain=."+root+"; Secure; SameSite=Lax";
  document.cookie=name+"="+value+"; expires="+exp+"; path=/; domain="+host+"; Secure; SameSite=Lax";
}
function clearCookieAllScopes(name){
  var exp="Thu, 01 Jan 1970 00:00:01 GMT";
  var host=location.hostname;
  var root=host.replace(/^www\./,'');
  document.cookie=name+"=; expires="+exp+"; path=/; domain=."+root+"; Secure; SameSite=Lax";
  document.cookie=name+"=; expires="+exp+"; path=/; domain="+host+"; Secure; SameSite=Lax";
  document.cookie=name+"=; expires="+exp+"; path=/; Secure; SameSite=Lax";
}

/* ===========================
   Fallback via cookie
   =========================== */
function applyViaCookie(from,to){
  var val="/"+from+"/"+to;
  // Set both cookies (you had googtrans twice earlier)
  setCookieAllScopes('googtrans',val,1);
  setCookieAllScopes('googtransopt',val,1);
  location.reload();
}

/* ===========================
   Change language with widget
   =========================== */
function changeLanguage(to){
  var from='en';
  // If returning to English → clear cookies for a TRUE reset first
  if(to==='en'){
    clearCookieAllScopes('googtrans');
    clearCookieAllScopes('googtransopt');
  }
  var tries=0, maxTries=60;
  var iv=setInterval(function(){
    var sel=document.querySelector('.goog-te-combo');
    if(sel){
      sel.value=to;
      sel.dispatchEvent(new Event('change'));
      clearInterval(iv);
      // Visual active state (optional)
      var menu=document.getElementById('lwa-lang');
      if(menu){
        menu.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.remove('active'); });
        var btn=menu.querySelector('.lang-btn[data-lang="'+to+'"]');
        if(btn) btn.classList.add('active');
      }
    }else if(++tries>=maxTries){
      clearInterval(iv);
      // Hard fallback if widget didn’t appear
      applyViaCookie(from,to);
    }
  },100);
}

/* ===========================
   Load Google Translate once
   =========================== */
var gteLoading=false, gteLoaded=false;
function loadGoogleTranslate(){
  if(gteLoaded) return Promise.resolve(true);
  if(gteLoading) return window._gteReadyPromise;

  gteLoading=true;
  window._gteReadyPromise=new Promise(function(resolve){
    window.googleTranslateElementInit=function(){
      new google.translate.TranslateElement(
        {pageLanguage:'en',includedLanguages:'en,kn,hi,mr',autoDisplay:false},
        'google_translate_element'
      );
      // Wait until the dropdown exists
      var tries=0, max=60;
      var iv=setInterval(function(){
        if(document.querySelector('.goog-te-combo')){
          clearInterval(iv); gteLoaded=true; resolve(true);
        }else if(++tries>=max){
          clearInterval(iv); gteLoaded=true; resolve(true);
        }
      },100);
    };
    var s=document.createElement('script');
    s.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async=true;
    s.onerror=function(){ gteLoaded=false; resolve(false); };
    document.head.appendChild(s);
  });
  return window._gteReadyPromise;
}

/* ===========================
   Wire up the language menu
   =========================== */
(function(){
  var wrapper=document.getElementById('lwa-lang');
  if(!wrapper) return;
  var toggle=wrapper.querySelector('.lang-toggle');
  var menu=document.getElementById('lwa-lang-menu');
  if(!toggle||!menu) return;

  function openMenu(){ menu.style.display='block'; toggle.setAttribute('aria-expanded','true'); }
  function closeMenu(){ menu.style.display='none'; toggle.setAttribute('aria-expanded','false'); }

  async function onToggle(e){
    e.preventDefault(); e.stopPropagation();
    var open=menu.style.display==='block';
    if(open){ closeMenu(); return; }
    await loadGoogleTranslate();
    openMenu();
  }
  toggle.addEventListener('click', onToggle, {passive:false});
  toggle.addEventListener('touchstart', onToggle, {passive:false});

  menu.addEventListener('click', function(e){ e.stopPropagation(); }, {passive:true});
  menu.addEventListener('touchstart', function(e){ e.stopPropagation(); }, {passive:true});
  document.addEventListener('click', function(e){ if(!wrapper.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });

  wrapper.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', async function(){
      var to=btn.getAttribute('data-lang')||'en';
      closeMenu();
      await loadGoogleTranslate();
      changeLanguage(to);
    });
  });

  // Ensure first-load state is clean English (prevents “stuck” UI)
  window.addEventListener('load', function(){
    setTimeout(function(){ changeLanguage('en'); }, 300);
  });
})();
