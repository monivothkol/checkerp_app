import DOMPurify from "dompurify";
import { type Directive } from "vue";

/**
 * v-safe-html — like v-html, but the value is run through DOMPurify before it
 * touches the DOM, so any <script>, event-handler attribute or other XSS
 * payload is stripped while safe formatting tags (<b>, <br/>, <span>, ...)
 * survive. Use this anywhere HTML from a message/API/DB is rendered as markup.
 *
 * DOMPurify is pinned to >=3.4.0 (CVE-2026-41240 is patched in 3.4.0). This
 * directive uses the default sanitize() config only — it never combines
 * function-based ADD_TAGS with FORBID_TAGS, so it does not touch that CVE's
 * code path regardless.
 */
const render = (el: HTMLElement, value: unknown) => {
	const html = value === null || value === undefined ? "" : String(value);
	el.innerHTML = DOMPurify.sanitize(html);
};

export const safeHtml: Directive = {
	mounted(el: HTMLElement, binding) {
		render(el, binding.value);
	},
	updated(el: HTMLElement, binding) {
		if (binding.value !== binding.oldValue) {
			render(el, binding.value);
		}
	}
};
