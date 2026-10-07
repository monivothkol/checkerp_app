<template>
	<div>
		<p v-if="customerName" class="cc_who">{{ customerName }}</p>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-select v-model="form.creditPolicyId" :label="tr('POLICY')" label-placement="stacked" :placeholder="tr('POLICY_PH')" interface="action-sheet">
					<ion-select-option :value="undefined">—</ion-select-option>
					<ion-select-option v-for="p in policies" :key="p.creditPolicyId" :value="p.creditPolicyId">
						{{ p.name }}{{ p.isDefault ? ` (${tr("DEFAULT")})` : "" }}
					</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item lines="none"><ion-note class="cc_hint">{{ tr("POLICY_HINT") }}</ion-note></ion-item>
			<ion-item>
				<ion-input v-model.number="form.creditLimitOverride" :label="tr('LIMIT_OVERRIDE')" label-placement="stacked" type="number" inputmode="decimal" min="0" :placeholder="tr('USE_POLICY')" />
			</ion-item>
			<ion-item>
				<ion-input v-model.number="form.creditTermOverride" :label="tr('TERM_OVERRIDE')" label-placement="stacked" type="number" inputmode="numeric" min="0" :placeholder="tr('USE_POLICY')" />
			</ion-item>
			<ion-item>
				<ion-input v-model.number="form.maxOverdueOverride" :label="tr('MAX_OVERDUE_OVERRIDE')" label-placement="stacked" type="number" inputmode="decimal" min="0" :placeholder="tr('USE_POLICY')" />
			</ion-item>
		</ion-list>
		<div class="cc_btns">
			<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving" @click="submit">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import RetrieveCreditPolicyList from "@/services/api/CRD/retrieveCreditPolicyList";
import UpdateCustomerCredit from "@/services/api/CUS/updateCustomerCredit";
import type { CreditPolicyRow } from "@/models/POS/CRD/CRD10000";

/** Customer credit policy + overrides (CUS detail action). Empty override = use the policy value. */
defineOptions({ name: "CustomerCreditModal" });

const props = defineProps<{
	customerId: string;
	customerName?: string;
	creditPolicyId?: string;
	creditLimitOverride?: number | null;
	creditTermOverride?: number | null;
	maxOverdueOverride?: number | null;
}>();
const emit = defineEmits<{ ok: []; cancel: [] }>();

const { t } = useI18n();
const tr = (key: string) => t(`CUS40000.${key}`);
const saving = ref(false);
const policies = ref<CreditPolicyRow[]>([]);
const form = reactive({
	creditPolicyId: props.creditPolicyId,
	creditLimitOverride: props.creditLimitOverride ?? null,
	creditTermOverride: props.creditTermOverride ?? null,
	maxOverdueOverride: props.maxOverdueOverride ?? null
});

onMounted(() => {
	RetrieveCreditPolicyList.getInstance().request({
		dataBody: { activeOnly: true },
		listener: { onSuccess: (p) => { policies.value = p.creditPolicyList ?? []; } }
	});
});

/** A cleared number input yields "" — send null so the policy value applies. */
const num = (v: unknown) => (v === "" || v === undefined || v === null ? null : Number(v));

function submit(): void {
	if (saving.value) return;
	saving.value = true;
	UpdateCustomerCredit.getInstance().request({
		dataBody: {
			customerId: props.customerId,
			creditPolicyId: form.creditPolicyId,
			creditLimitOverride: num(form.creditLimitOverride),
			creditTermOverride: num(form.creditTermOverride),
			maxOverdueOverride: num(form.maxOverdueOverride)
		},
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("SAVE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.cc_who { font-size: 14px; font-weight: 700; margin: 0 0 8px; }
.cc_hint { font-size: 12px; }
.cc_btns { display: flex; gap: 8px; padding: 16px 0; }
.cc_btns ion-button { flex: 1; }
</style>
