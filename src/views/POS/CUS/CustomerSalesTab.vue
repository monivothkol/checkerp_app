<template>
	<div>
		<ion-list class="scr_list" v-if="rows.length">
			<ion-item v-for="r in rows" :key="r.saleId" button @click="view(r.saleCode)">
				<ion-label>
					<p class="cst_code">{{ r.saleCode }} · {{ String(r.saleDate ?? "").slice(0, 10) }}</p>
					<h3>$ {{ UT.currency(r.totalAmount ?? 0, "USD") }}</h3>
					<p>{{ tr("COL_PAID") }}: $ {{ UT.currency(r.paidAmount ?? 0, "USD") }}</p>
				</ion-label>
				<ion-badge slot="end" :color="payColor(r.paymentStatus)">{{ r.paymentStatus }}</ion-badge>
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
import RetrieveSaleList from "@/services/api/SIV/retrieveSaleList";
import type { SaleRow } from "@/models/POS/SIV/SIV10000";

/** CUS14000 tab: sales for one customer; `unpaidOnly` restricts to UNPAID/PARTIAL invoices. */
defineOptions({ name: "CustomerSalesTab" });

const props = withDefaults(defineProps<{ detail: Record<string, any>; unpaidOnly?: boolean }>(), { unpaidOnly: false });
const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`CUS14000.${key}`);
const paged = usePagedList<SaleRow>((pageNo, pageSize) => requestAsync<{ saleList?: SaleRow[]; totalCount?: number }>((listener) =>
	RetrieveSaleList.getInstance().request({ dataBody: { customerId: props.detail.customerId, unpaidOnly: props.unpaidOnly, pageNo, pageSize }, listener }))
	.then((r) => ({ list: r.saleList ?? [], totalCount: r.totalCount })));
const { rows, loading, hasMore } = paged;

// The detail can arrive after the tab mounts; (re)load whenever the customer is known or changes.
watch(() => props.detail?.customerId, (id) => { if (id) void paged.reload(); }, { immediate: true });

async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
function view(saleCode: string): void {
	router.push(`/SIV13000?saleCode=${encodeURIComponent(saleCode)}`);
}
function payColor(s?: string): string {
	const k = String(s ?? "").toUpperCase();
	if (k === "PAID") return "success";
	return k === "PARTIAL" ? "warning" : "danger";
}
</script>

<style scoped>
.cst_code { font-size: 12px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
</style>
