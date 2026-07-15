const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");
const header = document.querySelector(".site-header");

const getAnchorOffset = () => {
  if (!header) return 34;

  const headerStyle = window.getComputedStyle(header);
  const headerHeight = header.getBoundingClientRect().height;

  return headerStyle.position === "sticky" ? headerHeight + 34 : 34;
};

const scrollToAnchor = (hash, behavior = "smooth") => {
  if (!hash || hash === "#") return;

  // "Home" / skip-link point at #top, which is <main> wrapping every section.
  // Looking up a .section-heading inside it would land on the first section
  // (the demo), so send these straight to the very top (the hero).
  if (hash === "#top") {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : behavior });
    return;
  }

  const target = document.querySelector(hash);
  if (!target) return;

  const anchorTarget = target.querySelector(".section-heading") || target;
  const top = anchorTarget.getBoundingClientRect().top + window.scrollY - getAnchorOffset();

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion ? "auto" : behavior,
  });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    event.preventDefault();
    history.pushState(null, "", hash);
    scrollToAnchor(hash);
  });
});

const correctInitialHashScroll = () => {
  if (!window.location.hash) return;

  requestAnimationFrame(() => {
    window.setTimeout(() => scrollToAnchor(window.location.hash, "auto"), 80);
    window.setTimeout(() => scrollToAnchor(window.location.hash, "auto"), 360);
  });
};

if (document.readyState === "complete") {
  correctInitialHashScroll();
} else {
  window.addEventListener("load", correctInitialHashScroll);
}

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
