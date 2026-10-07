/**
 * Form logic shared by the app's config-driven create and edit screens (same rules as
 * checkerp_web's ModuleCreateScreen / ModuleEditModal, without the antd form engine).
 */
import ModuleApi from "@/services/api/COMMON/module-api";
import { LIST_FIELD_TYPES, OPTION_FIELD_TYPES, type ModuleField } from "@/core/modules/module-screen-config";

/** Picklist entry: code = stored value, value = label (web b-select shape). */
export interface PickOption { code: string; value: string }
export type OptionLists = Record<string, PickOption[]>;

export function optionRow(field: ModuleField, r: Record<string, unknown>): PickOption {
	return { code: String(r[field.optionValueKey ?? "id"] ?? ""), value: String(r[field.optionLabelKey ?? "name"] ?? "") };
}

/** Static options now, remote ones (optionsTr) as they arrive; written into `target`. */
export function loadOptionLists(fields: ModuleField[], target: OptionLists): void {
	for (const field of fields) {
		if (!OPTION_FIELD_TYPES.has(field.type ?? "")) continue;
		if (field.options) {
			target[field.key] = field.options.map((o) => ({ code: o.value, value: o.label }));
		} else if (field.optionsTr) {
			ModuleApi.request(field.optionsTr, { pageNo: 1, pageSize: 100 }, {
				onSuccess: (payload) => {
					const rows = (payload[field.optionsListKey ?? "list"] ?? []) as Record<string, unknown>[];
					target[field.key] = rows.map((r) => optionRow(field, r));
				},
				onFail: () => { target[field.key] = []; }
			});
		}
	}
}

/** One payload carrying every dropdown list (editContextTr) → option lists. */
export function optionListsFromPayload(fields: ModuleField[], payload: Record<string, unknown>, target: OptionLists): void {
	for (const field of fields) {
		if (!OPTION_FIELD_TYPES.has(field.type ?? "")) continue;
		if (field.options) {
			target[field.key] = field.options.map((o) => ({ code: o.value, value: o.label }));
		} else {
			const rows = (payload[field.optionsListKey ?? "list"] ?? []) as Record<string, unknown>[];
			target[field.key] = rows.map((r) => optionRow(field, r));
		}
	}
}

/** images column may arrive as a JSON string (DB text) or already an array. */
export function parseImages(v: unknown): string[] {
	if (Array.isArray(v)) return v as string[];
	if (typeof v === "string" && v.trim()) {
		try {
			const a = JSON.parse(v);
			return Array.isArray(a) ? a : [];
		} catch {
			return [];
		}
	}
	return [];
}

/** Blank create form: list fields as [], defaults applied; a saved draft wins. */
export function initialForm(fields: ModuleField[], draft?: Record<string, unknown> | null): Record<string, unknown> {
	const form: Record<string, unknown> = { ...(draft ?? {}) };
	for (const field of fields) {
		if ((LIST_FIELD_TYPES.has(field.type ?? "") || field.type === "images") && !Array.isArray(form[field.key])) form[field.key] = [];
		if (field.defaultValue !== undefined && form[field.key] === undefined) form[field.key] = field.defaultValue;
	}
	return form;
}

/** Edit form prefilled from the detail, falling back to the list row. */
export function prefillForm(fields: ModuleField[], detail: Record<string, unknown> | null, record: Record<string, unknown>): Record<string, unknown> {
	const d = detail ?? {};
	const form: Record<string, unknown> = {};
	for (const field of fields) {
		if (field.type === "images") form[field.key] = parseImages(d[field.key] ?? record[field.key]);
		else if (LIST_FIELD_TYPES.has(field.type ?? "")) form[field.key] = d[field.key] ?? [];
		else form[field.key] = d[field.key] ?? record[field.key] ?? "";
	}
	form.isActive = Boolean(d.isActive ?? record.isActive ?? true);
	return form;
}

/** First required field left empty, or null when the form is complete. */
export function firstMissing(fields: ModuleField[], form: Record<string, unknown>): ModuleField | null {
	return fields.find((f) => {
		if (!f.required) return false;
		const v = form[f.key];
		return v === undefined || v === null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && !v.length);
	}) ?? null;
}

/** Labels the confirm screen shows for select-type values (label, not id). */
export function displayLabels(fields: ModuleField[], form: Record<string, unknown>, lists: OptionLists): Record<string, string> {
	const labels: Record<string, string> = {};
	for (const field of fields) {
		const opts = lists[field.key] ?? [];
		const v = form[field.key];
		if (field.type === "select" && v) {
			const match = opts.find((o) => o.code === v);
			if (match) labels[field.key] = match.value;
		} else if (field.type === "multiselect" && Array.isArray(v) && v.length) {
			labels[field.key] = (v as string[]).map((c) => opts.find((o) => o.code === c)?.value ?? c).join(", ");
		} else if (field.type === "customFields") {
			const text = ((v ?? []) as { fieldId: string; value: string }[])
				.filter((r) => r.value?.trim())
				.map((r) => `${opts.find((o) => o.code === r.fieldId)?.value ?? r.fieldId}: ${r.value.trim()}`)
				.join(" · ");
			if (text) labels[field.key] = text;
		}
	}
	return labels;
}
