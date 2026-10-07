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
				<ion-item>
					<ion-input v-model="store.asOfDate" type="date" :label="tr('AS_OF')" label-placement="stacked" @ion-change="store.load" />
				</ion-item>
			</ion-list>

			<div class="act_badge" :class="store.balanced ? 'act_ok' : 'act_bad'">{{ store.balanced ? tr("BALANCED") : tr("UNBALANCED") }}</div>
			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("ASSETS") }}</div><div class="act_card_value">{{ money(store.totalAssets) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("LIABILITIES") }}</div><div class="act_card_value">{{ money(store.totalLiabilities) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("EQUITY") }}</div><div class="act_card_value">{{ money(store.totalEquity) }}</div></div>
			</div>

			<ion-accordion-group :multiple="true" :value="OPEN">
				<ActSection v-for="section in sections" :key="section.key" :value="section.key" :title="section.title" :total="money(section.total)">
					<ion-item v-for="r in section.rows" :key="r.accountCode + r.accountName">
						<ion-label><p>{{ r.accountCode }}</p><h3>{{ r.accountName }}</h3></ion-label>
						<span slot="end" class="act_amt">{{ money(r.balance) }}</span>
					</ion-item>
					<ion-item v-if="!section.rows.length"><ion-label class="act_muted">{{ tr("NONE") }}</ion-label></ion-item>
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("TOTAL") }} {{ section.title }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(section.total) }}</span>
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
import { ACT31000Store } from "@/store/ACT/ACT31000Store";
import ActSection from "@/views/ACT/ActSection.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** Balance sheet as of a date: asset/liability/equity sections + balanced check; PDF/Excel export. */
defineOptions({ name: "ACT31000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT31000.${k}`);
const store = ACT31000Store();
const OPEN = ["a", "l", "e"];
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const sections = computed(() => [
	{ key: "a", title: tr("ASSETS"), rows: store.assetList, total: store.totalAssets },
	{ key: "l", title: tr("LIABILITIES"), rows: store.liabilityList, total: store.totalLiabilities },
	{ key: "e", title: tr("EQUITY"), rows: store.equityList, total: store.totalEquity }
]);

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
