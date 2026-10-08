<template>
	<ion-toolbar class="rdr">
		<div class="rdr_row">
			<ion-input :value="from" type="date" :aria-label="`${$t('EXPORT.DATE')} ▸`" @ion-change="set(0, $event.detail.value)" />
			<span>→</span>
			<ion-input :value="to" type="date" :aria-label="`${$t('EXPORT.DATE')} ◂`" @ion-change="set(1, $event.detail.value)" />
			<ion-button v-if="clearable && (from || to)" fill="clear" size="small" @click="from = ''; to = ''; emitRange(undefined)">✕</ion-button>
		</div>
	</ion-toolbar>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

/** From/to date pair for report headers (the web's a-range-picker); emits only complete ranges or a clear. */
defineOptions({ name: "ReportDateRange" });

const props = defineProps<{ modelValue?: [string, string]; clearable?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [[string, string] | undefined]; change: [] }>();

function emitRange(v: [string, string] | undefined): void {
	emit("update:modelValue", v);
	emit("change");
}
// A half range stays local (never reaches the model), so screens never send an empty dateFrom/dateTo.
const from = ref(props.modelValue?.[0] ?? "");
const to = ref(props.modelValue?.[1] ?? "");
watch(() => props.modelValue, (v) => { from.value = v?.[0] ?? ""; to.value = v?.[1] ?? ""; });

function set(i: 0 | 1, v?: string | null): void {
	if (i === 0) from.value = v ?? "";
	else to.value = v ?? "";
	if (from.value && to.value) emitRange([from.value, to.value]);
	else if (!from.value && !to.value && props.clearable) emitRange(undefined);
}
</script>

<style scoped>
.rdr { --padding-start: 16px; --padding-end: 16px; }
.rdr_row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.rdr_row ion-input { flex: 1; font-size: 12px; }
</style>
