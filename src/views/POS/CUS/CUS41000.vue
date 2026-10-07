<template>
	<ion-page>
		<bm-header :title="t('CUS41000.PAGE_TITLE')" default-href="/CUS40000" />
		<ion-content class="ion-padding">
			<p class="c41_desc">{{ t("CUS41000.DESCRIPTION") }}</p>
			<bm-empty-state description="CUS41000.WEB_ONLY" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

/** Group-price import: Excel upload stays web-only (rulebook), so the phone explains where to do it. */
defineOptions({ name: "CUS41000" });

const { t } = useI18n();
</script>

<style scoped>
.c41_desc { font-size: 14px; }
</style>
