<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)"><ion-refresher-content /></ion-refresher>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-note class="act_hint">{{ tr("HINT") }}</ion-note>
			<template v-for="g in store.groups" :key="g.name">
				<div class="act_section">{{ tr("GROUP_" + g.name) }}</div>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="r in g.rows" :key="r.ruleKey">
						<ion-select v-model="r.accountCode" label-placement="stacked" interface="action-sheet" :interface-options="{ header: r.label }">
							<div slot="label">
								<b>{{ r.label }}</b>
								<div class="pr_default">{{ tr("DEFAULT") }}: {{ r.defaultCode }} — {{ r.defaultName }}</div>
							</div>
							<ion-select-option value="">{{ tr("USE_DEFAULT") }}</ion-select-option>
							<ion-select-option v-for="a in store.accounts" :key="a.accountCode" :value="a.accountCode">{{ a.accountCode }} — {{ a.accountName }}</ion-select-option>
						</ion-select>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="act_btns"><ion-button :disabled="store.saving" @click="onSave">{{ tr("SAVE") }}</ion-button></div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { RefresherCustomEvent } from "@ionic/vue";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ACT43000Store } from "@/store/ACT/ACT43000Store";

/** Posting rules: per-slot account override (blank = system default), grouped by SALES/CASH/...; one Save. */
defineOptions({ name: "ACT43000" });

const { t } = useI18n();
const tr = (k: string) => t(`ACT43000.${k}`);
const store = ACT43000Store();

useViewEnter(() => store.load());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> {
	store.load();
	await ev.target.complete();
}
function onSave(): void {
	store.save(tr("SAVE_FAILED"), () => POP.alert({ status: "success", title: tr("SAVED"), content: tr("SAVED_MSG") }));
}
</script>

<style scoped src="./act-report.css"></style>
<style scoped>
ion-select { font-size: 14px; }
.pr_default { font-size: 12px; color: #6b6b76; font-weight: 400; }
.act_hint { padding-bottom: 8px; }
</style>
