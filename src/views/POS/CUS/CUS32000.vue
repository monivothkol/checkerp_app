<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/CUS31000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="CUS32000.NO_DRAFT" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item v-for="row in rows" :key="row.label">
					<ion-label>
						<p>{{ row.label }}</p>
						<h3 class="c32_value">{{ row.value }}</h3>
					</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="c32_btns">
				<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/CUS31000')">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { CUS32000Store } from "@/store/POS/CUS/CUS32000Store";

/** Loyalty condition create (step 2): review the draft and submit it (idempotent). */
defineOptions({ name: "CUS32000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS32000.${key}`);
const store = CUS32000Store();

const rows = computed(() => {
	const d = store.draft?.display;
	if (!d) return [];
	return [
		{ label: tr("NAME"), value: d.name },
		{ label: tr("TYPE"), value: d.type },
		{ label: tr("CONDITION"), value: d.condition },
		{ label: tr("POINTS"), value: String(d.points) }
	];
});

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => {
	if (!store.loadDraft()) router.replace("/CUS31000");
});
</script>

<style scoped>
.c32_value { font-size: 14px; white-space: normal; }
.c32_btns { --padding-start: 16px; --padding-end: 16px; }
.c32_btns ion-button { width: calc(50% - 4px); }
</style>
