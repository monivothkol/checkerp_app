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
					<ion-segment v-model="status" @ion-change="reload">
						<ion-segment-button value="PENDING">{{ tr("ST_PENDING") }}</ion-segment-button>
						<ion-segment-button value="RESOLVED">{{ tr("ST_RESOLVED") }}</ion-segment-button>
						<ion-segment-button value="IGNORED">{{ tr("ST_IGNORED") }}</ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>
			<ion-note class="adm_note">{{ tr("V1_NOTE") }}</ion-note>
			<ion-note class="adm_pending" color="primary">{{ pendingCount }} {{ tr("PENDING") }}</ion-note>

			<ion-list v-if="rows.length" class="scr_list">
				<ion-item v-for="r in rows" :key="r.eventId">
					<ion-label class="ion-text-wrap">
						<p class="adm_code">{{ r.eventType }}</p>
						<p class="adm_err">{{ r.errorMessage || "—" }}</p>
						<p>{{ tr("COL_RETRIES") }}: {{ r.retryCount ?? 0 }} · {{ tr("COL_CREATED") }}: {{ String(r.createdAt ?? "").slice(0, 16).replace("T", " ") }}</p>
					</ion-label>
					<ion-badge slot="end" :color="statusColor(r.status)">{{ r.status }}</ion-badge>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" />

			<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import { useViewEnter } from "@/core/modules/use-view-enter";
import ExportModal from "@/core/components/module/ExportModal.vue";
import { EXPORT_CONFIGS } from "@/core/modules/export-config";
import RetrieveFailedEventList from "@/services/api/ADM/retrieveFailedEventList";
import type { ADM80000Response, FailedEventRow } from "@/models/POS/ADM/ADM80000";

/** ADM80000 — failed (outbox) events by status, read-only. */
defineOptions({ name: "ADM80000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM80000.${k}`);
const status = ref("PENDING");
const pendingCount = ref(0);

const paged = usePagedList<FailedEventRow>((pageNo, pageSize) => requestAsync<ADM80000Response>((listener) =>
	RetrieveFailedEventList.getInstance().request({ dataBody: { status: status.value, pageNo, pageSize }, listener }))
	.then((p) => {
		pendingCount.value = p.pendingCount ?? 0;
		return { list: p.eventList ?? [], totalCount: p.totalCount ?? 0 };
	}));
const { rows, loading, hasMore } = paged;
const reload = () => void paged.reload();

async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await paged.reload(); await ev.target.complete(); }
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> { await paged.more(); await ev.target.complete(); }

const statusColor = (s: string) => (s === "RESOLVED" ? "success" : s === "PENDING" ? "primary" : "medium");

function onExport(): void {
	const cfg = EXPORT_CONFIGS.FEV;
	POP.showPopup(ExportModal, { title: t(`${cfg.trKey}.PAGE_TITLE`), props: { config: cfg } }).promise.catch(() => undefined);
}

useViewEnter(reload);
</script>

<style scoped>
.adm_note { display: block; padding: 8px 16px 0; font-size: 12px; }
.adm_pending { display: block; padding: 4px 16px 0; font-size: 14px; font-weight: 700; }
.adm_code { font-size: 12px; font-family: monospace; color: var(--ion-color-dark); }
.adm_err { font-size: 12px; }
ion-label p { font-size: 12px; }
</style>
