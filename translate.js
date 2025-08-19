function openAmrutCommentForm(){
  var url="https://docs.google.com/forms/d/e/1FAIpQLSdfwLcC4JCgtet2XQ3y6zP2CglIJfB7Fh_Qp9jQTkgA31lv5Q/viewform?embedded=true";
  var w=820,h=1000;
  var dualLeft=window.screenLeft!==undefined?window.screenLeft:screen.left;
  var dualTop=window.screenTop!==undefined?window.screenTop:screen.top;
  var width=window.innerWidth||document.documentElement.clientWidth||screen.width;
  var height=window.innerHeight||document.documentElement.clientHeight||screen.height;
  var left=Math.max(0,(width-w)/2+dualLeft);
  var top=Math.max(0,(height-h)/2+dualTop);
  var features="scrollbars=yes,resizable=yes,width="+w+",height="+h+",top="+top+",left="+left;
  var win=window.open(url,"amrutCommentForm",features);
  if(!win){window.open(url,"_blank","noopener,noreferrer");return false;}
  try{win.opener=null;win.focus();}catch(e){}
  return false;
}

/* Cookie helpers for fallback (unchanged) */
function setCookie(name,value,days){
  const d=new Date(); d.setTime(d.getTime()+days*864e5);
  document.cookie=name+"="+value+"; expires="+d.toUTCString()+"; path=/";
}
function applyViaCookie(from,to){
  const val="/"+from+"/"+to;
  setCookie('googtrans',val,1);
  setCookie('googtrans',val,1);
  location.reload();
}

/* Change language with widget; fallback via cookie if needed (unchanged) */
function changeLanguage(to){
  const from='en';
  let tries=0, maxTries=60;
  const iv=setInterval(()=>{
    const sel=document.querySelector('.goog-te-combo');
    if(sel){
      sel.value=to;
      sel.dispatchEvent(new Event('change'));
      clearInterval(iv);
    }
    if(++tries>=maxTries){
      clearInterval(iv);
      applyViaCookie(from,to);
    }
  },100);
}

/* Load Google Translate on demand (unchanged, just ensure HTTPS src) */
let gteLoading=false, gteLoaded=false;
function loadGoogleTranslate(){
  if(gteLoaded) return Promise.resolve(true);
  if(gteLoading) return window._gteReadyPromise;

  gteLoading=true;
  window._gteReadyPromise=new Promise((resolve)=>{
    window.googleTranslateElementInit=function(){
      new google.translate.TranslateElement(
        {pageLanguage:'en',includedLanguages:'en,kn,hi,mr',autoDisplay:false},
        'google_translate_element'
      );
      let tries=0, maxTries=60;
      const iv=setInterval(()=>{
        if(document.querySelector('.goog-te-combo')){
          clearInterval(iv); gteLoaded=true; resolve(true);
        }else if(++tries>=maxTries){
          clearInterval(iv); gteLoaded=true; resolve(true);
        }
      },100);
    };
    const s=document.createElement('script');
    s.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async=true;
    s.onerror=function(){ gteLoaded=false; resolve(false); };
    document.head.appendChild(s);
  });
  return window._gteReadyPromise;
}

/* Wire up the language menu (unchanged) */
(function(){
  const wrapper=document.getElementById('lwa-lang');
  if(!wrapper) return;
  const toggle=wrapper.querySelector('.lang-toggle');
  const menu=document.getElementById('lwa-lang-menu');
  if(!toggle||!menu) return;

  function openMenu(){ menu.style.display='block'; toggle.setAttribute('aria-expanded','true'); }
  function closeMenu(){ menu.style.display='none'; toggle.setAttribute('aria-expanded','false'); }

  async function onToggle(e){
    e.preventDefault(); e.stopPropagation();
    const open=menu.style.display==='block';
    if(open){ closeMenu(); return; }
    await loadGoogleTranslate();
    openMenu();
  }
  toggle.addEventListener('click', onToggle, {passive:false});
  toggle.addEventListener('touchstart', onToggle, {passive:false});

  menu.addEventListener('click', e=>e.stopPropagation(), {passive:true});
  menu.addEventListener('touchstart', e=>e.stopPropagation(), {passive:true});
  document.addEventListener('click', (e)=>{ if(!wrapper.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });

  wrapper.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const to=btn.getAttribute('data-lang');
      closeMenu();
      await loadGoogleTranslate();
      changeLanguage(to);
    });
  });
})();
