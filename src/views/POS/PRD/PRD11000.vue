<template>
	<ion-page>
		<bm-header title="Import Products" default-href="/PRD10000" />
		<ion-content>
			<bm-empty-state description="PRD11000.IMPORT_ON_WEB" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
/** PRD11000 — product Excel import; web-only (would pull exceljs into the app), so the app points there. */
defineOptions({ name: "PRD11000" });
</script>
