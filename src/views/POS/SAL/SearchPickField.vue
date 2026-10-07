<template>
	<div class="spf">
		<ion-list v-if="label" class="scr_list" lines="none"><ion-list-header>{{ label }}</ion-list-header></ion-list>
		<ion-searchbar :value="kw" :placeholder="placeholder" :disabled="disabled" :debounce="0" @ion-input="onInput($event.detail.value ?? '')" />
		<ion-progress-bar v-if="searching && kw.trim()" type="indeterminate" />
		<ion-list v-else-if="kw.trim() && options.length" class="scr_list spf_list" lines="full">
			<ion-item v-for="o in options" :key="o.value" button :detail="false" @click="onPick(o.value)">
				<ion-label>{{ o.label }}</ion-label>
			</ion-item>
		</ion-list>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

/** Mobile stand-in for the web's searchable a-select: type → `search(kw)`, tap a result → `pick(value)`. */
defineOptions({ name: "SearchPickField" });

defineProps<{ label?: string; options: { value: string; label: string }[]; searching?: boolean; placeholder?: string; disabled?: boolean }>();
const emit = defineEmits<{ search: [string]; pick: [string] }>();
const kw = ref("");

function onInput(v: string): void {
	kw.value = v;
	emit("search", v);
}
function onPick(v: string): void {
	kw.value = "";
	emit("pick", v);
}
</script>

<style scoped>
.spf { padding: 0 8px; }
.spf_list { max-height: 240px; overflow-y: auto; }
.spf_list ion-label { font-size: 14px; }
</style>
