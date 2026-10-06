class KnrReview extends HTMLElement {
  constructor() {
    super();
    this.loadMoreButton = this.querySelector('[data-knr-load-more]');
    this.items = Array.from(
      this.querySelectorAll('.knr-review__item')
    );
    this.step = 3;
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  connectedCallback() {
    this.loadMoreButton?.addEventListener(
      'click',
      this.handleLoadMore
    );
  }

  disconnectedCallback() {
    this.loadMoreButton?.removeEventListener(
      'click',
      this.handleLoadMore
    );
  }

  handleLoadMore() {
    const hiddenItems = this.items.filter((item) => item.hidden);
    hiddenItems
      .slice(0, this.step)
      .forEach((item) => {
        item.hidden = false;
      });

    const remainingItems = this.items.some((item) => item.hidden);
    if (!remainingItems) {
      this.loadMoreButton?.remove();
      this.loadMoreButton = null;
    }
  }
}

if (!customElements.get('knr-review')) {
  customElements.define('knr-review', KnrReview);
}