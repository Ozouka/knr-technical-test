// @ts-check

class KnrAccordion extends HTMLElement {
  /** @type {HTMLDetailsElement | null} */
  details = null;

  /** @type {HTMLElement | null} */
  content = null;

  /** @type {Animation | null} */
  animation = null;

  /** @type {AbortController | null} */
  abortController = null;

  isClosing = false;

  connectedCallback() {
    const details = this.querySelector('details');
    const summary = this.querySelector('summary');
    const content = this.querySelector('.knr-accordion__content');
    if (!details || !summary || !(content instanceof HTMLElement)) return;

    this.details = details;
    this.content = content;

    this.abortController = new AbortController();
    summary.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        this.toggle();
      },
      { signal: this.abortController.signal }
    );
  }

  disconnectedCallback() {
    this.abortController?.abort();
    this.animation?.cancel();
  }

  toggle() {
    const details = this.details;
    if (!details) return;

    this.toggleTo(!details.open || this.isClosing);
  }

  /** @param {boolean} open */
  toggleTo(open) {
    const { details, content } = this;
    if (!details || !content) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      details.open = open;
      return;
    }

    const startHeight = content.getBoundingClientRect().height;
    this.animation?.cancel();
    this.isClosing = !open;
    if (open) details.open = true;

    content.style.overflow = 'hidden';
    const animation = content.animate(
      { height: [`${startHeight}px`, `${open ? content.scrollHeight : 0}px`] },
      { duration: 250, easing: 'ease', fill: 'forwards' }
    );
    this.animation = animation;

    animation.onfinish = () => {
      details.open = open;
      animation.cancel();
      content.style.overflow = '';
      this.animation = null;
      this.isClosing = false;
    };
  }
}

if (!customElements.get('knr-accordion')) {
  customElements.define('knr-accordion', KnrAccordion);
}