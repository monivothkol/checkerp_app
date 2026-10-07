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
				<div class="act_card"><div class="act_card_label">{{ tr("OUTPUT_VAT") }} · {{ store.outputVatCode }}</div><div class="act_card_value">{{ money(store.outputVat) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("INPUT_VAT") }} · {{ store.inputVatCode }}</div><div class="act_card_value">{{ money(store.inputVat) }}</div></div>
				<div class="act_card">
					<div class="act_card_label">{{ store.netPayable < 0 ? tr("NET_REFUNDABLE") : tr("NET_PAYABLE") }}</div>
					<div class="act_card_value" :class="store.netPayable > 0 ? 'act_bad' : 'act_ok'">{{ money(Math.abs(store.netPayable)) }}</div>
				</div>
			</div>

			<ion-accordion-group :multiple="true" :value="OPEN">
				<ActSection v-for="sec in sections" :key="sec.key" :value="sec.key" :title="tr(sec.label)" :total="money(sec.total)">
					<ion-item v-for="r in sec.rows" :key="r.sourceType">
						<ion-label>
							<h3>{{ sourceLabel(r.sourceType) }}</h3>
							<p>{{ tr(sec.amountLabel) }} {{ money(r.amount) }} · {{ tr("COL_RETURNS") }} {{ money(r.adjustment) }}</p>
						</ion-label>
						<div slot="end" class="vat_end"><small>{{ tr("COL_NET") }}</small><span class="act_amt act_bold">{{ money(r.net) }}</span></div>
					</ion-item>
					<ion-item v-if="!sec.rows.length"><ion-label class="act_muted">{{ tr("NONE") }}</ion-label></ion-item>
					<ion-item class="act_total">
						<ion-label><h2>{{ tr("SUBTOTAL") }}</h2></ion-label>
						<span slot="end" class="act_amt act_bold">{{ money(sec.total) }}</span>
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
import { ACT36000Store } from "@/store/ACT/ACT36000Store";
import ActDateRange from "@/views/ACT/ActDateRange.vue";
import ActSection from "@/views/ACT/ActSection.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** VAT return for a period: output VAT collected vs input VAT paid, by source; PDF/Excel export. */
defineOptions({ name: "ACT36000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT36000.${k}`);
const store = ACT36000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const OPEN = ["out", "in"];

const sections = computed(() => [
	{ key: "out", label: "OUTPUT_VAT", amountLabel: "COL_COLLECTED", rows: store.outputList, total: store.outputVat },
	{ key: "in", label: "INPUT_VAT", amountLabel: "COL_PAID", rows: store.inputList, total: store.inputVat }
]);
/** Source type → readable label ("SALE_RETURN" → "Sale Return"). */
const sourceLabel = (s: string) => s.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.vat_end { display: flex; flex-direction: column; align-items: flex-end;
	small { font-size: 10px; color: #6b6b76; }
}
</style>
