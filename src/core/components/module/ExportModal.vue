<template>
	<div>
		<ion-note class="exp_hint">{{ tr("HINT") }}</ion-note>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="format" :label="tr('FORMAT')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="f in config.formats" :key="f" :value="f">{{ f === "excel" ? "Excel" : "PDF" }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item v-if="format === 'pdf'">
				<ion-select v-model="orientation" :label="tr('ORIENTATION')" label-placement="stacked" interface="action-sheet">
					<ion-select-option value="portrait">{{ tr("VERTICAL") }}</ion-select-option>
					<ion-select-option value="landscape">{{ tr("HORIZONTAL") }}</ion-select-option>
				</ion-select>
			</ion-item>
			<template v-if="config.dateFilter">
				<ion-item>
					<ion-select v-model="dateRange" :label="tr('DATE')" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="d in DATE_RANGES" :key="d" :value="d">{{ tr(`DATE_${d.toUpperCase()}`) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<template v-if="dateRange === 'custom'">
					<ion-item><ion-input v-model="customRange[0]" type="date" :label="`${tr('DATE')} ▸`" label-placement="stacked" /></ion-item>
					<ion-item><ion-input v-model="customRange[1]" type="date" :label="`${tr('DATE')} ◂`" label-placement="stacked" /></ion-item>
				</template>
			</template>
			<ion-item>
				<ion-select v-model="sortField" :label="tr('SORT_BY')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="f in config.fields" :key="f.field" :value="f.field">{{ f.header }}</ion-select-option>
				</ion-select>
				<ion-button slot="end" fill="clear" size="small" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">{{ tr(sortDir === "asc" ? "ASC" : "DESC") }}</ion-button>
			</ion-item>
			<ion-list-header>
				<ion-label>{{ tr("FIELDS") }}</ion-label>
				<ion-button size="small" @click="selected = config.fields.map((f) => f.field)">{{ tr("SELECT_ALL") }}</ion-button>
				<ion-button size="small" @click="selected = []">{{ tr("CLEAR") }}</ion-button>
			</ion-list-header>
			<ion-item v-for="f in config.fields" :key="f.field">
				<ion-checkbox :checked="selected.includes(f.field)" justify="space-between" @ion-change="toggle(f.field)">{{ f.header }}</ion-checkbox>
			</ion-item>
		</ion-list>
		<ion-note v-if="!selected.length" color="danger">{{ tr("PICK_ONE") }}</ion-note>
		<div class="exp_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="loading || !selected.length" @click="onExport">{{ tr("EXPORT") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";
import { getPref, setPref } from "@/core/utilities/pref";
import ModuleApi from "@/services/api/COMMON/module-api";
import type { ExportConfig, ExportFormat } from "@/core/modules/export-config";

/** Export a list to Excel/PDF (same presets, payload and saved prefs as checkerp_web's ExportModal). */
defineOptions({ name: "ExportModal" });

type Orientation = "landscape" | "portrait";
type DateRange = "all" | "today" | "7d" | "3m" | "custom";
interface ExportPrefs { format: ExportFormat; orientation: Orientation; sortField: string; sortDir: "asc" | "desc"; selected: string[]; dateRange: DateRange; customRange: string[] }
const DATE_RANGES: DateRange[] = ["today", "7d", "3m", "all", "custom"];

const props = withDefaults(defineProps<{ config: ExportConfig; params?: Record<string, unknown> }>(), { params: () => ({}) });
const emit = defineEmits<{ ok: [Record<string, unknown>]; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`EXPORT.${key}`);

/** Saved preset, validated against the current config. */
function loadPrefs(): Partial<ExportPrefs> {
	const p = getPref<Partial<ExportPrefs>>(`export:${props.config.trKey}`, {});
	const fields = props.config.fields.map((f) => f.field);
	const out: Partial<ExportPrefs> = {};
	if (p.format && props.config.formats.includes(p.format)) out.format = p.format;
	if (p.orientation === "portrait" || p.orientation === "landscape") out.orientation = p.orientation;
	if (p.sortField && fields.includes(p.sortField)) out.sortField = p.sortField;
	if (p.sortDir === "asc" || p.sortDir === "desc") out.sortDir = p.sortDir;
	if (Array.isArray(p.selected) && p.selected.some((f) => fields.includes(f))) out.selected = p.selected.filter((f) => fields.includes(f));
	if (DATE_RANGES.includes(p.dateRange as DateRange)) out.dateRange = p.dateRange;
	if (Array.isArray(p.customRange)) out.customRange = p.customRange;
	return out;
}

const saved = loadPrefs();
const format = ref<ExportFormat>(saved.format ?? props.config.formats[0]);
const orientation = ref<Orientation>(saved.orientation ?? "portrait");
const sortField = ref(saved.sortField ?? props.config.fields[0]?.field ?? "");
const sortDir = ref<"asc" | "desc">(saved.sortDir ?? "asc");
const selected = ref<string[]>(saved.selected ?? props.config.fields.filter((f) => f.default).map((f) => f.field));
const dateRange = ref<DateRange>(saved.dateRange ?? (props.config.defaultDateRange ?? "today"));
const customRange = ref<string[]>(saved.customRange ?? ["", ""]);
const loading = ref(false);

watch([format, orientation, sortField, sortDir, selected, dateRange, customRange], () => setPref(`export:${props.config.trKey}`, {
	format: format.value, orientation: orientation.value, sortField: sortField.value, sortDir: sortDir.value,
	selected: selected.value, dateRange: dateRange.value, customRange: customRange.value
}), { deep: true });

function toggle(field: string): void {
	selected.value = selected.value.includes(field) ? selected.value.filter((f) => f !== field) : [...selected.value, field];
}

/** Preset date range → { from, to } as YYYY-MM-DD (empty = all time). */
function dateBounds(): { from?: string; to?: string } {
	const pad = (n: number) => String(n).padStart(2, "0");
	const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	const now = new Date();
	const from = new Date();
	if (dateRange.value === "today") return { from: fmt(now), to: fmt(now) };
	if (dateRange.value === "7d") { from.setDate(from.getDate() - 6); return { from: fmt(from), to: fmt(now) }; }
	if (dateRange.value === "3m") { from.setMonth(from.getMonth() - 3); return { from: fmt(from), to: fmt(now) }; }
	if (dateRange.value === "custom") return { from: customRange.value[0] || undefined, to: customRange.value[1] || undefined };
	return {};
}

function onExport(): void {
	if (!selected.value.length || loading.value) return;
	loading.value = true;
	const payload: Record<string, unknown> = {
		...props.params,
		// The picker's declared order, regardless of tap order.
		fields: props.config.fields.map((f) => f.field).filter((f) => selected.value.includes(f)),
		sortField: sortField.value,
		sortDir: sortDir.value,
		format: format.value,
		orientation: orientation.value
	};
	// Only date-scoped modules send a range; otherwise the backend would filter to today.
	if (props.config.dateFilter) {
		const b = dateBounds();
		payload.dateFrom = b.from;
		payload.dateTo = b.to;
	}
	ModuleApi.request(props.config.trCode, payload, {
		onSuccess: (p) => {
			loading.value = false;
			// System browser (native) / new tab (web); R2 serves Content-Disposition: attachment.
			if (p.url) void BizCheckMobileSystem.callBrowser({ url: String(p.url) });
			emit("ok", p);
		},
		onFail: (e) => {
			loading.value = false;
			POP.apiError(e, tr("FAILED"));
		}
	}, { enableLoading: true });
}
</script>

<style scoped>
.exp_hint { display: block; font-size: 12px; padding: 0 0 8px; }
.exp_btns { display: flex; gap: 8px; padding: 16px 0; }
.exp_btns ion-button { flex: 1; }
</style>
