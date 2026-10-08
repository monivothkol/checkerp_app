<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="store.form.name" :label="`${tr('M_NAME')} *`" label-placement="stacked" :placeholder="tr('M_NAME_PH')" /></ion-item>
			<ion-item><ion-input v-model="store.form.nameKhmer" :label="tr('M_NAME_KM')" label-placement="stacked" /></ion-item>
			<ion-item>
				<ion-input :value="store.form.code" :label="`${tr('M_CODE')} *`" label-placement="stacked" :placeholder="tr('M_CODE_PH')" :disabled="store.isEdit" @ion-input="store.setCode(String($event.detail.value ?? ''))" />
			</ion-item>
			<ion-item><NumberInput v-model="store.form.defaultDaysPerYear" :label="`${tr('M_DAYS_YEAR')} *`" label-placement="stacked" :min="0" :max="365" integer /></ion-item>
			<ion-item><ion-toggle v-model="store.form.isPaid">{{ tr("M_PAID") }}</ion-toggle></ion-item>
			<ion-item><ion-toggle v-model="store.form.requiresAttachment">{{ tr("M_ATTACHMENT") }}</ion-toggle></ion-item>
			<ion-item>
				<ion-input :value="store.form.maxConsecutiveDays" :label="tr('M_MAX_CONSECUTIVE')" label-placement="stacked" type="number" inputmode="numeric" min="1" max="365" :placeholder="tr('M_OPTIONAL')" @ion-input="onMax(String($event.detail.value ?? ''))" />
			</ion-item>
		</ion-list>
		<div class="lvm_btns">
			<ion-button fill="outline" :disabled="store.saving" @click="emit('cancel')">{{ tr("M_CANCEL") }}</ion-button>
			<ion-button :disabled="store.saving || !store.canSave" @click="store.save(tr('M_FAILED'))">{{ tr("M_SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { LeaveTypeCreateModalStore } from "@/store/POS/LVM/LeaveTypeCreateModalStore";
import type { LeaveType } from "@/models/POS/LVM/LVM20000";

/** Create/edit a leave type (LVM20000I02/I03); code is read-only when editing. */
defineOptions({ name: "LeaveTypeCreateModal" });

const props = defineProps<{ type?: LeaveType }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`LVM20000.${k}`);
const store = LeaveTypeCreateModalStore();

watch(() => store.saved, (v) => { if (v) emit("ok"); });
onMounted(() => store.init(props.type));

// Optional field: cleared input = no limit (null), as the web number input does.
function onMax(v: string): void {
	store.form.maxConsecutiveDays = v === "" ? null : Number(v);
}
</script>

<style scoped>
.lvm_btns { display: flex; gap: 8px; padding: 16px 0; }
.lvm_btns ion-button { flex: 1; }
</style>
