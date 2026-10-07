<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/STK20000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.fromInventoryId" :label="tr('FROM')" label-placement="stacked" :placeholder="tr('SELECT')" interface="action-sheet" @ion-change="store.onFromChange()">
						<ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.toInventoryId" :label="tr('TO')" label-placement="stacked" :placeholder="tr('SELECT')" interface="action-sheet">
						<ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId" :disabled="i.inventoryId === store.fromInventoryId">{{ i.inventoryName }}</ion-select-option>
					</ion-select>
				</ion-item>

				<ion-list-header>{{ tr("ADD_PRODUCT") }}</ion-list-header>
				<ion-searchbar v-model="kw" :disabled="!store.fromInventoryId" :placeholder="store.fromInventoryId ? tr('SEARCH_PRODUCT') : tr('PICK_FROM_FIRST')" :debounce="0" @ion-input="onSearch" />
				<template v-if="kw.trim()">
					<ion-item v-for="p in store.productResults" :key="store.rowKey(p)" button :detail="false" @click="onPick(p)">
						<ion-label>
							<h3>{{ p.productName }}<template v-if="p.variantName"> — {{ p.variantName }}</template></h3>
							<p>{{ p.productCode }}</p>
						</ion-label>
						<ion-note slot="end">{{ tr("AVAIL") }} {{ num(p.availableQuantity ?? p.quantity) }}</ion-note>
					</ion-item>
				</template>

				<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
				<ion-item v-for="(l, i) in store.lines" :key="store.rowKey(l)">
					<ion-label>
						<h3>{{ l.productName }}<template v-if="l.variantName"> — {{ l.variantName }}</template></h3>
						<p>{{ l.productCode }} · {{ tr("AVAIL") }} {{ num(l.available) }}</p>
					</ion-label>
					<ion-input slot="end" class="stk_qty" :value="l.quantity" type="number" inputmode="numeric" min="1" :max="l.available" fill="outline" :aria-label="tr('QTY')"
						@ion-change="store.setQty(i, Number($event.detail.value))" />
					<ion-button slot="end" fill="clear" color="danger" @click="store.removeLine(i)"><ion-icon slot="icon-only" :icon="closeOutline" /></ion-button>
				</ion-item>
				<ion-item v-if="!store.lines.length"><ion-note>{{ tr("NO_LINES") }}</ion-note></ion-item>

				<ion-item>
					<ion-textarea v-model="store.note" :label="tr('NOTE')" label-placement="stacked" auto-grow :rows="2" />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="stk_sum">
					<div><span>{{ tr("FROM") }} → {{ tr("TO") }}</span><span>{{ store.inventoryName(store.fromInventoryId) || "—" }} → {{ store.inventoryName(store.toInventoryId) || "—" }}</span></div>
					<div><span>{{ tr("LINES") }}</span><span>{{ store.lines.length }}</span></div>
					<div class="total"><span>{{ tr("TOTAL_QTY") }}</span><strong>{{ store.totalQty }}</strong></div>
				</div>
				<div class="stk_btns">
					<ion-button fill="outline" @click="router.push('/STK20000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { closeOutline } from "ionicons/icons";
import { STK21000Store } from "@/store/POS/STK/STK21000Store";
import type { StockRow } from "@/models/POS/STK/STK10000";

/** New stock transfer: source/target inventory, lines capped at source availability → STK22000 confirm. */
defineOptions({ name: "STK21000" });

const { t } = useI18n();
const tr = (k: string) => t(`STK21000.${k}`);
const router = useRouter();
const store = STK21000Store();
const kw = ref("");
const num = (v: unknown) => String(Number(v ?? 0));

function onSearch(): void {
	if (kw.value.trim()) store.searchProducts(kw.value.trim());
}
function onPick(p: StockRow): void {
	kw.value = "";
	store.onPickProduct(store.rowKey(p));
}
function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/STK22000");
}

onMounted(() => store.loadInventories());
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.stk_qty { max-width: 72px; }
.stk_sum { padding: 8px 16px 0; font-size: 12px; }
.stk_sum > div { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; }
.stk_sum .total { font-size: 16px; padding-top: 4px; }
.stk_btns { display: flex; gap: 8px; padding: 8px 12px; }
.stk_btns ion-button { flex: 1; }
</style>
