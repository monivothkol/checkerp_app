<template>
	<ion-input type="number" :value="modelValue ?? ''" :label="label" :label-placement="labelPlacement" :placeholder="placeholder"
		:min="min" :max="max" :step="step" :inputmode="inputmode ?? (integer ? 'numeric' : 'decimal')" @ion-input="onInput" @ion-change="onChange" />
</template>

<script setup lang="ts" generic="T extends number | null | undefined">
// Numeric ion-input: empty → null (like the web's a-input-number), and after a commit the field re-shows the bound value
// so a store-side clamp is visible. Other attrs (fill, helper-text, disabled, slot…) fall through to ion-input.
import { nextTick } from "vue";
import type { InputCustomEvent } from "@ionic/vue";

defineOptions({ name: "NumberInput" });
const props = withDefaults(defineProps<{
	/** null when empty — typed as the bound field so v-model on a `number` store field compiles (the web's a-input-number also yields null). */
	modelValue?: T;
	label?: string;
	labelPlacement?: "start" | "end" | "fixed" | "stacked" | "floating";
	placeholder?: string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	inputmode?: "decimal" | "numeric";
	/** Decimal places kept on commit (like a-input-number's precision). */
	precision?: number;
	/** Whole numbers only (precision 0, numeric keypad). */
	integer?: boolean;
}>(), { modelValue: undefined, label: undefined, labelPlacement: undefined, placeholder: undefined, min: undefined, max: undefined, step: undefined, inputmode: undefined, precision: undefined, integer: false });
const emit = defineEmits<{ "update:modelValue": [value: T]; change: [value: T] }>();

function parse(v: string | null | undefined): number | null {
	if (v === null || v === undefined || String(v).trim() === "") return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
function onInput(ev: InputCustomEvent): void {
	emit("update:modelValue", parse(ev.detail.value) as T);
}
/** Commit-time normalisation: clamp to min/max, round to precision. */
function normalize(n: number | null): number | null {
	if (n === null) return null;
	const dp = props.integer ? 0 : props.precision;
	if (dp !== undefined) n = Math.round(n * 10 ** dp) / 10 ** dp;
	if (props.min !== undefined && props.min !== "" && n < Number(props.min)) n = Number(props.min);
	if (props.max !== undefined && props.max !== "" && n > Number(props.max)) n = Number(props.max);
	return n;
}
function onChange(ev: InputCustomEvent): void {
	const n = normalize(parse(ev.detail.value));
	emit("update:modelValue", n as T);
	emit("change", n as T);
	const el = ev.target;
	// Let the parent apply (and possibly clamp) the value, then show what it kept.
	void nextTick(() => { el.value = props.modelValue ?? ""; });
}
</script>
