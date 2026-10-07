<template>
	<ion-item>
		<div class="adr">
			<ion-input :value="from" type="date" :label="`${$t('EXPORT.DATE')} ▸`" label-placement="stacked" @ion-change="onPick($event.detail.value, to)" />
			<ion-input :value="to" type="date" :label="`${$t('EXPORT.DATE')} ◂`" label-placement="stacked" @ion-change="onPick(from, $event.detail.value)" />
		</div>
	</ion-item>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

/** Phone stand-in for a-range-picker: emits [from, to] once both ends are set, undefined when both are cleared. */
defineOptions({ name: "ActDateRange" });

const props = withDefaults(defineProps<{ modelValue?: [string, string] | null; required?: boolean }>(), { modelValue: undefined, required: false });
const emit = defineEmits<{ "update:modelValue": [[string, string] | undefined]; change: [] }>();

const from = ref(props.modelValue?.[0] ?? "");
const to = ref(props.modelValue?.[1] ?? "");
watch(() => props.modelValue, (v) => { from.value = v?.[0] ?? ""; to.value = v?.[1] ?? ""; });

function onPick(f?: string | null, t?: string | null): void {
	from.value = f ?? "";
	to.value = t ?? "";
	if (from.value && to.value) {
		emit("update:modelValue", [from.value, to.value]);
		emit("change");
	} else if (!from.value && !to.value && !props.required) {
		emit("update:modelValue", undefined);
		emit("change");
	}
}
</script>

<style scoped>
.adr { display: flex; gap: 8px; width: 100%; }
.adr ion-input { flex: 1; }
</style>
