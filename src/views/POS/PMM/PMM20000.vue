<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PMM10000" />

		<ion-content>
			<!-- Basic info -->
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.form.promotionName" :label="tr('NAME') + ' *'" label-placement="stacked" :placeholder="tr('NAME_PH')" />
				</ion-item>
				<ion-list-header>{{ tr("TYPE") }} *</ion-list-header>
				<ion-segment v-model="store.form.promotionType" scrollable class="pmm_seg" @ion-change="store.onTypeChange">
					<ion-segment-button v-for="ty in TYPES" :key="ty" :value="ty"><ion-label>{{ tr("TYPE_" + ty) }}</ion-label></ion-segment-button>
				</ion-segment>
				<ion-item>
					<ion-textarea v-model="store.form.description" :label="tr('DESCRIPTION')" label-placement="stacked" auto-grow :rows="2" />
				</ion-item>
				<ion-item>
					<ion-input :value="store.dateRange[0] ?? ''" type="date" :label="`${tr('PERIOD')} ▸`" label-placement="stacked" @ion-input="setDate(0, $event.detail.value)" />
				</ion-item>
				<ion-item>
					<ion-input :value="store.dateRange[1] ?? ''" type="date" :label="`${tr('PERIOD')} ◂`" label-placement="stacked" @ion-input="setDate(1, $event.detail.value)" />
				</ion-item>
				<ion-item>
					<ion-input :value="store.form.maxUse ?? ''" type="number" inputmode="numeric" min="0" :label="tr('MAX_USE')" label-placement="stacked" :placeholder="tr('UNLIMITED')" @ion-input="setNum('maxUse', $event.detail.value, 0)" />
				</ion-item>
			</ion-list>

			<!-- Type-specific rules -->
			<ion-list v-if="store.form.promotionType" class="scr_list" lines="full">
				<ion-list-header>{{ tr("RULES") }}</ion-list-header>
				<template v-if="store.isPercentage">
					<ion-item>
						<ion-input :value="store.form.discountPercentage ?? ''" type="number" inputmode="decimal" min="0" max="100" :label="tr('DISCOUNT_PCT') + ' (%) *'" label-placement="stacked" @ion-input="setNum('discountPercentage', $event.detail.value, 0, 100)" />
					</ion-item>
					<ion-item>
						<ion-input :value="store.form.maxDiscountAmount ?? ''" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('MAX_DISCOUNT') + ' ($)'" label-placement="stacked" @ion-input="setNum('maxDiscountAmount', $event.detail.value, 0)" />
					</ion-item>
				</template>
				<ion-item v-if="store.isPriceOverride">
					<ion-input :value="store.form.discountPrice ?? ''" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('FIXED_PRICE') + ' ($) *'" label-placement="stacked" @ion-input="setNum('discountPrice', $event.detail.value, 0)" />
				</ion-item>
				<template v-if="store.isBuyXGetY">
					<ion-item>
						<ion-input :value="store.form.buyQuantity ?? ''" type="number" inputmode="numeric" min="1" :label="tr('BUY_QTY') + ' *'" label-placement="stacked" @ion-input="setNum('buyQuantity', $event.detail.value, 1)" />
					</ion-item>
					<ion-item>
						<ion-input :value="store.form.freeQuantity ?? ''" type="number" inputmode="numeric" min="1" :label="tr('FREE_QTY') + ' *'" label-placement="stacked" @ion-input="setNum('freeQuantity', $event.detail.value, 1)" />
					</ion-item>
				</template>

				<!-- Scope choice (percentage only) -->
				<template v-if="store.isPercentage">
					<ion-list-header>{{ tr("APPLIES_TO") }}</ion-list-header>
					<ion-segment v-model="store.form.applicationType" scrollable class="pmm_seg" @ion-change="store.onApplicationTypeChange">
						<ion-segment-button value=""><ion-label>{{ tr("WHOLE_ORDER") }}</ion-label></ion-segment-button>
						<ion-segment-button value="PRODUCT"><ion-label>{{ tr("PRODUCTS") }}</ion-label></ion-segment-button>
						<ion-segment-button value="CATEGORY"><ion-label>{{ tr("CATEGORIES") }}</ion-label></ion-segment-button>
						<ion-segment-button value="BRAND"><ion-label>{{ tr("BRANDS") }}</ion-label></ion-segment-button>
					</ion-segment>
				</template>

				<!-- Targets: products are searched on the server; categories/brands come from the loaded lists -->
				<template v-if="store.showTargetPicker">
					<ion-list-header>{{ targetLabel }}</ion-list-header>
					<ion-item v-if="store.targetScope !== 'PRODUCT'">
						<ion-select :key="pickKey" :value="store.targetPick" :placeholder="tr('SEARCH_TARGET')" :aria-label="targetLabel" interface="action-sheet" @ion-change="onPickListTarget($event.detail.value)">
							<ion-select-option v-for="o in store.targetOptions" :key="o.id" :value="o.id">{{ o.name }}</ion-select-option>
						</ion-select>
					</ion-item>
					<template v-else>
						<ion-searchbar v-model="targetKw" :placeholder="tr('SEARCH_TARGET')" :debounce="0" @ion-input="store.onTargetSearch(targetKw)" />
						<ion-item v-for="o in targetKw ? store.targetOptions : []" :key="o.id" button :detail="false" @click="onPickProductTarget(o.id)">
							<ion-label>{{ o.name }}</ion-label>
							<ion-icon slot="end" :icon="add" color="primary" />
						</ion-item>
						<ion-item v-if="targetKw && store.searching"><ion-spinner name="dots" /></ion-item>
					</template>
					<div class="pmm_chips">
						<ion-chip v-for="(tg, i) in store.targets" :key="tg.targetId" color="primary" @click="store.removeTarget(i)">
							<ion-label>{{ tg.targetName }}</ion-label>
							<ion-icon :icon="closeCircle" />
						</ion-chip>
						<ion-note v-if="!store.targets.length">{{ tr("NO_TARGETS") }}</ion-note>
					</div>
				</template>

				<!-- Bundle items -->
				<template v-if="store.isBundle">
					<ion-list-header>{{ tr("ADD_BUNDLE_PRODUCT") }}</ion-list-header>
					<ion-searchbar v-model="bundleKw" :placeholder="tr('SEARCH_PRODUCT')" :debounce="0" @ion-input="store.onProductSearch(bundleKw)" />
					<ion-item v-for="p in bundleKw ? store.productResults : []" :key="p.productId" button :detail="false" @click="onPickBundle(p.productId)">
						<ion-label>
							<h3>{{ p.productName }}</h3>
							<p>{{ p.productCode }}</p>
						</ion-label>
						<ion-icon slot="end" :icon="add" color="primary" />
					</ion-item>
					<ion-item v-if="bundleKw && store.searching"><ion-spinner name="dots" /></ion-item>

					<div v-for="(b, i) in store.bundleItems" :key="b.productId + (b.variantId ?? '')" class="pmm_line">
						<ion-item lines="none">
							<ion-label>
								<h3>{{ b.productName }}<template v-if="b.variantName"> — {{ b.variantName }}</template></h3>
								<p>{{ b.productCode }}</p>
							</ion-label>
							<ion-button slot="end" fill="clear" color="danger" @click="store.removeBundle(i)"><ion-icon slot="icon-only" :icon="closeOutline" /></ion-button>
						</ion-item>
						<div class="pmm_line_inputs">
							<ion-input :value="b.quantity" type="number" inputmode="numeric" min="1" :label="tr('QTY')" label-placement="stacked" fill="outline" @ion-change="store.setBundleQty(i, Number($event.detail.value))" />
							<ion-input :value="b.bundlePrice" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('BUNDLE_PRICE')" label-placement="stacked" fill="outline" @ion-change="store.setBundlePrice(i, Number($event.detail.value))" />
						</div>
					</div>
					<ion-item v-if="!store.bundleItems.length"><ion-note>{{ tr("NO_BUNDLE") }}</ion-note></ion-item>
				</template>
			</ion-list>

			<!-- Summary -->
			<ion-list class="scr_list" lines="full">
				<ion-item><ion-label>{{ tr("TYPE") }}</ion-label><ion-note slot="end">{{ typeLabel }}</ion-note></ion-item>
				<ion-item><ion-label>{{ tr("REWARD") }}</ion-label><ion-note slot="end">{{ rewardSummary }}</ion-note></ion-item>
				<ion-item><ion-label>{{ tr("APPLIES_TO") }}</ion-label><ion-note slot="end">{{ scopeSummary }}</ion-note></ion-item>
				<ion-item><ion-toggle v-model="store.form.isActive">{{ tr("ACTIVE") }}</ion-toggle></ion-item>
			</ion-list>
		</ion-content>

		<ion-footer>
			<ion-toolbar class="pmm_btns">
				<ion-button fill="outline" @click="router.push('/PMM10000')">{{ tr("CANCEL") }}</ion-button>
				<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { add, closeCircle, closeOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import VariantPickerModal from "@/views/POS/SAL/VariantPickerModal.vue";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";
import { PMM20000Store } from "@/store/POS/PMM/PMM20000Store";

/** PMM20000 — create promotion (4 types): rules, targets / bundle lines, summary; Confirm goes to PMM30000. */
defineOptions({ name: "PMM20000" });

const TYPES = ["PERCENTAGE_DISCOUNT", "BUY_X_GET_Y", "BUNDLED_PACKAGE", "PRICE_OVERRIDE"];
type NumKey = "maxUse" | "discountPercentage" | "maxDiscountAmount" | "discountPrice" | "buyQuantity" | "freeQuantity";

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`PMM20000.${key}`);
const store = PMM20000Store();
const targetKw = ref("");
const bundleKw = ref("");
/** Remounts the category/brand select so it clears after each pick. */
const pickKey = ref(0);

