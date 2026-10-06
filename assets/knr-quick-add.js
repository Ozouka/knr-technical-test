// @ts-check

/** @param {number} count */
function renderCartBadge(count) {
  const bubble = document.querySelector('.knr-header__bubble');
  const counter = document.querySelector('.knr-header__bubble-count');
  if (!bubble || !counter) return;

  counter.textContent = String(count);
  counter.classList.toggle('hidden', count === 0);
  bubble.classList.toggle('visually-hidden', count === 0);
}

class KnrQuickAdd extends HTMLElement {
  /** @type {AbortController | null} */
  abortController = null;

  connectedCallback() {
    const form = this.querySelector('form');
    if (!form) return;

    this.abortController = new AbortController();
    const { signal } = this.abortController;
    form.addEventListener('submit', (event) => this.onSubmit(event, form), { signal });
    this.addEventListener('change', (event) => this.onVariantChange(event), { signal });
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }

  /** @param {Event} event */
  onVariantChange(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.price) return;

    const price = this.querySelector('[data-knr-price]');
    if (price) price.textContent = input.dataset.price;

    const button = this.querySelector('button[type="submit"]');
    if (button instanceof HTMLButtonElement) button.disabled = input.dataset.available !== 'true';
  }

  /**
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   */
  async onSubmit(event, form) {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    if (button instanceof HTMLButtonElement) button.disabled = true;

    const root = /** @type {any} */ (window).Shopify?.routes?.root ?? '/';

    try {
      const addResponse = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!addResponse.ok) throw new Error(`Ajout au panier refusé (${addResponse.status})`);

      const cart = await (await fetch(`${root}cart.js`)).json();
      renderCartBadge(cart.item_count);

      try {
        // @ts-ignore : module résolu par l'import map de Horizon
        const { CartUpdateEvent } = await import('@theme/events');
        document.dispatchEvent(
          new CartUpdateEvent(cart, 'knr-quick-add', {
            itemCount: cart.item_count,
            source: 'knr-quick-add',
          })
        );
      } catch (error) {
        console.warn('CartUpdateEvent indisponible', error);
      }

      const drawer = /** @type {any} */ (document.querySelector('cart-drawer-component'));
      drawer?.open?.();
    } catch (error) {
      console.error(error);
    } finally {
      if (button instanceof HTMLButtonElement) button.disabled = false;
    }
  }
}

if (!customElements.get('knr-quick-add')) {
  customElements.define('knr-quick-add', KnrQuickAdd);
}