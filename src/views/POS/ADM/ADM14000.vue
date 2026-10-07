<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ADM10000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else-if="d" class="scr_list" lines="full">
				<ion-item><ion-label><p>{{ t("ADM10000.COL_USERNAME") }}</p><h2 class="adm_code">{{ d.username }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("NAME") }}</p><h2>{{ (d.firstName ?? "") + " " + (d.lastName ?? "") }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("EMAIL") }}</p><h2>{{ d.email }}</h2></ion-label></ion-item>
				<ion-item v-if="d.phone"><ion-label><p>{{ tr("PHONE") }}</p><h2>{{ d.phone }}</h2></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("ROLE") }}</p></ion-label>
					<ion-badge slot="end" :color="d.roleIsAdmin ? 'tertiary' : 'primary'">{{ d.roleName ?? "—" }}</ion-badge>
				</ion-item>
				<ion-item v-if="d.staffName"><ion-label><p>{{ tr("STAFF") }}</p><h2>{{ d.staffName }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("PROVIDER") }}</p><h2>{{ d.authProvider ?? "LOCAL" }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("LAST_LOGIN") }}</p><h2>{{ ts(d.lastLoginAt) }}</h2></ion-label></ion-item>
				<ion-item><ion-label><p>{{ tr("PASSWORD_CHANGED") }}</p><h2>{{ ts(d.passwordChangedAt) }}</h2></ion-label></ion-item>
				<ion-item>
					<ion-label><p>{{ tr("STATUS") }}</p></ion-label>
					<ion-badge slot="end" :color="d.isActive ? 'success' : 'medium'">{{ d.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else :description="'ADM14000.NOT_FOUND'" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM14000Store } from "@/store/POS/ADM/ADM14000Store";

/** ADM14000 — user detail (read-only). */
defineOptions({ name: "ADM14000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM14000.${k}`);
const route = useRoute();
const store = ADM14000Store();
const d = computed(() => store.detail);

const ts = (v: unknown) => String(v ?? "").slice(0, 16).replace("T", " ") || "—";

useViewEnter(() => store.load(String(route.query.targetUserId ?? "")));
</script>

<style scoped>
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
.adm_code { font-family: monospace; }
</style>
