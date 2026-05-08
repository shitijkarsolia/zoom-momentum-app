const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");

const header = document.querySelector(".site-header");
if (header) {
  const updateScrolled = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateScrolled();
  window.addEventListener("scroll", updateScrolled, { passive: true });
}

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
