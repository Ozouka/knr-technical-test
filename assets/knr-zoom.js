// @ts-check

class KnrZoom extends HTMLElement {
  /** @type {AbortController | null} */
  abortController = null;

  connectedCallback() {
    const section = this.closest('.knr-product-main');
    const dialog = this.querySelector('dialog');
    const image = this.querySelector('img');
    if (!section || !dialog || !image) return;

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    section.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const button = target.closest('[data-knr-zoom]');
        if (!(button instanceof HTMLElement)) return;

        image.src = button.dataset.knrZoom ?? '';
        image.alt = button.closest('li')?.querySelector('img')?.alt ?? '';
        dialog.showModal();
      },
      { signal }
    );

    dialog.addEventListener('click', () => dialog.close(), { signal });
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }
}

if (!customElements.get('knr-zoom')) {
  customElements.define('knr-zoom', KnrZoom);
}