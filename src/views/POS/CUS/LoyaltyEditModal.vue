<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="store.form.conditionName" :label="`${tr('NAME')} *`" label-placement="stacked" />
			</ion-item>
			<ion-item>
				<ion-input v-model.number="store.form.pointReward" :label="`${tr('POINTS')} *`" label-placement="stacked" type="number" inputmode="decimal" min="0.1" step="0.1" />
			</ion-item>
			<ion-item>
				<ion-toggle v-model="store.form.isActive" justify="space-between">{{ $t("EDIT.ACTIVE") }}</ion-toggle>
			</ion-item>
		</ion-list>
		<p class="lem_note">{{ tr("EDIT_NOTE") }}</p>
		<div class="lem_btns">
			<ion-button fill="outline" :disabled="store.saving" @click="emit('cancel')">{{ $t("EDIT.CANCEL") }}</ion-button>
			<ion-button :disabled="store.saving || !store.canSave" @click="onSave">{{ $t("EDIT.SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { LoyaltyEditModalStore } from "@/store/POS/CUS/LoyaltyEditModalStore";
import type { LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

/** Edit a loyalty condition (CUS35000): only name, points and active; the rule itself is immutable. */
defineOptions({ name: "LoyaltyEditModal" });

const props = defineProps<{ record: LoyaltyConditionRow }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`CUS31000.${key}`);
const store = LoyaltyEditModalStore();

watch(() => store.saved, (v) => { if (v) emit("ok"); });
onMounted(() => store.init(props.record));

function onSave(): void {
	store.save(String(props.record.conditionId ?? ""), t("EDIT.FAILED"));
}
</script>

<style scoped>
.lem_note { font-size: 12px; color: #6b6b76; margin: 4px 0 0; }
.lem_btns { display: flex; gap: 8px; padding: 16px 0; }
.lem_btns ion-button { flex: 1; }
</style>
