<template>
	<ion-page>
		<bm-header :title="$t('STK11000.PAGE_TITLE')" default-href="/STK10000" />
		<ion-content class="ion-padding">
			<p class="stk_desc">{{ $t("STK11000.DESCRIPTION") }}</p>
			<bm-empty-state description="STK11000.WEB_ONLY" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
/** Stock Excel import is web-only (the app does not bundle exceljs); this screen just says so. */
defineOptions({ name: "STK11000" });
</script>

<style scoped>
.stk_desc { font-size: 14px; }
</style>
