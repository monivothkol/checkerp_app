<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL20000">
			<template v-if="store.header && !store.loading" #end>
				<ion-button @click="openDocument"><ion-icon slot="icon-only" :icon="documentTextOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="store.header">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ store.header.returnCode }} · {{ tr("SALE_CODE") }} {{ store.header.saleCode }}</p><h3>{{ store.header.customerName || "—" }}</h3></ion-label>
						<ion-badge slot="end" :color="statusColor">{{ statusLabel }}</ion-badge>
					</ion-item>
					<ion-item v-if="store.header.returnedAt"><ion-label><p>{{ tr("RETURNED_AT") }}</p><h3>{{ UT.localDateTime(store.header.returnedAt) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ store.header.notes }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.creditNoteCode"><ion-label><p>{{ tr("CREDIT_NOTE") }}</p><h3>{{ store.header.creditNoteCode }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.approvedBy"><ion-label><p>{{ tr("APPROVED_BY") }}</p><h3>{{ store.header.approvedBy }}<template v-if="store.header.approvedByCode"> ({{ store.header.approvedByCode }})</template></h3></ion-label></ion-item>
					<ion-item v-if="store.header.approvedAt"><ion-label><p>{{ tr("APPROVED_AT") }}</p><h3>{{ fmtDate(store.header.approvedAt) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.header.rejectedBy"><ion-label><p>{{ tr("REJECTED_BY") }}</p><h3>{{ store.header.rejectedBy }}<template v-if="store.header.rejectedByCode"> ({{ store.header.rejectedByCode }})</template></h3></ion-label></ion-item>
					<ion-item v-if="store.header.rejectedAt"><ion-label><p>{{ tr("REJECTED_AT") }}</p><h3>{{ fmtDate(store.header.rejectedAt) }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.items" :key="i">
						<ion-label>
							<h3>{{ it.productName }}</h3>
							<p>{{ it.productCode }} · {{ tr("COL_UNIT_PRICE") }} {{ money(it.unitPrice) }}</p>
							<p>{{ tr("COL_SOLD") }} {{ it.quantitySold }} · {{ tr("COL_RETURNED") }} {{ it.quantityReturned }}</p>
						</ion-label>
						<ion-note slot="end">{{ money(it.refundAmount) }}</ion-note>
					</ion-item>
				</ion-list>
				<div class="sal_total"><span>{{ t("INVOICE.TOTAL_REFUND") }}</span><strong>{{ money(store.header.totalRefund) }}</strong></div>
				<AuditHistoryList :audit-list="store.auditList" :title="tr('CHANGE_HISTORY')" />
			</template>
			<bm-empty-state v-else :description="'SAL24000.NOT_FOUND'" />
		</ion-content>
		<ion-footer v-if="store.header?.status === 'PENDING' && !store.loading">
			<ion-toolbar class="sal_btns">
				<ion-button expand="block" @click="router.push(`/SAL27000?returnId=${encodeURIComponent(store.header.returnId ?? '')}`)">{{ tr("EDIT") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { documentTextOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import ReturnDocument from "@/views/POS/COMMON/ReturnDocument.vue";
import AuditHistoryList from "@/views/POS/SAL/AuditHistoryList.vue";
import { SAL24000Store } from "@/store/POS/SAL/SAL24000Store";

/** Sale-return detail: lines, approval info, change history; PENDING returns can be edited. */
defineOptions({ name: "SAL24000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL24000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL24000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");

const statusLabel = computed(() => {
	const s = String(store.header?.status ?? "");
	return ["PENDING", "APPROVED", "REJECTED"].includes(s) ? tr("STATUS_" + s) : s;
});
const statusColor = computed(() => ({ APPROVED: "success", REJECTED: "danger" } as Record<string, string>)[String(store.header?.status)] ?? "medium");

useViewEnter(() => store.load(String(route.query.returnId ?? "")));

function openDocument(): void {
	if (!store.header) return;
	POP.showPopup(ReturnDocument, { title: tr("PAGE_TITLE"), props: { ret: store.header, items: store.items } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.sal_total { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 16px; }
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
