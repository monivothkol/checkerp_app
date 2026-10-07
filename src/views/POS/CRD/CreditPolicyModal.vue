<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="form.name" :label="`${tr('NAME')} *`" label-placement="stacked" :placeholder="tr('NAME_PH')" :clear-input="true" /></ion-item>
		</ion-list>

		<details class="crd_vs">
			<summary><ion-icon :icon="informationCircleOutline" /> {{ tr("VS_LABEL") }}</summary>
			<p><b>{{ tr("CREDIT_LIMIT") }}</b> — {{ tr("VS_LIMIT_D") }}</p>
			<p><b>{{ tr("MAX_OVERDUE_AMOUNT") }}</b> — {{ tr("VS_OVERDUE_D") }}</p>
			<p class="crd_vs_eg">{{ tr("VS_EG") }}</p>
		</details>

		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="num.creditLimit" :label="tr('CREDIT_LIMIT')" label-placement="stacked" type="number" inputmode="decimal" min="0" :placeholder="tr('UNLIMITED')" /></ion-item>
			<ion-item><ion-input v-model="num.creditTermDays" :label="tr('CREDIT_TERM_DAYS')" label-placement="stacked" type="number" inputmode="numeric" min="0" :placeholder="tr('NO_TERM')" /></ion-item>
			<ion-item><ion-input v-model="num.maxOverdueAmount" :label="tr('MAX_OVERDUE_AMOUNT')" label-placement="stacked" type="number" inputmode="decimal" min="0" :placeholder="tr('UNLIMITED')" /></ion-item>
			<ion-item>
				<ion-select v-model="form.behaviorOnCreditExceeded" :label="tr('BEHAVIOR_EXCEEDED')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="b in behaviors" :key="b" :value="b">{{ tr("BEHAVIOR_" + b) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.behaviorOnOverdue" :label="tr('BEHAVIOR_OVERDUE')" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="b in behaviors" :key="b" :value="b">{{ tr("BEHAVIOR_" + b) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item><ion-toggle v-model="form.isDefault">{{ tr("IS_DEFAULT") }}</ion-toggle></ion-item>
			<ion-item><ion-toggle v-model="form.isActive">{{ tr("IS_ACTIVE") }}</ion-toggle></ion-item>
		</ion-list>

		<div class="crd_btns">
			<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving || !form.name" @click="submit">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { informationCircleOutline } from "ionicons/icons";
import { CRD10000Store } from "@/store/POS/CRD/CRD10000Store";
import type { CreditPolicyRow, CreditPolicySaveRequest } from "@/models/POS/CRD/CRD10000";

/** Create / edit a credit policy (sheet body); the CRD10000 store reloads its list on success. */
defineOptions({ name: "CreditPolicyModal" });

const props = withDefaults(defineProps<{ policy?: CreditPolicyRow | null }>(), { policy: null });
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`CRD10000.${k}`);
const store = CRD10000Store();
const saving = ref(false);
const behaviors = ["BLOCK", "WARN", "REQUIRE_APPROVAL"];

const p = props.policy;
const form = reactive<CreditPolicySaveRequest>({
	creditPolicyId: p?.creditPolicyId,
	name: p?.name ?? "",
	behaviorOnCreditExceeded: p?.behaviorOnCreditExceeded ?? "BLOCK",
	behaviorOnOverdue: p?.behaviorOnOverdue ?? "BLOCK",
	applyTo: p?.applyTo ?? "ALL",
	isDefault: p?.isDefault ?? false,
	isActive: p?.isActive ?? true
});
// ion-input yields strings; blank means "unlimited / no term" (null), as on the web.
const str = (v?: number | null) => (v == null ? "" : String(v));
const num = reactive({ creditLimit: str(p?.creditLimit), creditTermDays: str(p?.creditTermDays), maxOverdueAmount: str(p?.maxOverdueAmount) });
const toNum = (v: string | number) => (String(v).trim() === "" ? null : Math.max(0, Number(v)));

async function submit(): Promise<void> {
	if (!form.name || saving.value) return;
	saving.value = true;
	const ok = await store.save({
		...form,
		creditLimit: toNum(num.creditLimit),
		creditTermDays: toNum(num.creditTermDays),
		maxOverdueAmount: toNum(num.maxOverdueAmount)
	}, tr("SAVE_FAILED"));
	saving.value = false;
	if (ok) emit("ok");
}
</script>

<style scoped>
.crd_vs { margin: 8px 16px; font-size: 12px; line-height: 1.5; }
.crd_vs summary { color: var(--ion-color-primary); cursor: pointer; display: flex; align-items: center; gap: 4px; }
.crd_vs p { margin: 4px 0; }
.crd_vs_eg { padding-top: 4px; border-top: 1px solid var(--ion-color-light-shade); }
.crd_btns { display: flex; gap: 8px; padding: 16px 0; }
.crd_btns ion-button { flex: 1; }
</style>
