<template>
	<div>
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<template v-else>
			<ModuleFormFields :fields="config.fields" :form="form" :option-lists="optionLists" :label-ns="config.createTr" :record-id="String(record[config.idKey] ?? '')" @variants-ready="variantsReady = $event">
				<ion-item>
					<ion-toggle v-model="form.isActive">{{ $t("EDIT.ACTIVE") }}</ion-toggle>
				</ion-item>
			</ModuleFormFields>
			<div class="mem_btns">
				<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ $t("EDIT.CANCEL") }}</ion-button>
				<ion-button :disabled="saving || !variantsReady" @click="onSave">{{ $t("EDIT.SAVE") }}</ion-button>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import ModuleApi from "@/services/api/COMMON/module-api";
import ModuleFormFields from "@/core/components/module/ModuleFormFields.vue";
import { submitBody, type ModuleScreenConfig } from "@/core/modules/module-screen-config";
import { firstMissing, loadOptionLists, optionListsFromPayload, prefillForm, type OptionLists } from "@/core/modules/module-form";

/** Edit sheet for MODULE_CONFIGS modules: create fields + Active, prefilled from detail, saved via updateTr. */
defineOptions({ name: "ModuleEditModal" });

const props = defineProps<{ config: ModuleScreenConfig; record: Record<string, any> }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();

const { t } = useI18n();
const loading = ref(true);
const saving = ref(false);
// A form with a variants field may only save once the saved set has loaded.
const variantsReady = ref(!props.config.fields.some((f) => f.type === "variants"));
const form = reactive<Record<string, any>>({});
const optionLists = reactive<OptionLists>({});

function fill(detail: Record<string, any> | null): void {
	Object.assign(form, prefillForm(props.config.fields, detail, props.record));
	loading.value = false;
}

onMounted(() => {
	const c = props.config;
	const code = { [c.codeKey]: props.record[c.codeKey] };
	if (c.editContextTr) {
		// detail + every dropdown list in one round trip
		ModuleApi.request(c.editContextTr, code, {
			onSuccess: (ctx) => { optionListsFromPayload(c.fields, ctx, optionLists); fill(ctx); },
			onFail: () => { loadOptionLists(c.fields, optionLists); fill(null); }
		});
	} else {
		loadOptionLists(c.fields, optionLists);
		ModuleApi.request(c.detailApi ?? c.detailTr, code, { onSuccess: fill, onFail: () => fill(null) });
	}
});

function onSave(): void {
	const c = props.config;
	if (!c.updateTr || saving.value || !variantsReady.value) return;
	const missing = firstMissing(c.fields, form);
	if (missing) {
		POP.alert({ status: "error", title: t("EDIT.FAILED"), content: t("POP.REQUIRED", { field: missing.labelKey ? t(`${c.createTr}.${missing.labelKey}`) : missing.label }) });
		return;
	}
	saving.value = true;
	ModuleApi.request(c.updateApi ?? c.updateTr, { ...submitBody(form), [c.idKey]: props.record[c.idKey] }, {
		onSuccess: () => { saving.value = false; emit("ok"); },
		onFail: (e) => {
			saving.value = false;
			POP.apiError(e, t("EDIT.FAILED"));
		}
	});
}
</script>

<style scoped>
.mem_btns { display: flex; gap: 8px; padding: 16px 0; }
.mem_btns ion-button { flex: 1; }
</style>
