<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="store.newLabel" :maxlength="100" :placeholder="tr('NAME_PH')" :clear-input="true" enterkeyhint="done" @keyup.enter="onCreate" />
				<ion-button slot="end" :disabled="!store.newLabel.trim() || store.saving" @click="onCreate">
					<ion-icon slot="start" :icon="add" />{{ tr("CREATE") }}
				</ion-button>
			</ion-item>
		</ion-list>
		<ion-progress-bar v-if="store.loading" type="indeterminate" />

		<ion-list v-if="store.fields.length" class="scr_list" lines="full">
			<ion-item-sliding v-for="f in store.fields" :key="f.fieldId">
				<ion-item button :detail="true" @click="onUsage(f)">
					<ion-label>
						<h3>{{ f.label }}</h3>
						<p>{{ tr("COL_USAGE") }}: {{ f.usageCount }}</p>
					</ion-label>
				</ion-item>
				<!-- only an unused field may be deleted -->
				<ion-item-options v-if="f.usageCount === 0" side="end">
					<ion-item-option color="danger" @click="onDelete(f)">{{ tr("DELETE") }}</ion-item-option>
				</ion-item-options>
			</ion-item-sliding>
		</ion-list>
		<bm-empty-state v-else-if="!store.loading" />

		<div class="cf_btns">
			<ion-button expand="block" fill="outline" @click="emit('cancel')">{{ tr("CLOSE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { add } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import type { ModuleApiError } from "@/services/api/COMMON/module-api";
import { PRD13000Store } from "@/store/POS/PRD/PRD13000Store";
import PRD13100 from "@/views/POS/PRD/PRD13100.vue";
import type { ProductCustomField } from "@/models/POS/PRD/PRD13000";

/** PRD13000 — product custom field manager (POP.showPopup body from PRD10000). */
defineOptions({ name: "PRD13000" });

const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`PRD13000.${key}`);
const store = PRD13000Store();

onMounted(() => store.load());

function onDone(ok: boolean, successKey: string, error?: ModuleApiError): void {
	if (ok) POP.alert({ status: "success", title: tr(successKey) });
	else POP.apiError(error, tr("FAILED"));
}
function onCreate(): void {
	const label = store.newLabel.trim();
	if (!label || store.saving) return;
	POP.confirm({
		title: tr("CREATE_TITLE"),
		content: label,
		okBtn: { btnText: tr("CREATE"), onClick: () => store.create((ok, e) => onDone(ok, "CREATED", e)) }
	});
}
function onDelete(f: ProductCustomField): void {
	POP.confirm({
		title: tr("DELETE_TITLE"),
		content: f.label,
		okBtn: { btnText: tr("DELETE"), onClick: () => store.remove(f.fieldId, (ok, e) => onDone(ok, "DELETED", e)) }
	});
}
function onUsage(f: ProductCustomField): void {
	POP.showPopup(PRD13100, { title: `${tr("USAGE_TITLE")}: ${f.label}`, props: { fieldId: f.fieldId } }).promise.catch(() => undefined);
}
</script>

<style scoped>
.cf_btns { padding: 16px 0; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
