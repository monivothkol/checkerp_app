<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template v-if="(config.listFilters ?? []).length || exportConfig" #end>
				<ion-button v-if="exportConfig" @click="onExport">
					<ion-icon slot="icon-only" :icon="downloadOutline" />
				</ion-button>
				<ion-button v-if="(config.listFilters ?? []).length" @click="onOpenFilter">
					<ion-icon slot="icon-only" :icon="funnelOutline" />
				</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="400" @ion-input="onSearch" />
				</ion-toolbar>
				<div v-if="chips.length" class="mls_chips">
					<ion-chip v-for="c in chips" :key="c.key" @click="removeFilter(c.key)">
						<ion-label>{{ c.label }}: {{ c.value }}</ion-label>
						<ion-icon :icon="closeCircle" />
					</ion-chip>
				</div>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note v-if="totalCount" class="mls_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list class="scr_list" v-if="rows.length">
				<ion-item-sliding v-for="r in rows" :key="String(r[config.idKey])">
					<ion-item button :detail="true" @click="onDetail(r)">
						<ion-label>
							<p class="mls_code">{{ r[config.codeKey] }}</p>
							<h2>{{ r[config.nameKey] ?? "—" }}</h2>
							<p v-for="c in extraColumns" :key="c.dataIndex">{{ colTitle(c) }}: {{ cell(c, r) }}</p>
						</ion-label>
						<ion-badge v-if="'isActive' in r" slot="end" :color="r.isActive ? 'success' : 'medium'">
							{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}
						</ion-badge>
					</ion-item>
					<ion-item-options v-if="config.updateTr || config.deleteTr || (config.rowActions ?? []).length" side="end">
						<ion-item-option v-for="a in config.rowActions ?? []" :key="a.key" color="tertiary" @click="onRowAction(a, r)">{{ tr(a.labelKey) }}</ion-item-option>
						<ion-item-option v-if="config.updateTr" @click="onEdit(r)">{{ $t("EDIT.EDIT") }}</ion-item-option>
						<ion-item-option v-if="config.deleteTr" color="danger" @click="onDelete(r)">{{ $t("DELETE.DELETE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push(config.createRoute)">
					<ion-icon :icon="add" />
				</ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { type InfiniteScrollCustomEvent, type RefresherCustomEvent } from "@ionic/vue";
import { add, closeCircle, downloadOutline, funnelOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import ModuleApi from "@/services/api/COMMON/module-api";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import ModuleEditModal from "@/core/components/module/ModuleEditModal.vue";
import ModuleFilterPanel from "@/core/components/module/ModuleFilterPanel.vue";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import type { ModuleColumn, ModuleListFilter, ModuleRowAction, ModuleScreenConfig } from "@/core/modules/module-screen-config";

/** Config-driven list (mobile twin of checkerp_web's ModuleListScreen): search, filters, paged scroll, row actions. */
defineOptions({ name: "ModuleListScreen" });

type Row = Record<string, any>;

const props = defineProps<{ config: ModuleScreenConfig }>();
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`${props.config.listTr}.${key}`);

const keyword = ref("");
const filters = ref<Record<string, unknown>>({});
const loadedOptions = reactive<Record<string, { value: unknown; label: string }[]>>({});

/** Code + name are the item title; the rest of the configured columns are listed under it. */
const extraColumns = computed(() => props.config.columns.filter((c) =>
	c.key !== "action" && ![props.config.codeKey, props.config.nameKey, "isActive"].includes(c.dataIndex)));

const colTitle = (c: ModuleColumn) => (c.titleKey ? tr(c.titleKey) : c.title);
function cell(c: ModuleColumn, r: Row): string {
	const v = r[c.dataIndex];
	if (v === undefined || v === null || v === "") return "—";
	if (c.type === "Currency") return UT.currency(v, "USD");
	if (typeof v === "boolean") return v ? t("EDIT.YES") : t("EDIT.NO");
	return String(v);
}

function optionsFor(f: ModuleListFilter): { value: unknown; label: string }[] {
	if (f.options) return f.options.map((o) => ({ value: o.value, label: o.labelKey ? tr(o.labelKey) : o.label }));
	return loadedOptions[f.key] ?? [];
}
const chips = computed(() => (props.config.listFilters ?? [])
	.filter((f) => filters.value[f.key] !== undefined)
	.map((f) => {
		const v = filters.value[f.key];
		const value = Array.isArray(v) ? `${v[0]} – ${v[1]}` : optionsFor(f).find((o) => o.value === v)?.label ?? String(v);
		return { key: f.key, label: tr(f.labelKey), value };
	}));

/** dateRange filters expand into their fromKey/toKey params. */
function activeFilters(): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const f of props.config.listFilters ?? []) {
		const v = filters.value[f.key];
		if (v === undefined) continue;
		if (f.type === "dateRange" && Array.isArray(v)) {
			out[f.fromKey ?? "fromDate"] = v[0];
			out[f.toKey ?? "toDate"] = v[1];
		} else {
			out[f.key] = v;
		}
	}
	return out;
}

const paged = usePagedList<Row>((pageNo, pageSize) => requestAsync<Record<string, any>>((l) =>
	ModuleApi.request(props.config.listApi ?? props.config.listTr, {
		searchKeyword: keyword.value.trim() || undefined,
		...activeFilters(),
		pageNo,
		pageSize
	}, l)).then((payload) => ({ list: (payload[props.config.listKey] ?? []) as Row[], totalCount: payload.totalCount })));
const { rows, totalCount, loading, hasMore } = paged;

const onSearch = () => void paged.reload();
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await paged.reload();
	await ev.target.complete();
}
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}

