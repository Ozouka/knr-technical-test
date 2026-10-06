// @ts-check

class KnrProductVariants extends HTMLElement {
  /** @type {AbortController | null} */
  abortController = null;
  /** @type {AbortController | null} */
  request = null;

  connectedCallback() {
    this.abortController = new AbortController();
    this.addEventListener(
      'change',
      (event) => this.onChange(event),
      {
        signal: this.abortController.signal,
      }
    );
  }

  disconnectedCallback() {
    this.abortController?.abort();
    this.request?.abort();
  }

  /** @param {Event} event */
  async onChange(event) {
    const input = event.target;
    const section = this.closest('.knr-product-main');
    if (
      !(input instanceof HTMLInputElement) ||
      !(section instanceof HTMLElement)
    )
      return;

    const idInput = section.querySelector(
      '.knr-product-main__form input[name="id"]'
    );
    if (!(idInput instanceof HTMLInputElement)) return;

    const variants = JSON.parse(
      this.querySelector('script[type="application/json"]')?.textContent ?? '[]'
    );
    const current = variants.find(
      (/** @type {any} */ v) => String(v.id) === idInput.value
    );
    if (!current) return;

    const options = [...current.options];
    options[0] = input.value;
    const variant = variants.find((/** @type {any} */ v) =>
      v.options.every(
        (/** @type {string} */ option, /** @type {number} */ i) =>
          option === options[i]
      )
    );
    if (!variant) return;

    idInput.value = String(variant.id);

    const url = new URL(window.location.href);
    url.searchParams.set('variant', String(variant.id));
    history.replaceState({}, '', url);

    this.request?.abort();
    this.request = new AbortController();

    try {
      const response = await fetch(
        `${url.pathname}?variant=${variant.id}&section_id=${section.dataset.sectionId}`,
        {
          signal: this.request.signal,
        }
      );
      const doc = new DOMParser().parseFromString(
        await response.text(),
        'text/html'
      );

      const nextPrices = doc.querySelectorAll('.knr-product-main__price');
      section.querySelectorAll('.knr-product-main__price').forEach(
        (price, i) => {
          if (nextPrices[i]) price.innerHTML = nextPrices[i].innerHTML;
        }
      );

      const atc = section.querySelector('.knr-product-main__atc');
      const nextAtc = doc.querySelector('.knr-product-main__atc');
      if (
        atc instanceof HTMLButtonElement &&
        nextAtc instanceof HTMLButtonElement
      ) {
        atc.disabled = nextAtc.disabled;
        atc.textContent = nextAtc.textContent;
      }
    } catch (error) {
      if (
        !(
          error instanceof DOMException &&
          error.name === 'AbortError'
        )
      )
        console.error(error);
    }
  }
}

if (!customElements.get('knr-product-variants')) {
  customElements.define('knr-product-variants', KnrProductVariants);
}