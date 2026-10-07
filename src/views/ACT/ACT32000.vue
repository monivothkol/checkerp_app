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

			<bm-empty-state v-if="!store.loading && store.rows.length === 0" description="ACT32000.EMPTY" />
			<template v-else>
				<div class="act_badge" :class="store.balanced ? 'act_ok' : 'act_bad'">{{ store.balanced ? tr("BALANCED") : tr("UNBALANCED") }}</div>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="r in store.rows" :key="r.accountCode">
						<ion-label>
							<p>{{ r.accountCode }} · <ion-badge color="medium">{{ r.accountType }}</ion-badge></p>
							<h3 class="ion-text-wrap">{{ r.accountName }}</h3>
							<p>{{ tr("DEBIT") }} {{ money(r.totalDebit) }} · {{ tr("CREDIT") }} {{ money(r.totalCredit) }}</p>
						</ion-label>
						<div slot="end" class="tb_end"><small>{{ tr("BALANCE") }}</small><span class="act_amt">{{ money(r.balance) }}</span></div>
					</ion-item>
					<ion-item class="act_total">
						<ion-label>
							<h2>{{ tr("TOTAL") }}</h2>
							<p>{{ tr("DEBIT") }} <b>{{ money(store.totalDebit) }}</b></p>
							<p>{{ tr("CREDIT") }} <b>{{ money(store.totalCredit) }}</b></p>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { downloadOutline } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT32000Store } from "@/store/ACT/ACT32000Store";
import ActDateRange from "@/views/ACT/ActDateRange.vue";
import { pickStatementExport } from "@/views/ACT/act-export";

/** Trial balance for a period: per-account debit/credit/balance, totals and balanced check; PDF/Excel export. */
defineOptions({ name: "ACT32000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT32000.${k}`);
const store = ACT32000Store();
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
const onExport = () => void pickStatementExport(tr, (format, done) => store.exportStatement(format, done));
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.tb_end { display: flex; flex-direction: column; align-items: flex-end;
	small { font-size: 10px; color: #6b6b76; }
}
ion-label p ion-badge { font-size: 10px; }
</style>
