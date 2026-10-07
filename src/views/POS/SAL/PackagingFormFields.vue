<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item v-for="(l, i) in store.items" :key="i">
				<ion-label>
					<h3>{{ l.productName }}</h3>
					<p>{{ l.productCode }} · {{ sc("UNIT") }}: {{ l.unitName || "—" }}</p>
				</ion-label>
				<ion-input
					slot="end" class="pf_qty" :value="l.quantityRequired" :aria-label="sc('REQUIRED')" type="number" min="1" inputmode="numeric"
					@ion-change="onQty(i, $event)" />
				<ion-button slot="end" fill="clear" color="danger" @click="store.removeItem(i)"><ion-icon slot="icon-only" :icon="closeOutline" /></ion-button>
			</ion-item>
			<ion-item v-if="!store.items.length" lines="none"><ion-note>{{ loadingItems ? sc("LOADING") : sc("NO_ITEMS") }}</ion-note></ion-item>
		</ion-list>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="store.packerId" :label="sc('PACKER')" label-placement="stacked" :placeholder="sc('SELECT_PACKER')" interface="action-sheet">
					<ion-select-option :value="undefined">—</ion-select-option>
					<ion-select-option v-for="p in store.packers" :key="p.salePersonId" :value="p.salePersonId">{{ p.name }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model="store.referenceNumber" :label="sc('REFERENCE')" label-placement="stacked" :placeholder="sc('REFERENCE_PH')" :clear-input="true" />
			</ion-item>
			<ion-item>
				<ion-textarea v-model="store.notes" :label="sc('NOTES')" label-placement="stacked" :rows="3" :auto-grow="true" />
			</ion-item>
		</ion-list>
		<div class="pf_total"><span>{{ sc("ITEMS") }}</span><strong>{{ store.items.length }}</strong></div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { closeOutline } from "ionicons/icons";
import type { IonInputCustomEvent, InputChangeEventDetail } from "@ionic/core";
import type { PackagingFormItem } from "@/store/POS/SAL/SAL31000Store";
import type { SalePersonLookup } from "@/models/POS/COMMON/lookups";

/** Packing items + packer/reference/notes, shared by create (SAL31000) and edit (SAL37000). */
defineOptions({ name: "PackagingFormFields" });

export interface PackagingFormStore {
	items: PackagingFormItem[];
	packers: SalePersonLookup[];
	packerId?: string;
	referenceNumber: string;
	notes: string;
	setQty(i: number, v: number | null): void;
	removeItem(i: number): void;
}

const props = defineProps<{ store: PackagingFormStore; loadingItems?: boolean }>();
const { t } = useI18n();
const sc = (k: string) => t(`SAL31000.${k}`);

function onQty(i: number, e: IonInputCustomEvent<InputChangeEventDetail>): void {
	props.store.setQty(i, Number(e.detail.value ?? 0));
	e.target.value = props.store.items[i]?.quantityRequired;
}
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.pf_qty { max-width: 64px; text-align: center; }
.pf_total { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 16px; }
</style>
