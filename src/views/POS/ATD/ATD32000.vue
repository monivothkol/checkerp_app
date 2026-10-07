<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ATD31000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="ATD32000.NO_DRAFT" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("NAME") }}</p><h3>{{ store.draft.display.name }}</h3></ion-label></ion-item>
				<ion-item v-if="store.draft.display.nameKhmer"><ion-label><p>{{ tr("NAME_KHMER") }}</p><h3>{{ store.draft.display.nameKhmer }}</h3></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("TIME") }}</p><h3>{{ store.draft.display.time }}</h3></ion-label></ion-item>
				<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("BREAK") }}</p><h3>{{ store.draft.display.breakText }}</h3></ion-label></ion-item>
				<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("DAYS") }}</p><h3>{{ store.draft.display.days }}</h3></ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="atd_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/ATD31000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="store.submitting || !store.draft" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ATD32000Store } from "@/store/POS/ATD/ATD32000Store";

/** New work schedule, step 2: review the draft and save it (idempotent). */
defineOptions({ name: "ATD32000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`ATD32000.${k}`);
const store = ATD32000Store();

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/ATD31000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; }
.atd_btns { display: flex; gap: 8px; padding: 0 8px; }
.atd_btns ion-button { flex: 1; }
</style>
