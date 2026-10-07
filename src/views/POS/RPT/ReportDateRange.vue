<template>
	<ion-toolbar class="rdr">
		<div class="rdr_row">
			<ion-input :value="modelValue?.[0] ?? ''" type="date" :aria-label="`${$t('EXPORT.DATE')} ▸`" @ion-change="set(0, $event.detail.value)" />
			<span>→</span>
			<ion-input :value="modelValue?.[1] ?? ''" type="date" :aria-label="`${$t('EXPORT.DATE')} ◂`" @ion-change="set(1, $event.detail.value)" />
			<ion-button v-if="clearable && (modelValue?.[0] || modelValue?.[1])" fill="clear" size="small" @click="emitRange(undefined)">✕</ion-button>
		</div>
	</ion-toolbar>
</template>

<script setup lang="ts">
/** From/to date pair for report headers (the web's a-range-picker); emits only complete ranges or a clear. */
defineOptions({ name: "ReportDateRange" });

const props = defineProps<{ modelValue?: [string, string]; clearable?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [[string, string] | undefined]; change: [] }>();

function emitRange(v: [string, string] | undefined): void {
	emit("update:modelValue", v);
	emit("change");
}
function set(i: 0 | 1, v?: string | null): void {
	const next: [string, string] = [props.modelValue?.[0] ?? "", props.modelValue?.[1] ?? ""];
	next[i] = v ?? "";
	// a-range-picker only commits both ends; a half range waits for the other date.
	if (next[0] && next[1]) emitRange(next);
	else if (!next[0] && !next[1] && props.clearable) emitRange(undefined);
	else emit("update:modelValue", next);
}
</script>

<style scoped>
.rdr { --padding-start: 16px; --padding-end: 16px; }
.rdr_row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.rdr_row ion-input { flex: 1; font-size: 12px; }
</style>
