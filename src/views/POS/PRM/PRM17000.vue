<template>
	<div>
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<bm-empty-state v-else-if="!commissions.length" description="PRM17000.NONE" />
		<ion-list v-else class="scr_list" lines="full">
			<ion-item v-for="c in commissions" :key="c.commissionId">
				<ion-label>
					<p class="prm_code">{{ c.commissionCode }}</p>
					<h3>{{ c.startDate }} → {{ c.endDate }}</h3>
					<p>{{ tr("COL_RECIPIENTS") }}: {{ c.recipientCount ?? 0 }} · {{ tr("COL_TOTAL") }}: $ {{ Number(c.totalAmount ?? 0).toFixed(2) }}</p>
					<div class="prm_row_btns">
						<ion-button fill="outline" size="small" @click="onViewDetail(c)">{{ tr("VIEW_DETAIL") }}</ion-button>
						<ion-button size="small" :disabled="!!applying" @click="onApply(c)">{{ tr("APPLY") }}</ion-button>
					</div>
				</ion-label>
			</ion-item>
		</ion-list>
		<div class="prm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CLOSE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import router from "@/router";
import CommissionDetailModal from "@/views/POS/PRM/CommissionDetailModal.vue";
import RetrieveApplicableCommissions from "@/services/api/PRM/retrieveApplicableCommissions";
import ApplyPayrollCommission from "@/services/api/PRM/applyPayrollCommission";
import type { ApplicableCommission } from "@/models/POS/PRM/PRM17000";

/** Apply an APPROVED commission to a DRAFT run (POP.showPopup body). Emits `ok` after an apply. */
defineOptions({ name: "PRM17000" });

const props = defineProps<{ runId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`PRM17000.${k}`);
const loading = ref(true);
const commissions = ref<ApplicableCommission[]>([]);
const applying = ref("");

onMounted(() => {
	RetrieveApplicableCommissions.getInstance().request({
		dataBody: { runId: props.runId },
		listener: {
			onSuccess: (p) => { commissions.value = p.commissionList ?? []; loading.value = false; },
			onFail: () => { commissions.value = []; loading.value = false; }
		}
	});
});

/** Inspect what a commission pays; "ok" = open the full screen (closes this sheet too). */
function onViewDetail(c: ApplicableCommission): void {
	POP.showPopup<{ commissionId?: string }>(CommissionDetailModal, { title: tr("VIEW_DETAIL"), props: { commissionId: c.commissionId } }).promise
		.then((res) => {
			const id = res.data?.commissionId;
			if (!id) return;
			emit("cancel");
			router.push(`/RPT82000?commissionId=${encodeURIComponent(id)}`);
		})
		.catch(() => undefined);
}
function onApply(c: ApplicableCommission): void {
	applying.value = c.commissionId;
	ApplyPayrollCommission.getInstance().request({
		dataBody: { runId: props.runId, commissionId: c.commissionId },
		listener: {
			onSuccess: () => { applying.value = ""; emit("ok"); },
			onFail: (e) => { applying.value = ""; POP.apiError(e, tr("APPLY_FAILED")); }
		}
	});
}
</script>

<style scoped>
.prm_code { font-size: 12px; }
ion-label h3 { font-size: 14px; }
ion-label p { font-size: 12px; }
.prm_row_btns { display: flex; gap: 8px; margin-top: 4px; }
.prm_btns { display: flex; padding: 16px 0; }
.prm_btns ion-button { flex: 1; }
</style>
