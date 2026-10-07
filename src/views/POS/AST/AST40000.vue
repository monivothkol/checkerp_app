<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input :value="store.periodMonth" type="month" :label="$t('AST30000.COL_PERIOD')" label-placement="stacked" @ion-change="onMonth($event.detail.value)" />
				</ion-item>
			</ion-list>
			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("DUE_ASSETS") }}</div><div class="act_card_value">{{ store.rows.length }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ tr("TOTAL_AMOUNT") }}</div>
					<div class="act_card_value">{{ money(store.totalAmount) }}</div>
					<div class="act_card_hint">{{ tr("POSTS_TO") }}</div>
				</div>
				<div v-if="store.lastResult" class="act_card">
					<div class="act_card_label">{{ tr("LAST_RUN") }}</div>
					<div class="act_card_value">{{ store.lastResult.posted }} · {{ money(store.lastResult.totalAmount) }}</div>
					<div class="act_card_hint">{{ store.lastResult.periodMonth }}</div>
				</div>
			</div>

			<ion-list v-if="store.rows.length" class="scr_list" lines="full">
				<ion-item v-for="r in store.rows" :key="r.assetId">
					<ion-label>
						<p>{{ r.assetCode }} · {{ $t(`AST20000.${r.depreciationMethod}`) }}</p>
						<h3>{{ r.assetName }}</h3>
						<p>{{ tr("COL_COST") }} {{ money(r.cost) }} · {{ tr("COL_ACCUMULATED") }} {{ money(r.accumulatedDepreciation) }}</p>
						<p>{{ tr("COL_NBV_AFTER") }} {{ money(r.bookValueAfter) }}</p>
					</ion-label>
					<span slot="end" class="act_amt act_bold">{{ money(r.amount) }}</span>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!store.loading" description="AST40000.NOTHING_DUE" />
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="act_btns"><ion-button :disabled="!store.rows.length || store.posting" @click="onPost">{{ tr("POST") }}</ion-button></div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { AST40000Store } from "@/store/POS/AST/AST40000Store";

/** Monthly depreciation run: pick a month, preview what is due, post it (after a confirm). */
defineOptions({ name: "AST40000" });

const { t } = useI18n();
const tr = (k: string, args: Record<string, unknown> = {}) => t(`AST40000.${k}`, args);
const store = AST40000Store();
const money = (v: unknown) => "$ " + UT.currency(Number(v ?? 0), "USD");

useViewEnter(() => store.preview());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.preview();
	await ev.target.complete();
}
/** The month can't be cleared (web allow-clear=false). */
function onMonth(v?: string | null): void {
	if (!v) return;
	store.periodMonth = v;
	store.preview();
}
function onPost(): void {
	POP.confirm({
		title: tr("POST"),
		content: tr("CONFIRM_MSG", { count: store.rows.length, period: store.periodMonth, amount: money(store.totalAmount) }),
		okBtn: {
			onClick: () => store.post((ok, res, error) => {
				if (ok) {
					POP.alert({ status: "success", title: tr("POSTED"), content: tr("POSTED_MSG", { count: res?.posted ?? 0 }) });
				} else {
					const e = error as { message?: string; code?: string } | undefined;
					POP.alert({ status: "error", title: tr("POST_FAILED"), content: e?.message, errorCode: e?.code });
				}
			})
		}
	});
}
</script>

<style scoped src="../../ACT/act-report.css"></style>
