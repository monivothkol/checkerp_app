<template>
	<ion-page>
		<bm-header :title="tr('TITLE')" :back-button="false" />
		<bm-content>
			<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH')" />
			<bm-empty-state v-if="!groups.length" :description="'MNU10000.EMPTY'" />
			<ion-list v-for="g in groups" :key="g.menuId" class="scr_list mnu_group">
				<ion-list-header>{{ g.menuName }}</ion-list-header>
				<ion-item v-for="m in g.items" :key="m.menuId" button :detail="true" @click="open(m)">
					<ion-label>
						{{ m.menuName }}
						<p>{{ m.screenId }}</p>
					</ion-label>
				</ion-item>
			</ion-list>
			<ion-list class="scr_list mnu_group">
				<ion-item button lines="none" @click="onLogout">
					<ion-label color="danger">{{ tr("LOGOUT") }}</ion-label>
				</ion-item>
			</ion-list>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onIonViewWillEnter, useIonRouter } from "@ionic/vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { AUT10000Store } from "@/store/COMMON/AUT10000Store";
import type { MenuInfo } from "@/models/COMMON/UAC02000I01";

/** MNU10000 — every screen the user's menu (UAC02000I01) grants, grouped as on the web sidebar. */
defineOptions({ name: "MNU10000" });

interface MenuGroup { menuId: string; menuName: string; items: MenuInfo[] }

const { t } = useI18n();
const tr = (key: string) => t(`MNU10000.${key}`);
const auth = AUT10000Store();
const router = useRouter();
const ionRouter = useIonRouter();
const keyword = ref("");

onIonViewWillEnter(() => void auth.restoreMenu());

const byOrder = (a: MenuInfo, b: MenuInfo) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0);

/** Level-0 entries are groups; a level-0 entry with its own screen is a group of one. */
const groups = computed<MenuGroup[]>(() => {
	const q = keyword.value.trim().toLowerCase();
	const hit = (m: MenuInfo) => !q || m.menuName?.toLowerCase().includes(q) || m.screenId?.toLowerCase().includes(q);
	return auth.menuList
		.filter((m) => String(m.menuLevel) === "0")
		.sort(byOrder)
		.map((g) => {
			const children = auth.menuList.filter((m) => m.upperMenuId === g.menuId && m.screenId).sort(byOrder);
			const all = g.screenId ? [g, ...children] : children;
			const items = hit(g) ? all : all.filter(hit);
			return { menuId: g.menuId, menuName: g.menuName, items };
		})
		.filter((g) => g.items.length);
});

function open(m: MenuInfo): void {
	if (router.hasRoute(m.screenId)) {
		ionRouter.push(`/${m.screenId}`);
	} else {
		POP.openNotification({ type: "info", content: tr("NOT_AVAILABLE") });
	}
}

function onLogout(): void {
	POP.confirm({
		content: tr("LOGOUT_CONFIRM"),
		okBtn: {
			onClick: async () => {
				await auth.logout();
				ionRouter.navigate("/AUT10000", "root", "replace");
			}
		}
	});
}
</script>

<style lang="scss" scoped>
.mnu_group { margin-bottom: 8px; }
ion-list-header { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 10px; }
</style>
