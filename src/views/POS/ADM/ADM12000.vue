<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ADM11000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" :description="'ADM12000.NO_DRAFT'" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ tr("NAME") }}</p><h2>{{ store.draft.display.name }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("USERNAME") }}</p><h2>{{ store.draft.display.username }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("EMAIL") }}</p><h2>{{ store.draft.display.email }}</h2></ion-label></ion-item>
				<ion-item v-if="store.draft.display.phone"><ion-label><p>{{ tr("PHONE") }}</p><h2>{{ store.draft.display.phone }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("ROLE") }}</p><h2>{{ store.draft.display.roleName }}</h2></ion-label></ion-item>
				<ion-item v-if="store.draft.display.staffName"><ion-label><p>{{ tr("STAFF") }}</p><h2>{{ store.draft.display.staffName }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("PASSWORD") }}</p><h2>••••••••</h2></ion-label></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/ADM11000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="!store.draft || store.submitting" @click="submit">{{ tr("CONFIRM") }}</ion-button>
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
import { ADM12000Store } from "@/store/POS/ADM/ADM12000Store";
import { UserCreateSecret } from "@/core/modules/user-create-secret";

/** ADM12000 — confirm new user (step 2); submits with the in-memory password. */
defineOptions({ name: "ADM12000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM12000.${k}`);
const router = useRouter();
const store = ADM12000Store();

watch(() => store.redirectTo, (to) => {
	if (to) { UserCreateSecret.clear(); router.replace(to); }
});

// A reload drops the in-memory password — restart the form in that case.
useViewEnter(() => {
	if (!store.loadDraft() || !UserCreateSecret.take()) {
		store.clearDraft();
		router.replace("/ADM11000");
	}
});

function submit(): void {
	store.submit(UserCreateSecret.take(), tr("FAILED"));
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
</style>