onMounted(() => {
	store.loadCategories();
	store.loadBrands();
});

/** Empty → unset; otherwise clamped like the web's number inputs. */
function setNum(key: NumKey, v: string | number | null | undefined, min: number, max = Infinity): void {
	store.form[key] = v === "" || v === null || v === undefined ? undefined : Math.min(Math.max(Number(v), min), max);
}
function setDate(i: 0 | 1, v: string | number | null | undefined): void {
	const r = [store.dateRange[0] ?? "", store.dateRange[1] ?? ""];
	r[i] = String(v ?? "");
	store.dateRange = r[0] || r[1] ? r : [];
}

// i18n-bound summary labels — kept in the screen so the store stays free of $t.
const targetLabel = computed(() => {
	const scope = store.targetScope;
	if (scope === "CATEGORY") return tr("SEL_CATEGORY");
	return tr(scope === "BRAND" ? "SEL_BRAND" : "SEL_PRODUCT");
});
const typeLabel = computed(() => (store.form.promotionType ? tr("TYPE_" + store.form.promotionType) : "—"));
const rewardSummary = computed(() => {
	const f = store.form;
	if (store.isPercentage) return `${Number(f.discountPercentage ?? 0)}% off`;
	if (store.isPriceOverride) return "$ " + UT.currency(f.discountPrice ?? 0, "USD");
	if (store.isBuyXGetY) return `${tr("BUY")} ${f.buyQuantity ?? 0} ${tr("GET")} ${f.freeQuantity ?? 0}`;
	if (store.isBundle) return `${store.bundleItems.length} ${tr("ITEMS")}`;
	return "—";
});
const scopeSummary = computed(() => {
	if (store.isBundle) return tr("BUNDLE");
	if (store.isPercentage && !store.form.applicationType) return tr("WHOLE_ORDER");
	return `${store.targets.length} ${tr("SELECTED")}`;
});
const periodLabel = computed(() => {
	const r = store.dateRange;
	return r?.[0] || r?.[1] ? `${r[0] || "…"} → ${r[1] || "…"}` : tr("ALWAYS");
});

