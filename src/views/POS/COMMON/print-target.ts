// Print only the `.inv-print-target` element via window.print() (web only — hidden in the native shell).
const PRINT_CSS_ID = "inv-print-only";
const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  .inv-print-target, .inv-print-target * { visibility: visible !important; }
  .inv-print-target { position: absolute; left: 0; top: 0; display: block !important; }
}`;

/** Print with an optional extra stylesheet (e.g. the 80mm receipt page size) applied only for this print. */
export function printTarget(extraStyles = ""): void {
    if (!document.getElementById(PRINT_CSS_ID)) {
        const el = document.createElement("style");
        el.id = PRINT_CSS_ID;
        el.textContent = PRINT_CSS;
        document.head.appendChild(el);
    }
    const extra = extraStyles ? document.createElement("style") : null;
    if (extra) {
        extra.textContent = extraStyles;
        document.head.appendChild(extra);
    }
    window.print();
    extra?.remove();
}

/** Inject a stylesheet once (the A4 sheet is shared by every document so the preview matches print). */
export function injectStyles(id: string, css: string): void {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
}
