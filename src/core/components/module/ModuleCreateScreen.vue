<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="config.listRoute" />
		<ion-content>
			<ModuleFormFields :fields="config.fields" :form="form" :option-lists="optionLists" :label-ns="config.createTr" />
		</ion-content>
		<ion-footer>
			<ion-toolbar class="mcs_btns">
				<ion-button fill="outline" @click="onCancel">{{ tr("CANCEL") }}</ion-button>
				<ion-button @click="onNext">{{ tr("NEXT") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import POP from "@/core/utilities/pop";
import ModuleFormFields from "@/core/components/module/ModuleFormFields.vue";
import { ModuleFlowStore, type ModuleScreenConfig } from "@/core/modules/module-screen-config";
import { displayLabels, firstMissing, initialForm, loadOptionLists, type OptionLists } from "@/core/modules/module-form";

/** Config-driven create step 1: fill the form, then review on the confirm screen. */
defineOptions({ name: "ModuleCreateScreen" });

const props = defineProps<{ config: ModuleScreenConfig }>();
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`${props.config.createTr}.${key}`);

const form = reactive<Record<string, any>>({});
const optionLists = reactive<OptionLists>({});

// Coming back from confirm restores what was typed; a fresh visit starts blank.
useViewEnter(() => {
	for (const k of Object.keys(form)) delete form[k];
	Object.assign(form, initialForm(props.config.fields, ModuleFlowStore.loadDraft(props.config.module)?.form));
	loadOptionLists(props.config.fields, optionLists);
});

function onCancel(): void {
	ModuleFlowStore.clearDraft(props.config.module);
	router.replace(props.config.listRoute);
}

function onNext(): void {
	const missing = firstMissing(props.config.fields, form);
	if (missing) {
		POP.alert({ status: "error", content: t("POP.REQUIRED", { field: missing.labelKey ? tr(missing.labelKey) : missing.label }) });
		return;
	}
	// One idempotency key per draft: confirm retries can never create the row twice.
	ModuleFlowStore.saveDraft(props.config.module, {
		form: { ...form },
		display: displayLabels(props.config.fields, form, optionLists),
		idempotencyKey: crypto.randomUUID()
	});
	router.push(props.config.confirmRoute);
}
</script>

<style scoped>
.mcs_btns { --padding-start: 16px; --padding-end: 16px; }
.mcs_btns ion-button { width: calc(50% - 4px); }
</style>
