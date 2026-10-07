<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/SAL31000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" :description="'SAL32000.NO_DRAFT'" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item v-if="store.draft.display.saleCode"><ion-label><p>{{ tr("SALE_CODE") }}</p><h3>{{ store.draft.display.saleCode }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("SOURCE") }}</p><h3>{{ tr("SOURCE_" + (store.draft.payload.sourceType || "SALE")) }}</h3></ion-label></ion-item>
					<ion-item v-if="store.draft.display.packerName"><ion-label><p>{{ tr("PACKER") }}</p><h3>{{ store.draft.display.packerName }}</h3></ion-label></ion-item>
					<ion-item v-if="store.draft.display.referenceNumber"><ion-label><p>{{ tr("REFERENCE") }}</p><h3>{{ store.draft.display.referenceNumber }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("ITEMS") }}</p><h3>{{ store.draft.display.itemCount }}</h3></ion-label></ion-item>
					<ion-item v-if="store.draft.display.notes"><ion-label><p>{{ tr("NOTES") }}</p><h3>{{ store.draft.display.notes }}</h3></ion-label></ion-item>
				</ion-list>
				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(l, i) in store.draft.display.lines" :key="i">
						<ion-label><h3>{{ l.name }}</h3><p>{{ l.code }} · {{ tr("UNIT") }}: {{ l.unitName || "—" }}</p></ion-label>
						<ion-note slot="end">{{ tr("REQUIRED") }} {{ l.quantityRequired }}</ion-note>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar class="sal_btns">
				<ion-button fill="outline" :disabled="store.submitting" @click="router.back()">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { SAL32000Store } from "@/store/POS/SAL/SAL32000Store";

/** Packing create step 2: review and submit (idempotent). */
defineOptions({ name: "SAL32000" });

const { t } = useI18n();
const tr = (k: string) => t(`SAL32000.${k}`);
const route = useRoute();
const router = useRouter();
const store = SAL32000Store();

useViewEnter(() => { if (!store.loadDraft()) router.replace("/SAL31000"); });
watch(() => store.redirectTo, (to) => { if (to && route.path === "/SAL32000") router.replace(to); });
</script>

<style scoped>
.sal_btns { --padding-start: 16px; --padding-end: 16px; }
.sal_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; white-space: normal; }
ion-label p { font-size: 12px; }
</style>
