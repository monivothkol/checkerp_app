<template>
	<ion-page>
		<bm-header :title="t('ADM20000.PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport">
					<ion-icon slot="icon-only" :icon="downloadOutline" />
				</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="keyword" :placeholder="t('ADM20000.SEARCH_PLACEHOLDER')" :debounce="400" @ion-input="reload" />
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note v-if="totalCount" class="adm_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.roleId">
					<ion-item button :detail="true" @click="router.push(`/ADM24000?roleCode=${r.roleCode}`)">
						<ion-label>
							<p class="adm_code">{{ r.roleCode }}</p>
							<h2>{{ r.roleName ?? "—" }}</h2>
							<p>
								{{ t("ADM20000.TYPE") }}:
								<ion-text :color="r.isSystemRole ? 'medium' : r.isAdmin ? 'tertiary' : 'primary'">{{ typeLabel(r) }}</ion-text>
							</p>
						</ion-label>
						<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? t("ADM20000.ACTIVE") : t("ADM20000.INACTIVE") }}</ion-badge>
					</ion-item>
					<ion-item-options v-if="!r.isAdmin" side="end">
						<ion-item-option @click="router.push(`/ADM25000?roleCode=${r.roleCode}`)">{{ t("ADM20000.EDIT") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/ADM21000')">
					<ion-icon :icon="add" />
				</ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { add, downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { useViewEnter } from "@/core/modules/use-view-enter";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import RetrieveRoleList, { type RetrieveRoleListResponse } from "@/services/api/ADM/retrieveRoleList";
import type { RoleOption } from "@/models/POS/ADM/ADM11000";

/** ADM20000 — roles list: search, view, edit (non-admin roles), create. */
defineOptions({ name: "ADM20000" });

interface RoleRow extends RoleOption { roleCode?: string; isSystemRole?: boolean; isActive?: boolean }

const { t } = useI18n();
const router = useRouter();
const keyword = ref("");

const paged = usePagedList<RoleRow>((pageNo, pageSize) => requestAsync<RetrieveRoleListResponse>((listener) =>
	RetrieveRoleList.getInstance().request({ dataBody: { searchKeyword: keyword.value || undefined, pageNo, pageSize }, listener }))
	.then((p) => ({ list: (p.roleList ?? []) as RoleRow[], totalCount: p.totalCount ?? 0 })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const typeLabel = (r: RoleRow) => t(r.isSystemRole ? "ADM20000.TYPE_SYSTEM" : r.isAdmin ? "ADM20000.TYPE_ADMIN" : "ADM20000.TYPE_CUSTOM");

function onExport(): void {
	const cfg = EXPORT_CONFIGS.ROLE;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(reload);
</script>

<style scoped>
.adm_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.adm_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
