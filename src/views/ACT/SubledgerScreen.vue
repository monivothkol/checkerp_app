<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH')" />
				</ion-toolbar>
			</template>
		</bm-header>
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="loading" type="indeterminate" />
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="asOfDate" type="date" :label="tr('AS_OF')" label-placement="stacked" @ion-change="load" />
				</ion-item>
			</ion-list>
			<div class="act_cards">
				<div class="act_card"><div class="act_card_label">{{ tr("TOTAL") }}</div><div class="act_card_value">{{ money(totalBalance) }}</div></div>
				<div class="act_card"><div class="act_card_label">{{ tr("PARTIES") }}</div><div class="act_card_value">{{ partyCount }}</div></div>
			</div>

			<ion-list v-if="filtered.length" class="scr_list" lines="full">
				<ion-item v-for="p in filtered" :key="p.partyId ?? p.partyName">
					<ion-label>
						<h3>{{ p.partyName }}</h3>
						<p>{{ tr("ENTRIES") }}: {{ p.entryCount }}<span v-if="p.lastActivity"> · {{ tr("LAST_ACTIVITY") }}: {{ p.lastActivity }}</span></p>
					</ion-label>
					<span slot="end" class="act_amt">{{ money(p.balance) }}</span>
				</ion-item>
				<ion-item class="act_total">
					<ion-label><h2>{{ tr("TOTAL") }}</h2></ion-label>
					<span slot="end" class="act_amt act_bold">{{ money(totalBalance) }}</span>
				</ion-item>
			</ion-list>
			<bm-empty-state v-else-if="!loading" :description="`${localeNs}.EMPTY`" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import ModuleApi from "@/services/api/COMMON/module-api";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";

interface PartyRow {
	partyId?: string;
	partyName: string;
	entryCount: number;
	lastActivity?: string;
	balance: number;
}

/** Shared AR/AP subledger screen — trCode + locale namespace differ per use. */
defineOptions({ name: "SubledgerScreen" });

const props = defineProps<{ trCode: string; localeNs: string }>();
const { t } = useI18n();
const tr = (k: string) => t(`${props.localeNs}.${k}`);
const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");

const loading = ref(false);
const asOfDate = ref<string | undefined>(undefined);
const keyword = ref("");
const rows = ref<PartyRow[]>([]);
const totalBalance = ref(0);
const partyCount = ref(0);

const filtered = computed(() => {
	const kw = keyword.value.trim().toLowerCase();
	return kw ? rows.value.filter((r) => (r.partyName ?? "").toLowerCase().includes(kw)) : rows.value;
});

function load(): Promise<void> {
	loading.value = true;
	return new Promise((resolve) => ModuleApi.request(props.trCode, { asOfDate: asOfDate.value ?? "" }, {
		onSuccess: (p: Record<string, any>) => {
			rows.value = (p.partyList ?? []) as PartyRow[];
			totalBalance.value = Number(p.totalBalance ?? 0);
			partyCount.value = Number(p.partyCount ?? 0);
			loading.value = false;
			resolve();
		},
		onFail: () => {
			rows.value = [];
			totalBalance.value = 0;
			partyCount.value = 0;
			loading.value = false;
			resolve();
		}
	}));
}
useViewEnter(() => void load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	await load();
	await ev.target.complete();
}
</script>

<style scoped src="./act-report.css"></style>
