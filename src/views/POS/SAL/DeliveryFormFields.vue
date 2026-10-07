<template>
	<ion-list class="scr_list" lines="full">
		<ion-item>
			<ion-select v-model="store.driverId" :label="tr('DRIVER')" label-placement="stacked" :placeholder="tr('DRIVER_PH')" interface="action-sheet">
				<ion-select-option :value="undefined">—</ion-select-option>
				<ion-select-option v-for="d in store.drivers" :key="d.driverId" :value="d.driverId">{{ d.driverName || d.staffCode }}</ion-select-option>
			</ion-select>
		</ion-item>
		<ion-item v-if="noDriversHint && !store.drivers.length" lines="none"><ion-note class="df_hint">{{ tr("NO_DRIVERS") }}</ion-note></ion-item>
		<ion-item>
			<ion-input v-model="store.customerName" :label="tr('CUSTOMER_NAME')" label-placement="stacked" :placeholder="tr('CUSTOMER_NAME_PH')" :clear-input="true" />
		</ion-item>
		<ion-item>
			<ion-input v-model="store.customerPhone" :label="tr('CUSTOMER_PHONE')" label-placement="stacked" type="tel" :placeholder="tr('CUSTOMER_PHONE_PH')" :clear-input="true" />
		</ion-item>
		<!-- Saved addresses when the sale has a customer; free text only as the fallback. -->
		<ion-item v-if="customerId">
			<ion-select
				:key="addrKey" :value="store.addressPick" :label="tr('DELIVERY_ADDRESS')" label-placement="stacked" :placeholder="tr('SAVED_ADDRESSES_PH')"
				interface="action-sheet" @ion-change="onAddressChange($event.detail.value)">
				<ion-select-option v-for="a in store.addresses" :key="a.addressId" :value="a.addressId">
					{{ a.label || a.address }}<template v-if="a.isDefault"> · {{ tr("DEFAULT_ADDRESS") }}</template>
				</ion-select-option>
				<ion-select-option value="__new">＋ {{ tr("NEW_ADDRESS") }}</ion-select-option>
			</ion-select>
		</ion-item>
		<ion-item v-if="customerId && store.deliveryAddress" lines="none"><ion-note class="df_hint">{{ store.deliveryAddress }}</ion-note></ion-item>
		<ion-item v-if="!customerId">
			<ion-textarea v-model="store.deliveryAddress" :label="tr('DELIVERY_ADDRESS')" label-placement="stacked" :placeholder="tr('ADDRESS_PH')" :rows="2" :auto-grow="true" />
		</ion-item>
		<ion-item>
			<ion-input
				:value="toLocal(store.scheduledDate)" :label="tr('SCHEDULED_DATE')" label-placement="stacked" type="datetime-local"
				@ion-change="store.scheduledDate = fromLocal(String($event.detail.value ?? ''))" />
		</ion-item>
		<ion-item>
			<ion-textarea v-model="store.notes" :label="tr('NOTES')" label-placement="stacked" :rows="3" :auto-grow="true" />
		</ion-item>
	</ion-list>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import DeliveryAddressModal from "@/views/POS/SAL/DeliveryAddressModal.vue";
import type { DeliveryAddress, DeliveryDriver } from "@/models/POS/SAL/SAL40000";

/** Dispatch fields shared by delivery create (SAL41000) and edit (SAL47000); `ns` is the screen's i18n namespace. */
defineOptions({ name: "DeliveryFormFields" });

export interface DeliveryFormStore {
	drivers: DeliveryDriver[];
	driverId?: string;
	addresses: DeliveryAddress[];
	addressPick?: string;
	deliveryAddress: string;
	scheduledDate: string;
	customerName: string;
	customerPhone: string;
	notes: string;
	pickAddress(addressId: string): void;
	addAddress(a: DeliveryAddress): void;
}

const props = defineProps<{ store: DeliveryFormStore; customerId?: string; ns: string; noDriversHint?: boolean }>();
const { t } = useI18n();
const tr = (k: string) => t(`${props.ns}.${k}`);
const addrKey = ref(0);

// Backend format "YYYY-MM-DD HH:mm:ss" ⇄ datetime-local "YYYY-MM-DDTHH:mm".
const toLocal = (v: string) => (v ? v.replace(" ", "T").slice(0, 16) : "");
const fromLocal = (v: string) => (v ? `${v.replace("T", " ").slice(0, 16)}:00` : "");

function onAddressChange(v?: string): void {
	if (!v || v === props.store.addressPick) return;
	if (v !== "__new") { props.store.pickAddress(v); return; }
	// Re-render the select so it doesn't keep showing "＋ New address".
	addrKey.value++;
	if (!props.customerId) return;
	POP.showPopup<DeliveryAddress>(DeliveryAddressModal, { title: tr("NEW_ADDRESS"), props: { customerId: props.customerId }, closable: true })
		.promise.then((r) => { if (r?.data) props.store.addAddress(r.data); }).catch(() => undefined);
}
</script>

<style scoped>
.df_hint { font-size: 12px; white-space: normal; }
</style>
