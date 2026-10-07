<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu">
			<template v-if="!store.loading" #end>
				<!-- Always available: only adds the default accounts this company is missing. -->
				<ion-button @click="initializeDefaults">{{ tr(store.accounts.length ? "ADD_MISSING_DEFAULTS" : "INITIALIZE") }}</ion-button>
			</template>
			<template #bottom>
				<ion-toolbar>
					<ion-searchbar v-model="store.keyword" :placeholder="tr('SEARCH_PLACEHOLDER')" @ion-input="store.onSearch" />
				</ion-toolbar>
				<ion-toolbar>
					<ion-select class="coa_type" :value="store.typeFilter ?? ''" interface="action-sheet" @ion-change="store.typeFilter = $event.detail.value || undefined; store.load()">
						<ion-select-option value="">{{ tr("ALL_TYPES") }}</ion-select-option>
						<ion-select-option v-for="ty in TYPES" :key="ty" :value="ty">{{ ty }}</ion-select-option>
					</ion-select>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<bm-empty-state v-if="!store.loading && store.accounts.length === 0" description="ACT40000.EMPTY" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item v-for="a in store.accounts" :key="a.accountCode" button :detail="true" :class="{ coa_header: a.isHeader, coa_child: !!a.parentCode }" @click="openForm(a)">
					<ion-label>
						<p>{{ a.accountCode }} · {{ a.accountType }} · {{ a.normalBalance }}</p>
						<h3 :class="{ act_bold: a.isHeader }">{{ a.accountName }}</h3>
						<p class="coa_flags">
							<ion-badge v-if="a.isSystem" color="primary">{{ tr("SYSTEM") }}</ion-badge>
							<ion-badge v-if="a.isHeader" color="medium">{{ tr("HEADER") }}</ion-badge>
							<ion-badge v-if="a.isRestricted" color="danger">{{ tr("RESTRICTED") }}</ion-badge>
							<ion-badge v-if="a.isReconcilable" color="success">{{ tr("RECONCILABLE") }}</ion-badge>
						</p>
					</ion-label>
					<ion-badge slot="end" :color="a.isActive ? 'success' : 'medium'">{{ a.isActive ? tr("ACTIVE") : tr("INACTIVE") }}</ion-badge>
				</ion-item>
			</ion-list>

			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button :aria-label="tr('ADD_ACCOUNT')" @click="openForm()"><ion-icon :icon="add" /></ion-fab-button>
			</ion-fab>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import { add } from "ionicons/icons";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT40000Store } from "@/store/ACT/ACT40000Store";
import type { ActAccount } from "@/models/ACT/ACT40000";
import AccountFormModal from "@/views/ACT/ACT40100.vue";

/** Chart of accounts: search/type filter, tap = edit sheet, FAB = new account, seed missing default accounts. */
defineOptions({ name: "ACT40000" });

const TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
const { t } = useI18n();
const tr = (k: string) => t(`ACT40000.${k}`);
const store = ACT40000Store();

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
/** It writes to the company's chart — ask first, never on a single tap. */
function initializeDefaults(): void {
	const has = store.accounts.length > 0;
	POP.confirm({
		title: tr(has ? "ADD_MISSING_DEFAULTS" : "INITIALIZE"),
		content: tr(has ? "ADD_MISSING_CONFIRM" : "INITIALIZE_CONFIRM"),
		okBtn: {
			btnText: tr(has ? "ADD_MISSING_DEFAULTS" : "INITIALIZE"),
			onClick: () => store.initialize({ initialized: tr("INITIALIZED"), failed: tr("INITIALIZE_FAILED"), complete: tr("DEFAULTS_COMPLETE") })
		}
	});
}
function openForm(account?: ActAccount): void {
	POP.showPopup(AccountFormModal, {
		title: account ? tr("EDIT_ACCOUNT") : tr("ADD_ACCOUNT"),
		props: { account: account ?? null, accounts: store.accounts }
	}).promise.then(() => store.load()).catch(() => undefined);
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
.coa_type { padding: 0 16px; font-size: 14px; }
.coa_header { --background: #fafbfe; }
.coa_child { --padding-start: 32px; }
.coa_flags ion-badge { margin-right: 4px; font-size: 10px; }
</style>
