export function bindActionHandler(element, options = {}) {
  customElements.whenDefined("long-press").then(() => {
    const longpress = document.body.querySelector("long-press") as any;
    longpress.bind?.(element);
  });
  customElements.whenDefined("action-handler").then(() => {
    const actionHandler = document.body.querySelector("action-handler") as any;
    actionHandler.bind?.(element, options);
  });
  return element;
}
