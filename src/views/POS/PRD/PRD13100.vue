<template>
	<div>
		<ion-list v-if="rows.length" class="scr_list" lines="full">
			<ion-item v-for="r in rows" :key="r.productId">
				<ion-label>
					<p class="cf_code">{{ r.productCode }}</p>
					<h3>{{ r.productName }}</h3>
					<p>{{ tr("COL_VALUE") }}: {{ r.value }}</p>
				</ion-label>
				<ion-badge slot="end" :color="r.isActive ? 'success' : 'medium'">{{ tr(r.isActive ? "ACTIVE" : "INACTIVE") }}</ion-badge>
			</ion-item>
		</ion-list>
		<bm-empty-state v-else-if="!loading" />
		<ion-infinite-scroll :disabled="!hasMore" @ion-infinite="onMore($event)">
			<ion-infinite-scroll-content />
		</ion-infinite-scroll>

		<div class="cf_btns">
			<ion-button expand="block" fill="outline" @click="emit('cancel')">{{ tr("CLOSE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import type { InfiniteScrollCustomEvent } from "@ionic/vue";
import ModuleApi from "@/services/api/COMMON/module-api";
import { requestAsync, usePagedList } from "@/core/modules/use-paged-list";
import type { CustomFieldUsageRow, PRD13100Response } from "@/models/POS/PRD/PRD13000";

/** PRD13100 — products that use one custom field (POP.showPopup body from PRD13000). */
defineOptions({ name: "PRD13100" });

const props = defineProps<{ fieldId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`PRD13100.${key}`);

// Same call as PRD13100Store.load, paged for infinite scroll.
const paged = usePagedList<CustomFieldUsageRow>((pageNo, pageSize) => requestAsync<PRD13100Response>((l) =>
	ModuleApi.request<PRD13100Response>("PRD13100I01", { fieldId: props.fieldId, pageNo, pageSize }, l))
	.then((p) => ({ list: p.productList ?? [], totalCount: p.totalCount })), 10);
const { rows, loading, hasMore } = paged;

onMounted(() => void paged.reload());
async function onMore(ev: InfiniteScrollCustomEvent): Promise<void> {
	await paged.more();
	await ev.target.complete();
}
</script>

<style scoped>
.cf_btns { padding: 16px 0; }
.cf_code { font-size: 10px; }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
