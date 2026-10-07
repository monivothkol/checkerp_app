<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="config.createRoute" />
		<ion-content>
			<ion-list class="scr_list" v-if="draft" lines="full">
				<ion-item v-for="field in visibleFields" :key="field.key">
					<ion-label>
						<p>{{ field.labelKey ? t(`${config.createTr}.${field.labelKey}`) : field.label }}</p>
						<h3 class="mcf_value">{{ show(field) }}</h3>
					</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer v-if="draft">
			<ion-toolbar class="mcf_btns">
				<ion-button fill="outline" :disabled="saving" @click="router.back()">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="saving" @click="onConfirm">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import POP from "@/core/utilities/pop";
import { displayPhones } from "@/core/utilities/phones";
import ModuleApi from "@/services/api/COMMON/module-api";
import { ModuleFlowStore, submitBody, type ModuleField, type ModuleScreenConfig } from "@/core/modules/module-screen-config";

/** Config-driven create step 2: review the draft and save it (idempotent). */
defineOptions({ name: "ModuleConfirmScreen" });

interface Draft { form: Record<string, any>; display?: Record<string, string>; idempotencyKey: string }

const props = defineProps<{ config: ModuleScreenConfig }>();
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`${props.config.confirmTr ?? props.config.module + "30000"}.${key}`);

const draft = ref<Draft | null>(null);
const saving = ref(false);
const visibleFields = computed(() => props.config.fields.filter((f) => f.type !== "variants" && f.type !== "images"));

useViewEnter(() => {
	draft.value = ModuleFlowStore.loadDraft(props.config.module) as Draft | null;
	saving.value = false;
	// Deep link / refresh with no draft: start the flow over.
	if (!draft.value) router.replace(props.config.createRoute);
});

function show(field: ModuleField): string {
	const v = draft.value?.display?.[field.key] ?? draft.value?.form[field.key];
	if (field.type === "switch") return v ? t("EDIT.YES") : t("EDIT.NO");
	if (field.type === "phones") return displayPhones(v) || "-";
	if (field.type === "addresses") {
		const list = Array.isArray(v) ? v.filter((a) => String(a?.address ?? "").trim()) : [];
		return list.length ? list.map((a) => a.label || a.address).join(" · ") : "-";
	}
	return v === undefined || v === null || v === "" ? "-" : String(v);
}

function onConfirm(): void {
	const d = draft.value;
	const c = props.config;
	if (!d || saving.value) return;
	saving.value = true;
	ModuleApi.request(c.createApi ?? c.createTr, submitBody(d.form), {
		onSuccess: (payload) => {
			// Navigate only on success: the returned code proves the row is committed.
			ModuleFlowStore.saveResult(c.module, payload);
			ModuleFlowStore.clearDraft(c.module);
			router.replace(c.skipResult ? `${c.detailRoute}?${c.codeKey}=${encodeURIComponent(String(payload[c.codeKey] ?? ""))}` : c.resultRoute);
		},
		onFail: (e) => {
			saving.value = false;
			POP.apiError(e, t("EDIT.FAILED"));
		}
	}, { headers: { "Idempotency-Key": d.idempotencyKey }, enableLoading: true });
}
</script>

<style scoped>
.mcf_value { font-size: 14px; white-space: normal; }
.mcf_btns { --padding-start: 16px; --padding-end: 16px; }
.mcf_btns ion-button { width: calc(50% - 4px); }
</style>