function loadFilterOptions(): void {
	for (const f of props.config.listFilters ?? []) {
		if (!f.optionsTr) continue;
		ModuleApi.request(f.optionsTr, { pageNo: 1, pageSize: 100 }, {
			onSuccess: (payload) => {
				const list = (payload[f.optionsListKey ?? ""] ?? []) as Row[];
				loadedOptions[f.key] = list.map((r) => ({ value: r[f.optionValueKey ?? ""], label: String(r[f.optionLabelKey ?? ""] ?? "") }));
			}
		});
	}
}

function onOpenFilter(): void {
	const optionsByKey: Record<string, { value: unknown; label: string }[]> = {};
	for (const f of props.config.listFilters ?? []) optionsByKey[f.key] = optionsFor(f);
	POP.showPopup<Record<string, unknown>>(ModuleFilterPanel, {
		title: t("LIST.FILTER"),
		props: { filters: props.config.listFilters ?? [], values: { ...filters.value }, optionsByKey, listTr: props.config.listTr }
	}).promise.then((r) => {
		filters.value = r.data ?? {};
		onSearch();
	}).catch(() => undefined);
}
function removeFilter(key: string): void {
	const next = { ...filters.value };
	delete next[key];
	filters.value = next;
	onSearch();
}

const exportConfig = computed(() => EXPORT_CONFIGS[props.config.module] ?? null);
function onExport(): void {
	if (!exportConfig.value) return;
	POP.showPopup(ExportModal, { title: t(`${exportConfig.value.trKey}.PAGE_TITLE`), props: { config: exportConfig.value } }).promise.catch(() => undefined);
}

function onDetail(r: Row): void {
	router.push(`${props.config.detailRoute}?${props.config.codeKey}=${encodeURIComponent(String(r[props.config.codeKey] ?? ""))}`);
}
function onEdit(r: Row): void {
	POP.showPopup(ModuleEditModal, { title: `${t("EDIT.EDIT")} — ${tr("PAGE_TITLE")}`, props: { config: props.config, record: r } })
		.promise.then(onSearch).catch(() => undefined);
}
/** Soft delete (v1 parity) behind an explicit confirm. */
function onDelete(r: Row): void {
	const c = props.config;
	if (!c.deleteTr) return;
	POP.confirm({
		title: t("DELETE.DELETE"),
		content: t("DELETE.CONFIRM", { name: r[c.nameKey] ?? r[c.codeKey] ?? "" }),
		okBtn: {
			btnText: t("DELETE.DELETE"),
			onClick: () => ModuleApi.request(c.deleteApi ?? c.deleteTr as string, { [c.idKey]: r[c.idKey] }, {
				onSuccess: onSearch,
				onFail: (e) => POP.apiError(e, t("DELETE.FAILED"))
			})
		}
	});
}
function onRowAction(a: ModuleRowAction, r: Row): void {
	POP.showPopup(a.component, { title: tr(a.labelKey), props: a.props(r) }).promise.then(onSearch).catch(() => undefined);
}

onMounted(loadFilterOptions);
// Reload on every visit so rows created/edited on other screens show up.
useViewEnter(onSearch);
</script>

<style scoped>
.mls_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 8px 8px; }
.mls_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.mls_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
