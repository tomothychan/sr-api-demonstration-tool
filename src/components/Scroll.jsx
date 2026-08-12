// src/utils/scroll.js
export const smoothScrollTo = (element, targetTop, duration = 300) => {
  if (!element) return;
  const startTop = element.scrollTop;
  const distance = targetTop - startTop;
  let startTime = null;

  const animation = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Ease-out cubic curve
    const ease = 1 - Math.pow(1 - progress, 3);
    element.scrollTop = startTop + distance * ease;

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};