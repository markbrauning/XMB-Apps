// Simple helper to load HTML fragments into a mount point
async function loadFragment(url, mountSelector) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;
  const res = await fetch(url, { cache: "no-store" });
  mount.innerHTML = await res.text();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load header, footer, and settings fragments in parallel
  await Promise.all([
    loadFragment('header.html', '#header-mount'),
    loadFragment('footer.html', '#footer-mount'),
    loadFragment('settings.html', '#settings-mount'),
  ]);

  // Header parallax (moves relative with scroll)
  (function initHeaderParallax(){
    const header = document.getElementById('site-header');
    if (!header) return;
    let lastY = 0;
    const damp = 0.12;
    const tick = () => {
      const target = window.scrollY * 0.18;
      lastY += (target - lastY) * damp;
      header.style.transform = `translateY(${lastY.toFixed(2)}px)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();

  // Footer: dynamic year
  (function initFooterYear(){
    const ys = document.querySelectorAll('#site-footer .year');
    const y = new Date().getFullYear();
    ys.forEach(el => el.textContent = y);
  })();

  // After settings fragment exists, start the background graphics
  if (typeof window.initFluidBG === 'function') {
    window.initFluidBG();
  } else {
    console.warn('initFluidBG not found. Ensure bg.js is loaded before app.js.');
  }
});