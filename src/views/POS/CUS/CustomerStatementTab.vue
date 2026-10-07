<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="startDate" type="date" :label="tr('COL_DATE') + ' ▸'" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="endDate" type="date" :label="tr('COL_DATE') + ' ◂'" label-placement="stacked" /></ion-item>
		</ion-list>
		<div class="cstab_btns">
			<ion-button size="small" :disabled="loading" @click="load">{{ tr("GENERATE") }}</ion-button>
			<ion-button v-if="startDate || endDate" size="small" fill="clear" @click="clearRange">{{ tr("ALL_TIME") }}</ion-button>
			<ion-button v-if="report" size="small" fill="outline" @click="exportStatement">{{ tr("EXPORT") }}</ion-button>
		</div>
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<CustomerStatementView v-else-if="report" :report="report" />
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import RetrieveCustomerBalance from "@/services/api/CUS/retrieveCustomerBalance";
import POP from "@/core/utilities/pop";
import CustomerStatementView from "@/views/POS/CUS/CustomerStatementView.vue";
import StatementDocument from "@/views/POS/COMMON/StatementDocument.vue";
import type { CUS17000Response } from "@/models/POS/CUS/CUS17000";

/** CUS14000 tab: balance statement for one customer; all-time unless a range is set (CUS17000I01). */
defineOptions({ name: "CustomerStatementTab" });

// All-time floor when no range is chosen (backend defaults to the last 90 days otherwise).
const ALL_TIME_START = "2000-01-01";

const props = defineProps<{ detail: Record<string, any> }>();
const { t } = useI18n();
const tr = (key: string) => t(`CUS14000.${key}`);
const startDate = ref("");
const endDate = ref("");
const report = ref<CUS17000Response | null>(null);
const loading = ref(false);

function load(): void {
	const customerId = props.detail?.customerId;
	if (!customerId) return;
	loading.value = true;
	RetrieveCustomerBalance.getInstance().request({
		dataBody: { customerId, startDate: startDate.value || ALL_TIME_START, endDate: endDate.value },
		listener: {
			onSuccess: (r) => { report.value = r; loading.value = false; },
			onFail: () => { report.value = null; loading.value = false; }
		}
	});
}
/** The printable statement document (print button is web-only, see StatementDocument). */
function exportStatement(): void {
	if (!report.value) return;
	POP.showPopup(StatementDocument, { title: tr("TAB_STATEMENT"), props: { report: report.value } }).promise.catch(() => undefined);
}
function clearRange(): void {
	startDate.value = "";
	endDate.value = "";
	load();
}
watch(() => props.detail?.customerId, (id) => { if (id) load(); }, { immediate: true });
</script>

<style scoped>
.cstab_btns { display: flex; gap: 8px; padding: 8px 16px; }
</style>
