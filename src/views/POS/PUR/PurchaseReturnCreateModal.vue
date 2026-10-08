<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="supplierId" :label="`${tr('SUPPLIER')} *`" label-placement="stacked" :placeholder="tr('SELECT')" interface="action-sheet">
					<ion-select-option v-for="s in store.suppliers" :key="s.supplierId" :value="s.supplierId">{{ s.contactName ?? s.supplierName }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="inventoryId" :label="`${tr('INVENTORY')} *`" label-placement="stacked" :placeholder="tr('SELECT')" interface="action-sheet">
					<ion-select-option v-for="i in store.inventories" :key="i.inventoryId" :value="i.inventoryId">{{ i.inventoryName ?? i.name }}</ion-select-option>
				</ion-select>
			</ion-item>

			<ion-list-header>{{ tr("ADD_ITEM") }}</ion-list-header>
			<ion-searchbar v-model="kw" :placeholder="tr('PRODUCT_PH')" :debounce="300" @ion-input="store.searchProducts(kw.trim())" />
			<template v-if="kw.trim()">
				<ion-item v-for="p in store.products" :key="p.productId" button :detail="false" @click="addLine(p)">
					<ion-label><h3>{{ p.productName }}</h3><p>{{ p.productCode }}</p></ion-label>
				</ion-item>
			</template>

			<div v-for="(line, i) in lines" :key="i" class="prc_line">
				<ion-item lines="none">
					<ion-label><h3>{{ line.productName }}</h3><p>{{ line.productCode }}</p></ion-label>
					<ion-button slot="end" fill="clear" color="danger" @click="lines.splice(i, 1)"><ion-icon slot="icon-only" :icon="trashOutline" /></ion-button>
				</ion-item>
				<div class="prc_grid">
					<NumberInput v-model="line.quantity" min="0.001" :label="tr('QTY_PH')" label-placement="stacked" fill="outline" />
					<NumberInput v-model="line.unitCost" min="0.01" step="0.01" :label="tr('COST_PH')" label-placement="stacked" fill="outline" />
				</div>
			</div>

			<ion-item>
				<ion-input :value="refundAmount" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('REFUND')" label-placement="stacked"
					@ion-input="onRefund($event.detail.value)" />
			</ion-item>
			<ion-note class="prc_hint">{{ tr("REFUND_HINT") }} {{ fullPrice.toFixed(2) }}</ion-note>
			<ion-item>
				<ion-textarea v-model="notes" :label="tr('NOTES')" label-placement="stacked" auto-grow :rows="2" />
			</ion-item>
		</ion-list>
		<div class="prc_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="store.acting" @click="onCreate">{{ tr("CREATE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { trashOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { PUR30000Store } from "@/store/POS/PUR/PUR30000Store";
import type { PurchaseReturnCreateItem, PurchaseReturnCreateResponse } from "@/models/POS/PUR/PUR30000";
import type { ProductListItem } from "@/models/PRD/PRD10000";

interface Line { productId: string; productCode?: string; productName?: string; quantity?: number; unitCost?: number }

/** New return-to-supplier draft (PUR30000I02); emits `ok` after create. */
defineOptions({ name: "PurchaseReturnCreateModal" });

const emit = defineEmits<{ ok: [PurchaseReturnCreateResponse | undefined]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PUR30000.CRT_${k}`);
const store = PUR30000Store();
const supplierId = ref<string | undefined>();
const inventoryId = ref<string | undefined>();
const notes = ref("");
const kw = ref("");
const lines = ref<Line[]>([]);
const refundAmount = ref(0);
/** Once the user edits the refund, stop syncing it to the total. */
const refundTouched = ref(false);

/** Document value of the current lines — the refund default. */
const fullPrice = computed(() => lines.value.reduce((sum, l) =>
	sum + (Number(l.quantity) > 0 ? Number(l.quantity) * Number(l.unitCost ?? 0) : 0), 0));
watch(fullPrice, (v) => { if (!refundTouched.value) refundAmount.value = Number(v.toFixed(2)); });

function onRefund(v: string | null | undefined): void {
	refundTouched.value = true;
	refundAmount.value = Number(v ?? 0) || 0;
}
function addLine(p: ProductListItem): void {
	kw.value = "";
	lines.value.push({ productId: p.productId, productCode: p.productCode, productName: p.productName });
}
function onCreate(): void {
	const items: PurchaseReturnCreateItem[] = lines.value
		.filter((l) => Boolean(l.productId) && Number(l.quantity) > 0)
		.map((l) => ({ productId: l.productId, quantity: Number(l.quantity), unitCost: l.unitCost }));
	if (!supplierId.value || !inventoryId.value || !items.length) {
		POP.alert({ status: "error", content: tr("VALIDATION") });
		return;
	}
	store.create({
		supplierId: supplierId.value, inventoryId: inventoryId.value,
		paidAmount: refundAmount.value, notes: notes.value || undefined, itemList: items
	}, (ok, res, err) => {
		if (ok) emit("ok", res);
		else POP.apiError(err, tr("CREATE"));
	});
}

onMounted(() => {
	store.loadCreateRefs();
	store.searchProducts("");
});
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
.prc_line { border-bottom: 1px solid var(--ion-color-light-shade); padding-bottom: 8px; }
.prc_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px; }
.prc_hint { display: block; font-size: 12px; padding: 4px 16px; }
.prc_btns { display: flex; gap: 8px; padding: 16px 0; }
.prc_btns ion-button { flex: 1; }
</style>
