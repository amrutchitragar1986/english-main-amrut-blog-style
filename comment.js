/* =========================
   Comment Popup (centered, safe)
========================= */
function openAmrutCommentForm(){
  const url = "https://docs.google.com/forms/d/e/1FAIpQLSdfwLcC4JCgtet2XQ3y6zP2CglIJfB7Fh_Qp9jQTkgA31lv5Q/viewform?embedded=true";
  const w = 820, h = 1000;

  // Multi-monitor safe centering
  const dualLeft = window.screenLeft ?? screen.left ?? 0;
  const dualTop  = window.screenTop  ?? screen.top  ?? 0;
  const width  = window.innerWidth  || document.documentElement.clientWidth  || screen.width;
  const height = window.innerHeight || document.documentElement.clientHeight || screen.height;
  const left = Math.max(0, dualLeft + (width - w) / 2);
  const top  = Math.max(0, dualTop  + (height - h) / 2);

  const features = `scrollbars=yes,resizable=yes,width=${w},height=${h},top=${top},left=${left}`;
  const win = window.open(url, "amrutCommentForm", features);

  if (!win) {
    // Popup blocked → open a normal tab safely
    window.open(url, "_blank", "noopener,noreferrer");
    return false;
  }
  try { win.opener = null; win.focus(); } catch(e) {}
  return false;
}
