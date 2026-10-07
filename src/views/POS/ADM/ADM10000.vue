<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button @click="onExport">
					<ion-icon slot="icon-only" :icon="downloadOutline" />
				</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" :debounce="300" @ion-input="reload" />
				</ion-toolbar>
				<ion-toolbar>
					<ion-segment v-model="isActive" @ion-change="reload">
						<ion-segment-button value="">{{ tr("ALL_STATUS") }}</ion-segment-button>
						<ion-segment-button value="true">{{ tr("ACTIVE") }}</ion-segment-button>
						<ion-segment-button value="false">{{ tr("INACTIVE") }}</ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note v-if="totalCount" class="adm_total">{{ $t("LIST.TOTAL_ITEMS", { total: totalCount }) }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item-sliding v-for="r in rows" :key="r.userId">
					<ion-item button :detail="true" @click="openDetail(r.userId)">
						<ion-label>
							<p class="adm_code">{{ r.username }}</p>
							<h2>{{ r.fullName ?? "—" }}</h2>
							<p>{{ tr("COL_ROLE") }}: <ion-text :color="r.roleIsAdmin ? 'tertiary' : 'primary'">{{ r.roleName ?? "—" }}</ion-text></p>
							<p v-if="r.staffName">{{ tr("COL_STAFF") }}: {{ r.staffName }}</p>
							<p>{{ tr("COL_LAST_LOGIN") }}: {{ ts(r.lastLoginAt) }}</p>
						</ion-label>
						<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ r.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
					</ion-item>
					<ion-item-options side="end">
						<ion-item-option @click="openEdit(r.userId)">{{ tr("EDIT") }}</ion-item-option>
						<ion-item-option color="tertiary" @click="openReset(r)">{{ tr("RESET_PW") }}</ion-item-option>
						<ion-item-option v-if="r.isActive" color="danger" @click="confirmDeactivate(r)">{{ tr("DEACTIVATE") }}</ion-item-option>
					</ion-item-options>
				</ion-item-sliding>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="router.push('/ADM11000')">
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
import RetrieveUserList from "@/services/api/ADM/retrieveUserList";
import DeactivateUser from "@/services/api/ADM/deactivateUser";
import type { ADM10000Response, UserRow } from "@/models/POS/ADM/ADM10000";
import ADM16000 from "@/views/POS/ADM/ADM16000.vue";
import ADM18000 from "@/views/POS/ADM/ADM18000.vue";

/** ADM10000 — user list: search, status filter, view / edit / reset password / deactivate. */
defineOptions({ name: "ADM10000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM10000.${k}`);
const router = useRouter();
const keyword = ref("");
const isActive = ref("");

const paged = usePagedList<UserRow>((pageNo, pageSize) => requestAsync<ADM10000Response>((listener) =>
	RetrieveUserList.getInstance().request({
		dataBody: { searchKeyword: keyword.value || undefined, isActive: isActive.value || undefined, pageNo, pageSize },
		listener
	})).then((p) => ({ list: p.userList ?? [], totalCount: p.totalCount ?? 0 })));
const { rows, totalCount, loading, hasMore } = paged;
const reload = () => void paged.reload();

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const ts = (v?: string) => String(v ?? "").slice(0, 16).replace("T", " ") || "—";

function onExport(): void {
	const cfg = EXPORT_CONFIGS.USR;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}
function openDetail(userId: string): void {
	router.push(`/ADM14000?targetUserId=${encodeURIComponent(userId)}`);
}
function openEdit(userId: string): void {
	POP.showPopup(ADM16000, { title: tr("EDIT_TITLE"), props: { userId } }).promise.then(reload).catch(() => undefined);
}
function openReset(r: UserRow): void {
	POP.showPopup(ADM18000, { title: tr("RESET_TITLE"), props: { userId: r.userId, username: r.username ?? "" } }).promise
		.then(() => POP.alert({ status: "success", title: tr("RESET_DONE"), content: tr("RESET_DONE_MSG") }))
		.catch(() => undefined);
}
function confirmDeactivate(r: UserRow): void {
	POP.confirm({
		title: tr("DEACTIVATE_TITLE"),
		content: t("ADM10000.DEACTIVATE_MSG", { name: r.username ?? "" }),
		okBtn: {
			btnText: tr("DEACTIVATE"),
			onClick: () => DeactivateUser.getInstance().request({
				dataBody: { targetUserId: r.userId },
				listener: {
					onSuccess: reload,
					onFail: (e) => POP.apiError(e, tr("DEACTIVATE_FAILED"))
				}
			})
		}
	});
}

useViewEnter(reload);
</script>

<style scoped>
.adm_total { display: block; padding: 8px 16px 0; font-size: 12px; }
.adm_code { font-size: 10px; letter-spacing: .3px; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
