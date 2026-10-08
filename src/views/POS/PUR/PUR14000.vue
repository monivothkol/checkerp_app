<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PUR10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="h">
				<ion-list class="scr_list" lines="full">
					<ion-item>
						<ion-label><p>{{ tr("COL_CODE") }}</p><h3>{{ h.poCode }}</h3></ion-label>
						<ion-badge slot="end" :color="statusColor(h.status)">{{ tr("STATUS_" + h.status) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("SUPPLIER") }}</p><h3>{{ h.supplierName || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ h.inventoryName || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("ORDER_DATE") }}</p><h3>{{ h.orderDate || "—" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("EXPECTED_DATE") }}</p><h3>{{ h.expectedDeliveryDate || "—" }}</h3></ion-label></ion-item>
					<ion-item v-if="h.paymentTerm"><ion-label><p>{{ tr("PAYMENT_TERM") }}</p><h3>{{ h.paymentTerm }}</h3></ion-label></ion-item>
					<ion-item v-if="h.remark"><ion-label><p>{{ tr("REMARK") }}</p><h3>{{ h.remark }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("RECEIVED") }}</p><h3>{{ store.receivedHint }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("COL_PRODUCT") }}</ion-list-header>
					<ion-item v-for="(it, i) in store.items" :key="i">
						<ion-label>
							<p>{{ it.productCode }}</p>
							<h3>{{ it.productName }}</h3>
							<p>{{ tr("COL_RECEIVED") }} {{ Number(it.receivedQuantity ?? 0) }} / {{ Number(it.orderedQuantity ?? 0) }} · {{ tr("COL_UNIT_COST") }} {{ money(it.unitCost) }}</p>
							<p>{{ tr("COL_DISCOUNT") }} {{ money(it.discountAmount) }} · {{ tr("COL_TAX") }} {{ money(it.taxAmount) }}</p>
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
			<bm-empty-state v-else description="PUR14000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="canSend || canDecide || canCancel || canReceive">
			<ion-toolbar>
				<div class="pur_btns">
					<ion-button v-if="canSend" fill="outline" :disabled="store.acting" @click="onSend">{{ tr("SEND") }}</ion-button>
					<ion-button v-if="canDecide" fill="outline" color="danger" :disabled="store.acting" @click="onReject">{{ tr("REJECT") }}</ion-button>
					<ion-button v-if="canCancel" fill="outline" color="medium" :disabled="store.acting" @click="onCancel">{{ tr("CANCEL_PO") }}</ion-button>
					<ion-button v-if="canDecide" fill="outline" :disabled="store.acting" @click="onApprove">{{ tr("APPROVE") }}</ion-button>
				</div>
				<div v-if="canReceive" class="pur_btns">
					<ion-button @click="router.push(`/PUR21000?poId=${encodeURIComponent(poId)}`)">{{ tr("CREATE_PURCHASE_IN") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PUR14000Store } from "@/store/POS/PUR/PUR14000Store";

/** Purchase-order detail: header, lines, totals and the send/approve/reject/cancel/receive actions. */
defineOptions({ name: "PUR14000" });

const { t } = useI18n();
const tr = (k: string) => t(`PUR14000.${k}`);
const route = useRoute();
const router = useRouter();
const store = PUR14000Store();
const h = computed(() => store.header);
const poId = computed(() => String(route.query.poId ?? ""));
const status = computed(() => String(store.header?.status ?? "").toUpperCase());
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

// Receiving is allowed from any live PO — only cancelled/rejected or fully-received ones are blocked.
const canReceive = computed(() => !!store.header && !["CANCELLED", "REJECTED", "COMPLETED"].includes(status.value));
const canSend = computed(() => status.value === "DRAFT");
const canDecide = computed(() => !!store.header && ["DRAFT", "SENT"].includes(status.value));
const canCancel = computed(() => !!store.header && ["DRAFT", "SENT", "CONFIRMED", "PARTIAL"].includes(status.value));

function statusColor(s?: string): string {
	if (s === "COMPLETED") return "success";
	if (s === "SENT" || s === "CONFIRMED") return "primary";
	if (s === "PARTIAL") return "warning";
	if (s === "CANCELLED" || s === "REJECTED") return "danger";
	return "medium";
}
function afterTransition(ok: boolean, err?: unknown): void {
	if (ok) POP.openNotification({ type: "success", content: tr("STATUS_UPDATED") });
	else POP.apiError(err as { code?: string; message?: string } | undefined, tr("ACTION_FAILED"));
}
function onSend(): void {
	POP.confirm({ title: tr("SEND"), content: tr("SEND_CONFIRM"), okBtn: { btnText: tr("SEND"), onClick: () => store.send(poId.value, afterTransition) } });
}
function onApprove(): void {
	POP.confirm({ title: tr("APPROVE"), content: tr("APPROVE_CONFIRM"), okBtn: { onClick: () => store.approve(poId.value, afterTransition) } });
}
function askReason(title: string, isRequired: boolean): Promise<string | null> {
	return POP.input({ title, subtitle: tr("REASON_HINT"), isRequired }).then((r) => String(r.data ?? "")).catch(() => null);
}
async function onReject(): Promise<void> {
	const reason = await askReason(tr("REJECT"), true);
	if (reason !== null) store.reject(poId.value, reason, afterTransition);
}
async function onCancel(): Promise<void> {
	const reason = await askReason(tr("CANCEL_PO"), false);
	if (reason !== null) store.cancel(poId.value, reason, afterTransition);
}

useViewEnter(() => store.load(poId.value));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.pur_sum { padding: 8px 16px; font-size: 14px; }
.pur_sum > div { display: flex; justify-content: space-between; padding: 4px 0; }
.pur_sum .total { font-size: 16px; border-top: 1px solid var(--ion-color-light-shade); padding-top: 8px; }
.pur_btns { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 12px; }
.pur_btns ion-button { flex: 1; }
</style>
