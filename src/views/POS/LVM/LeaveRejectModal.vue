<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-textarea v-model="reason" :label="tr('M_REASON')" label-placement="stacked" :placeholder="tr('M_REASON_PH')" :rows="3" auto-grow />
			</ion-item>
		</ion-list>
		<div class="lvm_btns">
			<ion-button fill="outline" @click="emit('cancel')">{{ tr("M_CANCEL") }}</ion-button>
			<ion-button color="danger" @click="emit('ok', reason || undefined)">{{ tr("M_REJECT") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

/** Reject-reason prompt for LVM14000I03 (POP.showPopup body). Emits `ok` with the reason. */
defineOptions({ name: "LeaveRejectModal" });

const emit = defineEmits<{ ok: [string | undefined]; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`LVM14000.${k}`);
const reason = ref("");
</script>

<style scoped>
.lvm_btns { display: flex; gap: 8px; padding: 16px 0; }
.lvm_btns ion-button { flex: 1; }
</style>
