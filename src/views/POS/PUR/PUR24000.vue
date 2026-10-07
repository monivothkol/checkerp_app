<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PUR20000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="h">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("COL_CODE") }}</p><h3>{{ h.adjustmentCode }}</h3></ion-label>
						<div slot="end" class="pur_badges">
							<ion-badge :color="statusColor(h.status)">{{ tr("STATUS_" + h.status) }}</ion-badge>
							<ion-badge v-if="h.receivedStatus" :color="receivedColor(h.receivedStatus)">{{ tr("RECEIVED_" + h.receivedStatus) }}</ion-badge>
						</div>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("SUPPLIER") }}</p><h3>{{ h.supplierName || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ h.inventoryName || "—" }}</h3></ion-label></ion-item>
					<ion-item v-if="h.poCode"><ion-label><p>{{ tr("PO_CODE") }}</p><h3>{{ h.poCode }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("PAID_AMOUNT") }}</p><h3>{{ money(h.paidAmount) }}</h3></ion-label></ion-item>
					<ion-item v-if="h.supplierInvoiceId"><ion-label><p>{{ tr("SUPPLIER_INVOICE") }}</p><h3>{{ h.supplierInvoiceId }}</h3></ion-label></ion-item>
					<ion-item v-if="h.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ h.notes }}</h3></ion-label></ion-item>
					<ion-item v-if="h.adjustedAt"><ion-label><p>{{ tr("ADJUSTED_AT") }}</p><h3>{{ fmtDate(h.adjustedAt) }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.items" :key="i">
						<ion-label>
							<p>{{ it.productCode }}</p>
							<h3>{{ it.productName }}</h3>
							<p>{{ tr("COL_QTY") }} {{ it.quantityDifference }} × {{ money(it.unitCost) }} · {{ tr("COL_DISCOUNT") }} {{ money(it.discountAmount) }}</p>
							<p>{{ tr("COL_TAX") }} {{ money(it.taxAmount) }}<template v-if="it.taxRecoverable"> {{ tr("RECOVERABLE_MARK") }}</template></p>
						</ion-label>
						<ion-note slot="end">{{ money(it.lineTotal) }}</ion-note>
					</ion-item>
				</ion-list>

				<div class="pur_sum">
					<div><span>{{ tr("SUBTOTAL") }}</span><span>{{ money(h.subtotal ?? h.subTotal) }}</span></div>
					<div><span>{{ tr("DISCOUNT_TOTAL") }}</span><span>-{{ money(h.discountAmount ?? h.discountTotal) }}</span></div>
					<div><span>{{ tr("TAX_TOTAL") }}</span><span>{{ money(h.taxAmount ?? h.taxTotal) }}</span></div>
					<div class="total"><span>{{ tr("GRAND_TOTAL") }}</span><strong>{{ money(h.grandTotal) }}</strong></div>
				</div>
			</template>
			<bm-empty-state v-else description="PUR24000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="canReceive || canPay">
			<ion-toolbar>
				<div class="pur_btns">
					<ion-button v-if="canReceive" :disabled="store.acting" @click="onReceive">{{ tr("RECEIVE") }}</ion-button>
					<ion-button v-if="canPay" fill="outline" @click="onPay">{{ tr("PAY") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PUR24000Store } from "@/store/POS/PUR/PUR24000Store";
import PurchasePayModal from "@/views/POS/PUR/PurchasePayModal.vue";

/** Purchase-in detail: lines + totals; receive a PENDING one, pay the outstanding on a RECEIVED one. */
defineOptions({ name: "PUR24000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR24000.${k}`);
const route = useRoute();
const store = PUR24000Store();
const h = computed(() => store.header);
const adjustmentId = computed(() => String(route.query.adjustmentId ?? ""));
const status = computed(() => String(store.header?.status ?? "").toUpperCase());
const canReceive = computed(() => status.value === "PENDING");
const canPay = computed(() => status.value === "RECEIVED" && store.outstanding > 0);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const fmtDate = (d?: string) => (d ? String(d).replace("T", " ").slice(0, 16) : "—");

function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	if (s === "REJECTED" || s === "CANCELLED") return "danger";
	return "medium";
}
function receivedColor(s?: string): string {
	if (s === "RECEIVED") return "success";
	if (s === "PARTIAL_RECEIVED") return "warning";
	return "medium";
}
function onReceive(): void {
	POP.confirm({
		title: tr("RECEIVE"),
		content: tr("RECEIVE_CONFIRM"),
		okBtn: {
			btnText: tr("RECEIVE"),
			onClick: () => store.receive(adjustmentId.value, (ok, err) => {
				if (ok) return;
				const e = err as { message?: string; code?: string } | undefined;
				POP.alert({ title: tr("RECEIVE_FAILED"), status: "error", content: e?.message, errorCode: e?.code });
			})
		}
	});
}
function onPay(): void {
	POP.showPopup(PurchasePayModal, {
		title: tr("PAY"),
		props: { adjustmentId: adjustmentId.value, adjustmentCode: store.header?.adjustmentCode ?? "", outstanding: store.outstanding, paymentMethods: store.paymentMethods }
	}).promise.then(() => store.load(adjustmentId.value)).catch(() => undefined);
}

onMounted(() => store.loadPaymentMethods());
useViewEnter(() => store.load(adjustmentId.value));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.pur_badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.pur_sum { padding: 8px 16px; font-size: 14px; }
.pur_sum > div { display: flex; justify-content: space-between; padding: 4px 0; }
.pur_sum .total { font-size: 16px; border-top: 1px solid var(--ion-color-light-shade); padding-top: 8px; }
.pur_btns { display: flex; gap: 8px; padding: 4px 12px; }
.pur_btns ion-button { flex: 1; }
</style>
