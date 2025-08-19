/**
 * Amrut Blog – Related Slider Script
 * Robust + scoped, no errors if elements are missing.
 */
(() => {
  const root = document.getElementById('related1');
  if (!root) return;

  const track = root.querySelector('.related-track');
  const slides = root.querySelectorAll('.related-card');
  const prevBtn = root.querySelector('.related-prev');
  const nextBtn = root.querySelector('.related-next');
  if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

  let index = 0;
  const total = slides.length;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  // Next button
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % total;
    update();
  });

  // Prev button
  prevBtn.addEventListener('click', () => {
    index = (index - 1 + total) % total;
    update();
  });

  // Keyboard support
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });
})();
