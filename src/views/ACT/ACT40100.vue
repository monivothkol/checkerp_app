<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="form.accountCode" :label="`${tr('CODE')} *`" label-placement="stacked" :disabled="isEdit" :placeholder="tr('CODE_PH')" />
			</ion-item>
			<ion-item>
				<ion-select v-model="form.accountType" :label="`${tr('TYPE')} *`" label-placement="stacked" :disabled="isEdit" interface="action-sheet">
					<ion-select-option v-for="ty in TYPES" :key="ty" :value="ty">{{ ty }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model="form.accountName" :label="`${tr('NAME')} *`" label-placement="stacked" :placeholder="tr('NAME_PH')" />
			</ion-item>
			<ion-item>
				<ion-select :value="form.parentCode ?? ''" :label="tr('PARENT')" label-placement="stacked" :placeholder="tr('PARENT_PH')" :disabled="isEdit"
					interface="action-sheet" @ion-change="form.parentCode = $event.detail.value || undefined">
					<ion-select-option value="">—</ion-select-option>
					<ion-select-option v-for="o in parentOptions" :key="o.value" :value="o.value">{{ o.label }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item v-if="isEdit">
				<ion-toggle v-model="form.isActive" :disabled="!!account?.isSystem">{{ tr("STATUS") }} · {{ form.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-toggle>
			</ion-item>
			<ion-item>
				<ion-textarea v-model="form.description" :label="tr('DESCRIPTION')" label-placement="stacked" :rows="2" auto-grow />
			</ion-item>
		</ion-list>
		<div class="af_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="!valid || saving" @click="save">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import ModuleApi, { type ModuleApiError } from "@/services/api/COMMON/module-api";
import POP from "@/core/utilities/pop";
import type { ActAccount } from "@/models/ACT/ACT40000";

/** Account create (ACT40100) / edit (ACT40200) sheet body; code, type and parent are frozen on edit. */
defineOptions({ name: "ACT40100" });

const TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
const props = withDefaults(defineProps<{ account?: ActAccount | null; accounts?: ActAccount[] }>(), { account: null, accounts: () => [] });
const emit = defineEmits<{ ok: [{ accountCode: string }]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ACT40100.${k}`);

const saving = ref(false);
const form = reactive({
	accountCode: props.account?.accountCode ?? "",
	accountName: props.account?.accountName ?? "",
	accountType: props.account?.accountType ?? "EXPENSE",
	parentCode: (props.account?.parentCode ?? undefined) as string | undefined,
	description: props.account?.description ?? "",
	isActive: props.account?.isActive ?? true
});
const isEdit = computed(() => !!props.account);
const valid = computed(() => !!form.accountCode.trim() && !!form.accountName.trim());
const parentOptions = computed(() => props.accounts
	.filter((a) => a.isHeader)
	.map((a) => ({ value: a.accountCode, label: `${a.accountCode} · ${a.accountName}` })));

function save(): void {
	saving.value = true;
	const trCode = isEdit.value ? "ACT40200" : "ACT40100";
	const body = isEdit.value
		? { accountCode: form.accountCode, accountName: form.accountName, description: form.description, isActive: form.isActive }
		: {
			accountCode: form.accountCode.trim(),
			accountName: form.accountName.trim(),
			accountType: form.accountType,
			parentCode: form.parentCode ?? "",
			description: form.description
		};
	ModuleApi.request(trCode, body, {
		onSuccess: () => {
			saving.value = false;
			POP.openNotification({ type: "success", content: tr("SAVED") });
			emit("ok", { accountCode: form.accountCode });
		},
		onFail: (e: ModuleApiError) => {
			saving.value = false;
			POP.openNotification({ type: "error", content: e?.message ?? tr("SAVE_FAILED") });
		}
	});
}
</script>

<style scoped>
.af_btns { display: flex; gap: 8px; padding: 16px 0; }
.af_btns ion-button { flex: 1; }
</style>
