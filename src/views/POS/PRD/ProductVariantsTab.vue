<template>
	<div class="pv_tab">
		<ion-progress-bar v-if="store.loading" type="indeterminate" />
		<ion-item v-if="store.failed" lines="none" class="scr_item">
			<ion-label color="danger" class="ion-text-wrap">{{ t("PRD50000.VARIANT.LOAD_FAILED") }}</ion-label>
			<ion-button slot="end" size="small" @click="store.load(props.productId)">{{ t("PRD50000.VARIANT.RETRY") }}</ion-button>
		</ion-item>

		<h3 class="pv_sec">{{ tr("ATTRIBUTES") }}</h3>
		<p class="pv_hint">{{ tr("ATTRIBUTES_HINT") }}</p>
		<div v-for="(a, i) in store.attributes" :key="a.attributeId ?? 'new-' + i" class="pv_box">
			<ion-item lines="none">
				<ion-input v-model="a.attributeName" :placeholder="tr('ATTRIBUTE_NAME')" :maxlength="100" :disabled="readonly" @ion-input="sync" />
				<ion-button v-if="!readonly" slot="end" fill="clear" color="danger" :aria-label="tr('REMOVE')" @click="onRemoveAttribute(i)">
					<ion-icon slot="icon-only" :icon="trashOutline" />
				</ion-button>
			</ion-item>
			<div class="pv_chips">
				<ion-chip v-for="(o, oi) in a.options" :key="o" :disabled="readonly" @click="!readonly && removeOption(i, oi)">
					<ion-label>{{ o }}</ion-label>
					<ion-icon v-if="!readonly" :icon="closeCircle" />
				</ion-chip>
			</div>
			<ion-item v-if="!readonly" lines="none">
				<ion-input
					:value="pending[i] ?? ''"
					:placeholder="tr('OPTIONS')"
					enterkeyhint="done"
					@ion-input="onOptionInput(i, String($event.detail.value ?? ''))"
					@keyup.enter="commitOption(i)"
					@ion-blur="commitOption(i)" />
			</ion-item>
		</div>
		<div v-if="!readonly" class="pv_actions">
			<ion-button size="small" fill="outline" @click="onAddAttribute"><ion-icon slot="start" :icon="add" />{{ tr("ADD_ATTRIBUTE") }}</ion-button>
			<ion-button size="small" fill="outline" :disabled="!store.attributes.length" @click="onGenerate">{{ tr("GENERATE") }}</ion-button>
		</div>
		<p class="pv_hint">{{ tr("DRAFT_HINT") }}</p>

		<!-- variant-less stock to split across the new variants -->
		<div v-if="!readonly && store.onHand.length && store.variants.length">
			<h3 class="pv_sec">{{ tr("ALLOCATE_TITLE") }}</h3>
			<p class="pv_hint">{{ tr("ALLOCATE_HINT") }}</p>
			<div v-for="row in store.onHand" :key="row.inventoryId" class="pv_box">
				<div class="pv_alloc_head">
					<strong>{{ row.inventoryName }}</strong>
					<span>{{ tr("ON_HAND") }} {{ num(row.quantity) }}</span>
				</div>
				<ion-item v-for="v in store.variants" :key="v.rowKey" lines="none">
					<ion-input
						type="number"
						inputmode="numeric"
						min="0"
						:max="Number(row.quantity)"
						:label="v.variantName || Object.values(v.attributes).join(' / ') || tr('NEW')"
						:value="store.allocated[row.inventoryId]?.[v.rowKey ?? ''] ?? 0"
						@ion-input="onAllocate(row.inventoryId, v.rowKey ?? '', Number($event.detail.value || 0), Number(row.quantity))" />
				</ion-item>
				<p class="pv_alloc_left" :class="{ pv_danger: leftOf(row.inventoryId) > 0 }">
					{{ leftOf(row.inventoryId) > 0 ? tr("WILL_BE_WRITTEN_OFF") + " " + num(leftOf(row.inventoryId)) : tr("ALL_ALLOCATED") }}
				</p>
			</div>
		</div>

		<div class="pv_list_head">
			<h3 class="pv_sec">{{ tr("VARIANTS") }} ({{ store.variants.length }})</h3>
			<ion-button v-if="!readonly" size="small" :disabled="!!store.draft" @click="store.startAdd"><ion-icon slot="start" :icon="add" />{{ tr("ADD_VARIANT") }}</ion-button>
		</div>

		<template v-for="r in store.rows" :key="r.rowKey ?? 'draft'">
			<!-- inline editor for the row being added/edited -->
			<div v-if="isEditing(r) && store.draft" class="pv_box pv_edit">
				<ion-item v-for="col in attributeColumns" :key="col">
					<ion-select v-model="store.draft.attributes[col]" :label="col" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="o in optionsFor(col)" :key="o" :value="o">{{ o }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="store.draft.variantCode" :label="tr('COL_CODE')" label-placement="stacked" :placeholder="tr('AUTO_CODE')" /></ion-item>
				<ion-item><ion-input v-model="store.draft.variantCodeSecondary" :label="tr('COL_SECONDARY')" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="store.draft.variantName" :label="tr('COL_NAME')" label-placement="stacked" :placeholder="tr('AUTO_NAME')" /></ion-item>
				<ion-item><ion-input v-model="store.draft.barcode" :label="tr('COL_BARCODE')" label-placement="stacked" /></ion-item>
				<ion-item v-for="p in PRICES" :key="p.key">
					<ion-input
						type="number" inputmode="decimal" min="0" step="0.01"
						:label="tr(p.label)" label-placement="stacked" :placeholder="tr('PRODUCT_PRICE')"
						:value="store.draft[p.key] ?? ''"
						@ion-input="setPrice(p.key, $event.detail.value)" />
				</ion-item>
				<ion-item><ion-toggle v-model="store.draft.isActive">{{ tr("COL_STATUS") }}</ion-toggle></ion-item>
				<div class="pv_actions">
					<ion-button size="small" fill="outline" @click="store.cancelEdit">{{ tr("CANCEL") }}</ion-button>
					<ion-button size="small" @click="onSaveDraft">{{ tr("APPLY") }}</ion-button>
				</div>
			</div>

			<ion-item-sliding v-else :disabled="readonly">
				<ion-item>
					<ion-label>
						<p class="pv_code">{{ r.variantCode || tr("AUTO_CODE") }}<template v-if="r.variantCodeSecondary"> · {{ r.variantCodeSecondary }}</template></p>
						<h3>{{ r.variantName || comboName(r) || "—" }}</h3>
						<p v-if="attributeColumns.length">{{ attributeColumns.map((c) => `${c}: ${r.attributes?.[c] ?? "—"}`).join(" · ") }}</p>
						<p v-if="r.barcode">{{ tr("COL_BARCODE") }}: {{ r.barcode }}</p>
						<p>
							<template v-for="(p, pi) in PRICES" :key="p.key">{{ pi ? " · " : "" }}{{ tr(p.label) }}: {{ hasPrice(r[p.key]) ? money(r[p.key]) : "—" }}</template>
						</p>
						<p>{{ tr("COL_STOCK") }}: {{ num(stockOf(r)) }}</p>
					</ion-label>
					<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ tr(r.isActive ? "ACTIVE" : "INACTIVE") }}</ion-badge>
				</ion-item>
				<ion-item-options v-if="!readonly" side="end">
					<ion-item-option :disabled="!!store.draft" @click="!store.draft && store.startEdit(r)">{{ tr("EDIT") }}</ion-item-option>
					<ion-item-option color="danger" @click="onRemove(r)">{{ tr("REMOVE") }}</ion-item-option>
				</ion-item-options>
			</ion-item-sliding>
		</template>
		<bm-empty-state v-if="!store.rows.length && !store.loading" />
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { add, closeCircle, trashOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { PRD50000VariantStore } from "@/store/POS/PRD/PRD50000VariantStore";
import type { ProductVariant, VariantDraft } from "@/models/POS/PRD/ProductVariant";

/** PRD50000 Variants tab: attributes/options editor, generate, and inline add/edit/remove of variants (draft until the form is saved). */
defineOptions({ name: "ProductVariantsTab" });

type PriceKey = "sellingPrice" | "costPrice" | "wholesalePrice";
const PRICES: { key: PriceKey; label: string }[] = [
	{ key: "sellingPrice", label: "COL_SELLING" },
	{ key: "costPrice", label: "COL_COST" },
	{ key: "wholesalePrice", label: "COL_WHOLESALE" }
];

const props = withDefaults(defineProps<{
	/** Edit: load this product's saved set. Create: omit and start empty. */
	productId?: string;
	/** Detail screens show the set without letting it be changed. */
	readonly?: boolean;
}>(), { productId: "", readonly: false });
const emit = defineEmits<{ "update:value": [VariantDraft]; ready: [boolean] }>();

const { t } = useI18n();
const tr = (key: string) => t(`PRD50000.VARIANT.${key}`);
const store = PRD50000VariantStore();
/** Option text being typed per attribute row (the web's tags input). */
const pending = reactive<Record<number, string>>({});

onMounted(() => store.load(props.productId));
// The form submits whatever was last emitted, so ANY change to the set has to reach it.
// Never hand the form the empty set the store holds while the saved one is loading.
watch(() => store.payload, (value) => { if (store.loaded) emit("update:value", value); }, { deep: true });
// Lets the form keep Save disabled until the saved set is in.
watch(() => store.loaded, (loaded) => {
	emit("ready", loaded);
	if (loaded) emit("update:value", store.payload);
}, { immediate: true });

/** One entry per attribute — same name twice (a typo) must not make two. */
const attributeColumns = computed(() => {
	const seen = new Set<string>();
	return store.attributes
		.filter((a) => a.attributeName.trim() && a.options.length)
		.map((a) => a.attributeName.trim())
		.filter((n) => !seen.has(n.toLowerCase()) && !!seen.add(n.toLowerCase()));
});

const sync = () => { if (store.loaded) emit("update:value", store.payload); };
const isEditing = (r: ProductVariant) => !!store.draft && store.draft.rowKey === r.rowKey;
const comboName = (r: ProductVariant) => Object.values(r.attributes ?? {}).filter(Boolean).join(" / ");
const optionsFor = (name: string) => store.attributes.find((x) => x.attributeName.trim() === name)?.options ?? [];
const hasPrice = (v: unknown) => v !== null && v !== undefined && v !== "";
const money = (v: unknown) => `$ ${Number(v ?? 0).toFixed(2)}`;
const num = (v: unknown) => Number(v ?? 0).toLocaleString();

/** Stock across ALL inventories: what is on the shelf plus what this form allocates. */
function stockOf(r: ProductVariant): number {
	const allocated = Object.values(store.allocated).reduce((sum, perInventory) => sum + (perInventory[r.rowKey ?? ""] ?? 0), 0);
	return Number(r.stockQuantity ?? 0) + allocated;
}
const leftOf = (inventoryId: string) => store.remaining.find((r) => r.inventoryId === inventoryId)?.left ?? 0;

/** A comma ends an option, like the web's tags input token separator. */
function onOptionInput(i: number, v: string): void {
	pending[i] = v;
	if (v.includes(",")) commitOption(i);
}
function commitOption(i: number): void {
	const a = store.attributes[i];
	if (!a) return;
	for (const o of String(pending[i] ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
		if (!a.options.includes(o)) a.options.push(o);
	}
	pending[i] = "";
	sync();
}
function removeOption(i: number, oi: number): void {
	store.attributes[i]?.options.splice(oi, 1);
	sync();
}
function setPrice(key: PriceKey, v: string | number | null | undefined): void {
	if (!store.draft) return;
	store.draft[key] = v === "" || v === null || v === undefined ? null : Number(v);
}
function onAllocate(inventoryId: string, rowKey: string, quantity: number, max: number): void {
	store.setAllocation(inventoryId, rowKey, Math.min(quantity, max));
	sync();
}
function onAddAttribute(): void {
	store.addAttribute();
	sync();
}
function onRemoveAttribute(index: number): void {
	store.removeAttribute(index);
	for (const k of Object.keys(pending)) delete pending[Number(k)];
	sync();
}
function onGenerate(): void {
	const added = store.generate();
	if (added < 0) {
		POP.alert({ status: "error", title: tr("TOO_MANY") });
		return;
	}
	sync();
	POP.alert({ status: "success", title: tr("GENERATED"), content: `${added}` });
}
function onSaveDraft(): void {
	store.saveDraft();
	sync();
}
function onRemove(r: ProductVariant): void {
	POP.confirm({
		title: tr("REMOVE_TITLE"),
		content: r.variantName || r.variantCode || "",
		okBtn: { btnText: tr("REMOVE"), onClick: () => { store.remove(r); sync(); } }
	});
}
</script>

<style scoped>
.pv_tab { padding: 8px 16px 16px; }
.pv_sec { font-size: 14px; font-weight: 700; margin: 8px 0 4px; }
.pv_hint { font-size: 12px; color: var(--ion-color-medium); margin: 0 0 8px; }
.pv_box { border: 1px solid var(--ion-color-light-shade, #ddd); border-radius: 8px; padding: 4px 0; margin-bottom: 8px; }
.pv_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 12px; }
.pv_actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; padding: 0 8px; }
.pv_list_head { display: flex; align-items: center; justify-content: space-between; margin: 8px 0; }
.pv_alloc_head { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 16px 0; }
.pv_alloc_left { font-size: 12px; color: var(--ion-color-medium); margin: 4px 16px 8px; }
.pv_danger { color: var(--ion-color-danger); }
.pv_code { font-size: 10px; }
.pv_edit { border-color: var(--ion-color-primary); }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
