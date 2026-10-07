<template>
	<div>
		<ion-progress-bar v-if="store.loading" type="indeterminate" />
		<template v-else-if="store.detail">
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-label><p>{{ tr("CODE") }}</p><h3>{{ store.detail.commissionCode }}</h3></ion-label>
					<ion-badge slot="end" :color="statusColor(store.detail.status)">{{ trRpt("STATUS_" + store.detail.status) }}</ion-badge>
				</ion-item>
				<ion-item><ion-label><p>{{ tr("PERIOD") }}</p><h3>{{ store.detail.startDate }} → {{ store.detail.endDate }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("CRITERIA") }}</p><h3>{{ label(store.detail.criteriaType) }} · {{ money(store.detail.criteriaValue) }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("INPUT") }}</p><h3>{{ label(store.detail.inputType) }} {{ store.detail.inputValue }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("BASIS") }}</p><h3>{{ basisLabel }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("TOTAL") }}</p><h3><strong>{{ money(store.detail.totalCommissionAmount) }}</strong></h3></ion-label></ion-item>
				<ion-item v-if="store.detail.remark"><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ store.detail.remark }}</h3></ion-label></ion-item>
			</ion-list>

			<ion-list class="scr_list" lines="full">
				<ion-list-header>{{ tr("RECIPIENTS") }}</ion-list-header>
				<ion-item v-for="r in store.detail.recipients ?? []" :key="r.recipientId">
					<ion-label>
						<!-- This payslip's staff, highlighted among all recipients. -->
						<h3 :class="{ cmd_me: r.recipientId === staffId }">{{ r.recipientName }}</h3>
						<p>{{ trRpt("COL_DEPT") }}: {{ r.department ?? "—" }} · {{ trRpt("COL_SHARE") }}: {{ r.sharePercentage }}%</p>
						<p>{{ trRpt("COL_AMOUNT") }}: {{ money(r.commissionAmount) }}</p>
					</ion-label>
					<ion-badge slot="end" :color="r.paymentStatus === 'PAID' ? 'success' : 'medium'">{{ r.paymentStatus }}</ion-badge>
				</ion-item>
			</ion-list>
		</template>
		<bm-empty-state v-else description="PRM15000.CMD_NOT_FOUND" />

		<div class="cmd_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CLOSE") }}</ion-button>
			<ion-button @click="emit('ok', { commissionId })">{{ tr("OPEN_SCREEN") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { RPT82000Store } from "@/store/POS/RPT/RPT82000Store";

/** Read-only commission detail (payslip COMMISSION line / PRM17000); approve/reject stay on RPT82000. */
defineOptions({ name: "CommissionDetailModal" });

const props = withDefaults(defineProps<{ commissionId: string; staffId?: string }>(), { staffId: "" });
const emit = defineEmits<{ ok: [{ commissionId: string }]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM15000.CMD_${k}`);
/** Commission wording already exists on the RPT82000 screen — reuse it. */
const trRpt = (k: string) => t(`RPT82000.${k}`);
const store = RPT82000Store();

/** How each recipient's amount was decided (not the ignored setting). */
const basisLabel = computed(() => {
	const basis = String(store.detail?.payoutBasis ?? store.detail?.distributionType ?? "");
	return basis ? t(`RPT82000.BASIS_${basis}`) : "—";
});

onMounted(() => store.load(props.commissionId));

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const label = (v?: string) => String(v ?? "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
function statusColor(s?: string): string {
	if (s === "APPROVED") return "success";
	return s === "REJECTED" ? "danger" : "medium";
}
</script>

<style scoped>
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
.cmd_me { font-weight: 700; }
.cmd_btns { display: flex; gap: 8px; padding: 16px 0; }
.cmd_btns ion-button { flex: 1; }
</style>
