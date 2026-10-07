<template>
	<ion-page>
		<bm-header :title="t('ADM22000.PAGE_TITLE')" default-href="/ADM21000" />
		<ion-content>
			<template v-if="store.draft">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ t("ADM22000.ROLE_NAME") }}</p><h2>{{ store.draft.form.roleName }}</h2></ion-label></ion-item>
					<ion-item><ion-label class="ion-text-wrap"><p>{{ t("ADM22000.DESCRIPTION_LABEL") }}</p><h2>{{ store.draft.form.description || "—" }}</h2></ion-label></ion-item>
				</ion-list>
				<ion-list-header>{{ t("ADM22000.PERMISSIONS") }} · {{ store.draft.labels.length }}</ion-list-header>
				<div class="adm_chips">
					<ion-chip v-for="l in store.draft.labels" :key="l.code" color="primary"><ion-label>{{ l.name }}</ion-label></ion-chip>
				</div>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" :disabled="store.saving" @click="router.push('/ADM21000')">{{ t("ADM22000.BACK") }}</ion-button>
					<ion-button :disabled="!store.draft || store.saving" @click="store.submit('Could not create role')">{{ t("ADM22000.CONFIRM") }}</ion-button>
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
import { ADM22000Store } from "@/store/POS/ADM/ADM22000Store";

/** ADM22000 — confirm new role (step 2). */
defineOptions({ name: "ADM22000" });

const { t } = useI18n();
const router = useRouter();
const store = ADM22000Store();

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/ADM21000"); });
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 16px 16px; }
ion-chip { font-size: 12px; margin: 0; }
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-list-header { font-size: 14px; font-weight: 600; }
</style>
