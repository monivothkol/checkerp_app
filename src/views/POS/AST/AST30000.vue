<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/AST10000">
			<template v-if="d?.status === 'ACTIVE'" #end>
				<ion-button @click="onEdit">{{ tr("EDIT") }}</ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<template v-if="d">
				<div class="act_cards">
					<div class="act_card"><div class="act_card_label">{{ tr("COST") }}</div><div class="act_card_value">{{ money(d.cost) }}</div></div>
					<div class="act_card"><div class="act_card_label">{{ tr("ACCUMULATED") }}</div><div class="act_card_value">{{ money(d.accumulatedDepreciation) }}</div></div>
					<div class="act_card"><div class="act_card_label">{{ tr("NBV") }}</div><div class="act_card_value">{{ money(d.netBookValue) }}</div></div>
					<div class="act_card">
						<div class="act_card_label">{{ tr("SCHEDULE") }}</div>
						<div class="act_card_hint">{{ $t(`AST20000.${d.depreciationMethod}`) }}</div>
						<div v-if="d.depreciationMethod !== 'NONE'" class="act_card_hint">{{ d.usefulLifeMonths }} {{ tr("MONTHS") }} · {{ tr("SALVAGE") }} {{ money(d.salvageValue) }} · {{ tr("FROM") }} {{ d.depreciationStart }}</div>
					</div>
				</div>

				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("CODE") }}</p><h3>{{ d.assetCode }}</h3></ion-label>
						<ion-badge slot="end" :color="d.status === 'ACTIVE' ? 'success' : 'medium'">{{ $t(`AST10000.${d.status}`) }}</ion-badge>
					</ion-item>
					<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("NAME") }}</p><h3>{{ d.assetName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3>{{ $t(`AST10000.${d.assetType}`) }} · {{ $t(`AST10000.${d.assetClass}`) }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("ACCOUNT") }}</p><h3>{{ d.accountCode }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("PURCHASED") }}</p><h3>{{ d.purchaseDate }} · {{ $t(`AST20000.${d.paidFrom}`) }}</h3></ion-label></ion-item>
					<ion-item v-if="d.status === 'DISPOSED'">
						<ion-label class="ion-text-wrap">
							<p>{{ tr("DISPOSED") }}</p>
							<h3>{{ d.disposedAt }} · {{ money(d.disposalAmount) }} ({{ tr(Number(d.disposalGainLoss) >= 0 ? "GAIN" : "LOSS") }} {{ money(Math.abs(Number(d.disposalGainLoss ?? 0))) }})</h3>
						</ion-label>
					</ion-item>
					<ion-item><ion-label><p>{{ tr("SERIAL") }}</p><h3>{{ d.serialNo || "-" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("LOCATION") }}</p><h3>{{ d.location || "-" }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("SUPPLIER") }}</p><h3>{{ d.supplierName || "-" }}</h3></ion-label></ion-item>
					<ion-item><ion-label class="ion-text-wrap"><p>{{ tr("REMARK") }}</p><h3>{{ d.remark || "-" }}</h3></ion-label></ion-item>
				</ion-list>

				<div class="act_section">{{ tr("HISTORY") }}</div>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="r in d.depreciationList" :key="r.depreciationId">
						<ion-label>
							<h3>{{ r.periodMonth }}</h3>
							<p>{{ tr("COL_NBV_AFTER") }} {{ money(r.bookValueAfter) }}</p>
							<p v-if="r.postedAt">{{ tr("COL_POSTED") }} {{ r.postedAt }}</p>
						</ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(r.amount) }}</span>
					</ion-item>
				</ion-list>
				<bm-empty-state v-if="!d.depreciationList?.length" />
			</template>
			<bm-empty-state v-else-if="!store.loading" description="AST30000.NOT_FOUND" />
		</ion-content>
		<ion-footer v-if="d?.status === 'ACTIVE'">
			<ion-toolbar>
				<div class="act_btns"><ion-button color="danger" fill="outline" @click="onDispose">{{ tr("DISPOSE") }}</ion-button></div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { AST30000Store } from "@/store/POS/AST/AST30000Store";
import AssetDisposeModal from "@/views/POS/AST/AssetDisposeModal.vue";

/** Asset detail + depreciation history; an ACTIVE asset can be edited or disposed. */
defineOptions({ name: "AST30000" });

const { t } = useI18n();
const tr = (k: string) => t(`AST30000.${k}`);
const route = useRoute();
const router = useRouter();
const store = AST30000Store();
const d = computed(() => store.detail);
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

useViewEnter(() => store.load(String(route.query.assetId ?? "")));

function onEdit(): void {
	router.push(`/AST20000?assetId=${encodeURIComponent(store.assetId)}`);
}
function onDispose(): void {
	POP.showPopup(AssetDisposeModal, { title: tr("DISPOSE") }).promise.then(() => store.load(store.assetId)).catch(() => undefined);
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
