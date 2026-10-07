<template>
	<div>
		<ion-list class="scr_list" v-if="rows.length">
			<ion-item v-for="r in rows" :key="r.returnId" button @click="view(r.returnId)">
				<ion-label>
					<p class="crt_code">{{ r.returnCode }} · {{ String(r.returnedAt ?? "").slice(0, 10) }}</p>
					<h3>$ {{ UT.currency(r.totalRefund ?? 0, "USD") }}</h3>
					<p>{{ tr("COL_SALE") }}: {{ r.saleCode ?? "—" }}</p>
				</ion-label>
				<ion-badge slot="end" :color="r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'">{{ r.status }}</ion-badge>
			</ion-item>
		</ion-list>
		<bm-empty-state v-else-if="!loading" />
		<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
			<ion-infinite-scroll-content />
		</ion-infinite-scroll>
	</div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import RetrieveSaleReturnList from "@/services/api/SAL/retrieveSaleReturnList";
import type { ReturnRow } from "@/models/POS/SAL/SAL20000";

/** CUS14000 tab: sale returns for one customer. */
defineOptions({ name: "CustomerReturnsTab" });

const props = defineProps<{ detail: Record<string, any> }>();
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS14000.${key}`);
const paged = usePagedList<ReturnRow>((pageNo, pageSize) => requestAsync<{ returnList?: ReturnRow[]; totalCount?: number }>((listener) =>
	RetrieveSaleReturnList.getInstance().request({ dataBody: { customerId: props.detail.customerId, pageNo, pageSize }, listener }))
	.then((r) => ({ list: r.returnList ?? [], totalCount: r.totalCount })));
const { rows, loading, hasMore } = paged;

// The detail can arrive after the tab mounts; (re)load whenever the customer is known or changes.
watch(() => props.detail?.customerId, (id) => { if (id) void paged.reload(); }, { immediate: true });

async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function view(returnId: string): void {
	router.push(`/SAL24000?returnId=${encodeURIComponent(returnId)}`);
}
</script>

<style scoped>
.crt_code { font-size: 12px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
</style>
