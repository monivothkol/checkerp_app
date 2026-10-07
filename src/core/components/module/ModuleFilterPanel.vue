<template>
	<div>
		<ion-list class="scr_list" lines="full">
			<template v-for="f in filters" :key="f.key">
				<template v-if="f.type === 'dateRange'">
					<ion-item><ion-input v-model="range(f.key)[0]" :label="`${tr(f.labelKey)} ▸`" label-placement="stacked" type="date" /></ion-item>
					<ion-item><ion-input v-model="range(f.key)[1]" :label="`${tr(f.labelKey)} ◂`" label-placement="stacked" type="date" /></ion-item>
				</template>
				<ion-item v-else>
					<ion-select v-model="draft[f.key]" :label="tr(f.labelKey)" label-placement="stacked" interface="action-sheet">
						<ion-select-option v-for="o in optionsByKey[f.key] ?? []" :key="String(o.value)" :value="o.value">{{ o.label }}</ion-select-option>
					</ion-select>
				</ion-item>
			</template>
		</ion-list>
		<div class="mfp_btns">
			<ion-button fill="outline" @click="emit('ok', {})">{{ $t("LIST.CLEAR") }}</ion-button>
			<ion-button @click="onApply">{{ $t("LIST.APPLY") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { ModuleListFilter } from "@/core/modules/module-screen-config";

/** Filter sheet for ModuleListScreen; emits ok with the new filter values ({} = cleared). */
defineOptions({ name: "ModuleFilterPanel" });

const props = defineProps<{
	filters: ModuleListFilter[];
	values: Record<string, unknown>;
	optionsByKey: Record<string, { value: unknown; label: string }[]>;
	listTr: string;
}>();
const emit = defineEmits<{ ok: [Record<string, unknown>]; cancel: [] }>();

const { t } = useI18n();
const tr = (key: string) => t(`${props.listTr}.${key}`);
const draft = reactive<Record<string, any>>({ ...props.values });

function range(key: string): string[] {
	if (!Array.isArray(draft[key])) draft[key] = ["", ""];
	return draft[key];
}

/** Drops empty values; a date range needs both ends. */
function onApply(): void {
	const out: Record<string, unknown> = {};
	for (const f of props.filters) {
		const v = draft[f.key];
		if (f.type === "dateRange") {
			if (Array.isArray(v) && v[0] && v[1]) out[f.key] = [v[0], v[1]];
		} else if (v !== undefined && v !== null && v !== "") {
			out[f.key] = v;
		}
	}
	emit("ok", out);
}
</script>

<style scoped>
.mfp_btns { display: flex; gap: 8px; padding: 16px 0; }
.mfp_btns ion-button { flex: 1; }
</style>
