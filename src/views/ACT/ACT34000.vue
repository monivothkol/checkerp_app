<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #end>
				<ion-button :disabled="store.exporting" :aria-label="$t('EXPORT.EXPORT')" @click="onExport"><ion-icon slot="icon-only" :icon="downloadOutline" /></ion-button>
			</template>
		</bm-header>
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ActDateRange v-model="store.dateRange" @change="store.load" />
			</ion-list>

			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("OPENING_CASH") }}</div><div class="act_card_value">{{ money(store.openingCash) }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ tr("NET_CHANGE") }}</div>
					<div class="act_card_value" :class="store.netChange >= 0 ? 'act_ok' : 'act_bad'">{{ money(store.netChange) }}</div>
				</div>
				<div class="act_card"><div class="act_card_label">{{ tr("CLOSING_CASH") }}</div><div class="act_card_value">{{ money(store.closingCash) }}</div></div>
			</div>

			<ion-accordion-group :multiple="true" :value="OPEN">
				<ActSection v-for="sec in sections" :key="sec.key" :value="sec.key" :title="tr(sec.label)" :total="money(sec.total)" :tone-class="tone(sec.total)">
					<ion-item v-for="r in sec.rows" :key="r.accountCode">
						<ion-label><p>{{ r.accountCode }}</p><h3>{{ r.accountName }}</h3></ion-label>
						<span slot="end" class="act_amt" :class="tone(r.cashImpact)">{{ money(r.cashImpact) }}</span>
					</ion-item>
					<ion-item v-if="!sec.rows.length"><ion-label class="act_muted">{{ tr("NONE") }}</ion-label></ion-item>
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("SUBTOTAL") }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold" :class="tone(sec.total)">{{ money(sec.total) }}</span>
					</ion-item>
				</ActSection>
			</ion-accordion-group>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT34000Store } from "@/store/ACT/ACT34000Store";
import ActDateRange from "@/views/ACT/ActDateRange.vue";
import ActSection from "@/views/ACT/ActSection.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** Cash flow (direct method) for a period: opening/net/closing cash + operating/investing/financing; PDF/Excel export. */
defineOptions({ name: "ACT34000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT34000.${k}`);
const store = ACT34000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const tone = (v: unknown) => (Number(v) >= 0 ? "act_ok" : "act_bad");
const OPEN = ["op", "inv", "fin"];

const sections = computed(() => [
	{ key: "op", label: "OPERATING", rows: store.operatingList, total: store.operatingTotal },
	{ key: "inv", label: "INVESTING", rows: store.investingList, total: store.investingTotal },
	{ key: "fin", label: "FINANCING", rows: store.financingList, total: store.financingTotal }
]);

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
