<template>
	<div>
		<ion-searchbar v-model="kw" :placeholder="placeholder" :debounce="0" />
		<ion-list class="scr_list" lines="full">
			<ion-item v-if="noneLabel" button :detail="false" @click="emit('ok', undefined)">
				<ion-label color="medium">{{ noneLabel }}</ion-label>
				<ion-icon v-if="!selected?.length" slot="end" :icon="checkmark" color="primary" />
			</ion-item>
			<ion-item v-for="o in shown" :key="o.value" button :detail="false" @click="emit('ok', o.value)">
				<ion-label>{{ o.label }}</ion-label>
				<ion-icon v-if="selected?.includes(o.value)" slot="end" :icon="checkmark" color="primary" />
			</ion-item>
		</ion-list>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { checkmark } from "ionicons/icons";

/** Searchable option list in a POP sheet (the web's show-search a-select). Emits ok(value); undefined = the "none" row. */
defineOptions({ name: "PickListSheet" });

const props = defineProps<{ options: { value: string; label: string }[]; selected?: string[]; noneLabel?: string; placeholder?: string }>();
const emit = defineEmits<{ ok: [string | undefined]; cancel: [] }>();
const kw = ref("");
const shown = computed(() => {
	const q = kw.value.trim().toLowerCase();
	return q ? props.options.filter((o) => o.label.toLowerCase().includes(q)) : props.options;
});
</script>
