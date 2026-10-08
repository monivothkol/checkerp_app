<template>
	<ion-item button :detail="true" :disabled="disabled" @click="open">
		<ion-label class="ion-text-wrap">
			<p>{{ label }}</p>
			<h3 :class="{ pf_empty: !display }">{{ display || placeholder || "—" }}</h3>
		</ion-label>
	</ion-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import POP from "@/core/utilities/pop";
import PickListSheet from "@/core/components/PickListSheet.vue";

/**
 * A searchable picker field (the web's show-search a-select): shows the chosen label, tap → search sheet.
 * Single: v-model is the value (undefined = none). Multiple: v-model is an array and each pick toggles.
 */
defineOptions({ name: "PickField" });

const props = defineProps<{
	modelValue?: string | string[];
	options: { value: string; label: string }[];
	label: string;
	placeholder?: string;
	/** Single mode: a first row that clears the value (e.g. "Myself", "All staff"). */
	noneLabel?: string;
	multiple?: boolean;
	disabled?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [string | string[] | undefined]; change: [string | string[] | undefined] }>();

const values = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []));
const display = computed(() => values.value.map((v) => props.options.find((o) => o.value === v)?.label ?? v).join(", "));

function open(): void {
	POP.showPopup<string | undefined>(PickListSheet, {
		title: props.label,
		props: { options: props.options, selected: values.value, noneLabel: props.multiple ? undefined : props.noneLabel, placeholder: props.placeholder }
	}).promise.then((r) => {
		let next: string | string[] | undefined;
		if (props.multiple) {
			const v = r.data;
			next = !v ? values.value : values.value.includes(v) ? values.value.filter((x) => x !== v) : [...values.value, v];
		} else {
			next = r.data;
		}
		emit("update:modelValue", next);
		emit("change", next);
	}).catch(() => undefined);
}
</script>

<style scoped>
h3 { font-size: 14px; }
p { font-size: 12px; }
.pf_empty { color: var(--ion-color-medium); }
</style>
