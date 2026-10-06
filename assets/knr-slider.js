// @ts-check

class KnrSlider extends HTMLElement {
  /** @type {Element | null} */
  track = null;

  /** @type {HTMLButtonElement | null} */
  prev = null;

  /** @type {HTMLButtonElement | null} */
  next = null;

  /** @type {HTMLButtonElement[]} */
  dots = [];

  /** @type {AbortController | null} */
  abortController = null;

  /** @type {ResizeObserver | null} */
  resizeObserver = null;

  /** @type {number | null} */
  autoplayTimer = null;

  connectedCallback() {
    const track = this.querySelector('[data-knr-track]');
    if (!track) return;
    this.track = track;

    const prev = this.querySelector('[data-knr-prev]');
    const next = this.querySelector('[data-knr-next]');
    this.prev = prev instanceof HTMLButtonElement ? prev : null;
    this.next = next instanceof HTMLButtonElement ? next : null;

    const dotsId = this.getAttribute('dots');
    const dotsContainer = dotsId ? document.getElementById(dotsId) : null;
    this.dots = dotsContainer ? [...dotsContainer.querySelectorAll('button')] : [];

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.prev?.addEventListener('click', () => this.go(-1), { signal });
    this.next?.addEventListener('click', () => this.go(1), { signal });
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goTo(index), { signal });
    });
    track.addEventListener('scroll', () => this.update(), { passive: true, signal });

    this.addEventListener('mouseenter', () => this.stopAutoplay(), { signal });
    this.addEventListener('mouseleave', () => this.startAutoplay(), { signal });
    this.addEventListener('focusin', () => this.stopAutoplay(), { signal });
    this.addEventListener('focusout', () => this.startAutoplay(), { signal });

    this.resizeObserver = new ResizeObserver(() => this.update());
    this.resizeObserver.observe(track);

    this.update();
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
    this.abortController?.abort();
    this.resizeObserver?.disconnect();
  }

  /** @returns {number} */
  get step() {
    const track = this.track;
    const slide = track?.firstElementChild;
    if (!track || !slide) return 0;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  }

  /** @param {number} direction */
  go(direction) {
    this.track?.scrollBy({ left: direction * this.step, behavior: 'smooth' });
  }

  /** @param {number} index */
  goTo(index) {
    this.track?.scrollTo({ left: index * this.step, behavior: 'smooth' });
  }

  advance() {
    const track = this.track;
    if (!track) return;

    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    if (atEnd) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      this.go(1);
    }
  }

  startAutoplay() {
    const seconds = Number(this.getAttribute('autoplay'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.autoplayTimer !== null || !seconds || reduceMotion) return;

    this.autoplayTimer = window.setInterval(() => this.advance(), seconds * 1000);
  }

  stopAutoplay() {
    if (this.autoplayTimer === null) return;

    window.clearInterval(this.autoplayTimer);
    this.autoplayTimer = null;
  }

  update() {
    const track = this.track;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    if (this.prev) this.prev.disabled = scrollLeft <= 1;
    if (this.next) this.next.disabled = scrollLeft + clientWidth >= scrollWidth - 1;

    const step = this.step;
    const current = step > 0 ? Math.round(scrollLeft / step) : 0;
    this.dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === current));
    });
  }
}

if (!customElements.get('knr-slider')) {
  customElements.define('knr-slider', KnrSlider);
}