<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-searchbar :placeholder="tr('SEL_CUSTOMER')" @ion-input="store.onCustomerSearch(String($event.detail.value ?? ''))" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-select v-model="store.customerId" :label="tr('SEL_CUSTOMER')" label-placement="stacked" interface="action-sheet" @ion-change="load">
						<ion-select-option v-for="c in store.customers" :key="c.customerId" :value="c.customerId">{{ c.customerName }} ({{ c.customerCode }})</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item><ion-input v-model="from" type="date" :label="`${tr('COL_DATE')} ▸`" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="to" type="date" :label="`${tr('COL_DATE')} ◂`" label-placement="stacked" /></ion-item>
			</ion-list>
			<div class="c17_btns">
				<ion-button size="small" :disabled="!store.customerId" @click="load">{{ tr("APPLY") }}</ion-button>
			</div>
			<CustomerStatementView v-if="store.report" :report="store.report" />
			<bm-empty-state v-else-if="store.customerId === undefined" description="CUS17000.PICK_HINT" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { CUS17000Store } from "@/store/POS/CUS/CUS17000Store";
import CustomerStatementView from "@/views/POS/CUS/CustomerStatementView.vue";

/** Customer balance statement: pick a customer + optional range, then summary cards + ledger. */
defineOptions({ name: "CUS17000" });

const { t } = useI18n();
const tr = (key: string) => t(`CUS17000.${key}`);
const store = CUS17000Store();

// The web range picker binds [from, to]; a half-set range is sent as-is (backend defaults the gap).
const from = computed({ get: () => store.range[0] ?? "", set: (v: string) => { store.range = [v, store.range[1] ?? ""]; } });
const to = computed({ get: () => store.range[1] ?? "", set: (v: string) => { store.range = [store.range[0] ?? "", v]; } });

function load(): void {
	store.load(tr("LOAD_FAILED"));
}
useViewEnter(() => store.searchCustomers(""));
</script>

<style scoped>
.c17_btns { display: flex; gap: 8px; padding: 8px 16px; }
</style>
