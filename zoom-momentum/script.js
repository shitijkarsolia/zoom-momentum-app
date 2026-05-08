const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  document.documentElement.classList.add("reveal-active");

  const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
  );

  revealElements.forEach((element) => {
    const { top } = element.getBoundingClientRect();

    if (top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
      return;
    }

    observer.observe(element);
  });
}
