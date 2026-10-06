// @ts-nocheck
class KnrBeforeAfter extends HTMLElement {
  connectedCallback() {
    const range = this.querySelector('[data-knr-before-after-range]');
    const before = this.querySelector('.knr-before-after__image--before');
    const divider = this.querySelector('.knr-before-after__divider');

    if (!(range instanceof HTMLInputElement)) return;

    const update = () => {
      const position = `${range.value}%`;

      before?.style.setProperty(
        '--knr-before-after-position',
        position
      );

      divider?.style.setProperty(
        '--knr-before-after-position',
        position
      );
    };

    range.addEventListener('input', update);

    update();
  }
}

if (!customElements.get('knr-before-after')) {
  customElements.define('knr-before-after', KnrBeforeAfter);
}