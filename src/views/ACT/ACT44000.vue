<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" :disabled="store.syncing" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-note class="act_hint">{{ tr("HINT") }}</ion-note>
			<div v-if="!store.enabled" class="sy_warn">{{ tr("NOT_ENABLED") }}</div>

			<!-- Step 1: replay what never reached the ledger -->
			<div class="act_section">{{ tr("STEP_SYNC") }}</div>
			<ion-note class="act_hint">{{ store.conversionDate ? tr("SINCE", { date: store.conversionDate }) : tr("SINCE_START") }}</ion-note>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="ty in store.types" :key="ty.type">
					<ion-label :class="{ act_muted: !ty.missing }">{{ tr("TYPE_" + ty.type) }}</ion-label>
					<span slot="end" class="act_amt" :class="ty.missing ? 'act_bold' : 'act_muted'">{{ ty.missing }}</span>
				</ion-item>
				<ion-item class="act_total">
					<ion-label><h2>{{ tr("TOTAL") }}</h2></ion-label>
					<span slot="end" class="act_amt act_bold">{{ store.totalMissing }}</span>
				</ion-item>
			</ion-list>
			<div class="act_btns">
				<ion-button :disabled="!store.enabled || store.inSync || store.syncing" @click="onSync">{{ tr("SYNC_NOW") }}</ion-button>
			</div>
			<div v-if="store.inSync && !store.syncing" class="act_hint act_ok">{{ tr("IN_SYNC") }}</div>
			<template v-if="store.syncing">
				<ion-progress-bar class="sy_progress" :value="store.percent / 100" />
				<ion-note class="act_hint">
					{{ tr("PROGRESS", { done: store.synced, total: store.syncTotal }) }} ({{ store.percent }}%)
					<template v-if="store.currentType"> · {{ tr("WORKING_ON", { type: tr("TYPE_" + store.currentType) }) }}</template>
				</ion-note>
			</template>
			<div v-if="store.unpostable > 0 && !store.syncing" class="sy_warn">
				<b>{{ tr("UNPOSTABLE", { n: store.unpostable }) }}</b>
				<ul v-if="store.reasons.length"><li v-for="r in store.reasons" :key="r.reason">{{ r.reason }} — {{ r.count }}</li></ul>
				<div>{{ tr("UNPOSTABLE_HINT") }}</div>
			</div>

			<!-- Step 2: close what a replay cannot explain -->
			<div class="act_section">{{ tr("STEP_OPENING") }}</div>
			<ion-note class="act_hint">{{ tr("OPENING_HINT") }}</ion-note>
			<ion-list class="scr_list" lines="full">
				<ion-item v-for="r in store.rows" :key="r.key">
					<ion-label>
						<p>{{ r.accountCode }}</p>
						<h3>{{ tr("ACC_" + r.key) }}</h3>
						<p>{{ tr("ACTUAL") }} {{ money(r.actual) }} · {{ tr("LEDGER") }} {{ money(r.ledger) }}</p>
					</ion-label>
					<div slot="end" class="sy_gap"><small>{{ tr("GAP") }}</small><span class="act_amt" :class="Number(r.delta) ? 'act_bold' : 'act_muted'">{{ money(r.delta) }}</span></div>
				</ion-item>
				<ion-item class="act_total">
					<ion-label><p>{{ store.equityAccountCode }}</p><h2>{{ tr("EQUITY") }}</h2></ion-label>
					<span slot="end" class="act_amt act_bold">{{ money(store.equityDelta) }}</span>
				</ion-item>
				<ion-item>
					<ion-input :value="store.countedCash" type="number" inputmode="decimal" min="0" step="0.01" :label="tr('COUNTED_CASH')" label-placement="stacked"
						:placeholder="tr('COUNTED_CASH_PLACEHOLDER')" :debounce="400" @ion-input="onCountedCash($event.detail.value)" />
				</ion-item>
			</ion-list>
			<ion-note class="act_hint">{{ tr("CASH_HINT") }}</ion-note>
			<div class="act_btns">
				<ion-button :disabled="!store.enabled || !store.inSync || !store.hasGap || store.syncing || store.posting" @click="onPostOpening">{{ tr("POST_OPENING") }}</ion-button>
			</div>
			<div v-if="!store.inSync" class="act_hint">{{ tr("SYNC_FIRST") }}</div>
			<div v-else-if="!store.hasGap" class="act_hint act_ok">{{ tr("LEDGER_MATCHES") }}</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { onIonViewDidLeave, onIonViewWillEnter, type RefresherCustomEvent } from "@ionic/vue";
import POP from "@/core/utilities/pop";
import UT from "@/core/utilities/ut";
import { ACT44000Store } from "@/store/ACT/ACT44000Store";

/** Accounting sync: (1) replay un-posted operations as a polled background job, (2) post the opening-balance gap. */
defineOptions({ name: "ACT44000" });

const { t } = useI18n();
// params go through i18n: it consumes {placeholders} itself, so a later .replace() finds nothing
const tr = (k: string, params: Record<string, unknown> = {}) => t(`ACT44000.${k}`, params);
const store = ACT44000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const syncLabels = () => ({
	done: (n: number) => tr("SYNC_DONE", { n }),
	partial: (n: number) => tr("SYNC_PARTIAL", { n }),
	failed: tr("SYNC_FAILED")
});

onIonViewWillEnter(() => {
	store.load();
	store.resume(syncLabels()); // a job already running on the server is followed, not restarted
});
// Leaving stops the polling only; the job keeps running on the server and is resumed on return.
onIonViewDidLeave(() => store.dispose());
onBeforeUnmount(() => store.dispose());

async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
function onCountedCash(v?: string | null): void {
	store.countedCash = v === "" || v == null ? null : Number(v);
	store.loadOpening();
}
// Both steps write journal entries — ask first, never on a single tap.
function onSync(): void {
	POP.confirm({
		title: tr("SYNC_NOW"),
		content: tr("SYNC_CONFIRM", { n: store.totalMissing }),
		okBtn: { btnText: tr("SYNC_NOW"), onClick: () => store.startSync(syncLabels()) }
	});
}
function onPostOpening(): void {
	POP.confirm({
		title: tr("POST_OPENING"),
		content: tr("OPENING_CONFIRM", { amount: money(store.equityDelta) }),
		okBtn: {
			btnText: tr("POST_OPENING"),
			onClick: () => store.postOpening({ done: (no) => tr("OPENING_DONE", { no }), failed: tr("OPENING_FAILED") })
		}
	});
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.sy_warn { margin: 8px 16px; padding: 8px 12px; border-radius: 8px; background: #fffbe6; border: 1px solid #ffe58f; font-size: 12px;
	ul { margin: 4px 0; padding-left: 16px; }
}
.sy_progress { margin: 8px 16px 0; width: auto; }
.sy_gap { display: flex; flex-direction: column; align-items: flex-end;
	small { font-size: 10px; color: #6b6b76; }
}
</style>
