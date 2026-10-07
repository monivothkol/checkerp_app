<template>
	<ion-list v-if="auditList.length" class="scr_list" lines="full">
		<ion-list-header>{{ title }}</ion-list-header>
		<ion-item v-for="(e, i) in auditList" :key="i">
			<ion-label>
				<p class="ah_meta"><strong>{{ e.userName }}<template v-if="e.username"> ({{ e.username }})</template></strong><span>{{ fmtDateTime(e.changedAt) }}</span></p>
				<p v-for="(c, j) in changesOf(e)" :key="j" class="ah_change">
					<span class="ah_field">{{ c.label }}</span>
					<span class="ah_old">{{ c.oldValue || "—" }}</span> → <span class="ah_new">{{ c.newValue || "—" }}</span>
				</p>
			</ion-label>
		</ion-item>
	</ion-list>
</template>

<script setup lang="ts">
import type { InvoiceAuditEntry } from "@/models/POS/invoice";

/** Edit change-history (SAL24000 return, SAL74000 delivery); backend keys are already human-readable. */
defineOptions({ name: "AuditHistoryList" });

defineProps<{ auditList: InvoiceAuditEntry[]; title: string }>();

const fmtDateTime = (d?: string) => (d ? String(d).replace("T", " ").replace("Z", "").slice(0, 16) : "");
function changesOf(entry: InvoiceAuditEntry): { label: string; oldValue: string; newValue: string }[] {
	const parse = (s?: string): Record<string, unknown> => {
		try { return s ? JSON.parse(s) : {}; } catch { return {}; }
	};
	const oldV = parse(entry.oldValues);
	const newV = parse(entry.newValues);
	return Object.keys(newV).map((k) => ({ label: k, oldValue: String(oldV[k] ?? ""), newValue: String(newV[k] ?? "") }));
}
</script>

<style scoped>
.ah_meta { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; }
.ah_change { font-size: 12px; white-space: normal; }
.ah_field { color: var(--ion-color-medium); margin-right: 4px; }
.ah_old { color: var(--ion-color-danger); text-decoration: line-through; }
.ah_new { color: var(--ion-color-success); font-weight: 600; }
</style>
