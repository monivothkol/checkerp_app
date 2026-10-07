<template>
	<ion-accordion :value="value">
		<ion-item slot="header" class="acs_head">
			<ion-label><h2>{{ title }}</h2></ion-label>
			<span v-if="total !== undefined" slot="end" class="acs_total" :class="toneClass">{{ total }}</span>
		</ion-item>
		<ion-list slot="content" class="scr_list" lines="full">
			<slot />
		</ion-list>
	</ion-accordion>
</template>

<script setup lang="ts">
/** One collapsible statement section (must sit in an ion-accordion-group); total shown right-aligned in the header. */
defineOptions({ name: "ActSection" });

defineProps<{ value: string; title: string; total?: string; toneClass?: string }>();
</script>

<style scoped>
.acs_head { --padding-start: 16px; }
.acs_head ion-label h2 { font-size: 14px; font-weight: 700; }
.acs_total { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.act_ok { color: #389e0d; }
.act_bad { color: #cf1322; }
</style>
