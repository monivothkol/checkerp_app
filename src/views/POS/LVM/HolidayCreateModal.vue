<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input v-model="store.form.name" :label="`${tr('M_NAME')} *`" label-placement="stacked" :placeholder="tr('M_NAME_PH')" /></ion-item>
			<ion-item><ion-input v-model="store.form.nameKhmer" :label="tr('M_NAME_KM')" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="store.form.date" type="date" :label="`${tr('M_DATE')} *`" label-placement="stacked" /></ion-item>
			<ion-item><ion-toggle v-model="store.form.isRecurring">{{ tr("M_RECURRING") }}</ion-toggle></ion-item>
			<ion-item lines="none"><ion-note class="lvm_hint">{{ tr("M_RECURRING_HINT") }}</ion-note></ion-item>
		</ion-list>
		<div class="lvm_btns">
			<ion-button fill="outline" :disabled="store.saving" @click="emit('cancel')">{{ tr("M_CANCEL") }}</ion-button>
			<ion-button :disabled="store.saving || !store.canSave" @click="store.save(tr('M_FAILED'))">{{ tr("M_SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { HolidayCreateModalStore } from "@/store/POS/LVM/HolidayCreateModalStore";

/** Create a company holiday (LVM31000), opened from LVM30000. */
defineOptions({ name: "HolidayCreateModal" });

const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`LVM30000.${k}`);
const store = HolidayCreateModalStore();

watch(() => store.saved, (v) => { if (v) emit("ok"); });
onMounted(() => store.init());
</script>

<style scoped>
.lvm_hint { font-size: 12px; }
.lvm_btns { display: flex; gap: 8px; padding: 16px 0; }
.lvm_btns ion-button { flex: 1; }
</style>