function onPickListTarget(id: string | undefined): void {
	if (id) store.onPickTarget(id);
	pickKey.value++;
}
function onPickProductTarget(id: string): void {
	store.onPickTarget(id);
	targetKw.value = "";
}

/** A component with variants asks which one before it joins the bundle. */
function onPickBundle(productId: string): void {
	const p = store.productResults.find((x) => x.productId === productId);
	bundleKw.value = "";
	if (!p?.hasVariants) { store.onPickBundle(productId); return; }
	store.bundlePick = undefined;
	POP.showPopup<SellableVariant>(VariantPickerModal, {
		title: `${t("POS10000.VARIANT_TITLE")} — ${p.productName}`,
		props: { productId }
	}).promise
		.then((res) => { if (res.data) store.onPickBundle(productId, res.data); })
		.catch(() => undefined);
}

function confirm(): void {
	const saved = store.buildAndSaveDraft({ type: typeLabel.value, reward: rewardSummary.value, scope: scopeSummary.value, period: periodLabel.value });
	if (saved) router.push("/PMM30000");
}
</script>

<style scoped>
.pmm_seg { padding: 0 16px 8px; }
.pmm_chips { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding: 8px 16px; }
.pmm_chips ion-note { font-size: 12px; }
.pmm_line { border-bottom: 1px solid var(--ion-color-light-shade, #ddd); padding-bottom: 8px; }
.pmm_line_inputs { display: flex; gap: 8px; padding: 0 16px; }
.pmm_line_inputs ion-input { flex: 1; }
.pmm_btns { --padding-start: 16px; --padding-end: 16px; }
.pmm_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
