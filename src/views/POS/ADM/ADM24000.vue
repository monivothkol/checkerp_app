<template>
	<ion-page>
		<bm-header :title="t('ADM24000.PAGE_TITLE')" default-href="/ADM20000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-else-if="role">
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ t("ADM24000.CODE") }}</p><h2 class="adm_code">{{ code }}</h2></ion-label></ion-item>
					<ion-item><ion-label><p>{{ t("ADM24000.NAME") }}</p><h2>{{ role.roleName }}</h2></ion-label></ion-item>
					<ion-item><ion-label class="ion-text-wrap"><p>{{ t("ADM24000.DESCRIPTION") }}</p><h2>{{ role.description || "—" }}</h2></ion-label></ion-item>
					<ion-item>
						<ion-label><p>{{ t("ADM24000.TYPE") }}</p></ion-label>
						<ion-badge slot="end" :color="role.isAdmin ? 'tertiary' : 'primary'">{{ role.isAdmin ? t("ADM24000.TYPE_ADMIN") : t("ADM24000.TYPE_CUSTOM") }}</ion-badge>
					</ion-item>
					<ion-item>
						<ion-label><p>{{ t("ADM24000.STATUS") }}</p></ion-label>
						<ion-badge slot="end" :color="role.isActive ? 'success' : 'medium'">{{ role.isActive ? t("ADM24000.ACTIVE") : t("ADM24000.INACTIVE") }}</ion-badge>
					</ion-item>
				</ion-list>
				<ion-list-header>{{ t("ADM24000.PERMISSIONS") }} · {{ (role.permissionList || []).length }}</ion-list-header>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="grp in store.groupedPermissions" :key="grp.resource">
						<ion-label class="ion-text-wrap">
							<h3>{{ grp.resource }}</h3>
							<div class="adm_chips">
								<ion-chip v-for="p in grp.items" :key="p.permissionCode" color="primary"><ion-label>{{ p.action }}</ion-label></ion-chip>
							</div>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else :description="'ADM24000.NOT_FOUND'" />
		</ion-content>
		<ion-footer v-if="role && !role.isAdmin">
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button expand="block" @click="router.push(`/ADM25000?roleCode=${code}`)">{{ t("ADM24000.EDIT_ROLE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM24000Store } from "@/store/POS/ADM/ADM24000Store";

/** ADM24000 — role detail with permissions grouped by resource. */
defineOptions({ name: "ADM24000" });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = ADM24000Store();
const code = computed(() => String(route.query.roleCode ?? ""));
const role = computed(() => store.role);

useViewEnter(() => {
	if (!code.value) { router.replace("/ADM20000"); return; }
	store.load(code.value);
});
</script>

<style scoped>
.adm_btns { display: flex; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_code { font-family: monospace; }
.adm_chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
ion-chip { font-size: 12px; margin: 0; }
ion-label p { font-size: 12px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-list-header { font-size: 14px; font-weight: 600; }
</style>
