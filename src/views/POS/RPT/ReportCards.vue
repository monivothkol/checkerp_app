<template>
	<div class="rpc_cards">
		<div v-for="c in cards" :key="c.label" class="rpc_card" :class="c.tone ? `rpc_${c.tone}` : ''">
			<p>{{ c.label }}</p>
			<b>{{ c.value }}</b>
			<small v-if="c.hint">{{ c.hint }}</small>
		</div>
	</div>
</template>

<script setup lang="ts">
/** Summary-card grid shared by the RPT/CUS/SUP report screens (the web's rpt_cards row). */
defineOptions({ name: "ReportCards" });

interface ReportCard { label: string; value: string | number; hint?: string; tone?: "bad" | "ok" | "primary" }
defineProps<{ cards: ReportCard[] }>();
</script>

<style scoped>
.rpc_cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 16px; }
.rpc_card { border: 1px solid #e5e5ea; border-radius: 8px; padding: 8px 12px; min-width: 0;
	p { margin: 0; font-size: 12px; color: #6b6b76; }
	b { display: block; font-size: 16px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
	small { font-size: 10px; color: #6b6b76; }
}
.rpc_bad b { color: #B4231F; }
.rpc_ok b { color: #1d7a3d; }
.rpc_primary b { color: var(--ion-color-primary); }
</style>
