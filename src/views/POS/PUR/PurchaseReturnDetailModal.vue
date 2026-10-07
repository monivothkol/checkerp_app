<template>
	<div>
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<template v-else-if="detail">
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-label><p>{{ tr("CODE") }}</p><h3>{{ detail.adjustmentCode }}</h3></ion-label>
					<ion-badge slot="end" :color="statusColor(detail.status)">{{ tr("STATUS_" + detail.status) }}</ion-badge>
				</ion-item>
				<ion-item><ion-label><p>{{ tr("SUPPLIER") }}</p><h3>{{ detail.supplierName || "—" }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("INVENTORY") }}</p><h3>{{ detail.inventoryName || "—" }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("REFUND") }}</p><h3>$ {{ Number(detail.paidAmount ?? 0).toFixed(2) }}</h3></ion-label></ion-item>
				<ion-item v-if="detail.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ detail.notes }}</h3></ion-label></ion-item>
				<ion-item v-for="(it, i) in detail.items ?? []" :key="it.lineNo ?? i">
					<ion-label>
						<p>{{ it.productCode }}</p>
						<h3>{{ it.productName }}</h3>
						<p>{{ tr("COL_QTY") }} {{ it.quantityDifference }} × {{ money(it.unitCost) }}</p>
					</ion-label>
					<ion-note slot="end">{{ money(it.lineTotal) }}</ion-note>
				</ion-item>
			</ion-list>
		</template>
		<bm-empty-state v-else description="PUR30000.DTL_NOT_FOUND" />

		<div class="prd_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CLOSE") }}</ion-button>
			<template v-if="detail && detail.status === 'PENDING'">
				<ion-button color="danger" :disabled="store.acting" @click="onDecide(false)">{{ tr("REJECT") }}</ion-button>
				<ion-button :disabled="store.acting" @click="onDecide(true)">{{ tr("APPROVE") }}</ion-button>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { PUR30000Store } from "@/store/POS/PUR/PUR30000Store";
import type { PurchaseReturnDetail } from "@/models/POS/PUR/PUR30000";

/** Return detail with approve/reject; emits `ok` after a decision. */
defineOptions({ name: "PurchaseReturnDetailModal" });

const props = defineProps<{ adjustmentId: string }>();
const emit = defineEmits<{ ok: [{ status: string }]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PUR30000.DTL_${k}`);
const store = PUR30000Store();
const detail = ref<PurchaseReturnDetail | null>(null);
const loading = ref(true);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	if (s === "REJECTED") return "danger";
	return "medium";
}
function onDecide(approve: boolean): void {
	POP.confirm({
		title: approve ? tr("APPROVE") : tr("REJECT"),
		content: approve ? tr("APPROVE_CONFIRM") : tr("REJECT_CONFIRM"),
		okBtn: {
			onClick: () => store.decide(props.adjustmentId, approve, (ok, _res, err) => {
				if (ok) emit("ok", { status: approve ? "APPROVED" : "REJECTED" });
				else POP.alert({ status: "error", content: err?.message, errorCode: err?.code });
			})
		}
	});
}

onMounted(() => store.loadDetail(props.adjustmentId, (d) => { detail.value = d; loading.value = false; }));
</script>

<style scoped>
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
.prd_btns { display: flex; gap: 8px; padding: 16px 0; }
.prd_btns ion-button { flex: 1; }
</style>
