<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PMM20000" />

		<ion-content>
			<bm-empty-state v-if="!store.draft" description="PMM30000.NO_DRAFT" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="row in rows" :key="row.key">
						<ion-label>
							<p>{{ tr(row.key) }}</p>
							<h3 class="pmc_value">{{ row.value }}</h3>
						</ion-label>
					</ion-item>
				</ion-list>

				<div v-if="store.draft.display.targets.length" class="pmc_chips">
					<ion-chip v-for="(tg, i) in store.draft.display.targets" :key="i" color="primary"><ion-label>{{ tg }}</ion-label></ion-chip>
				</div>

				<ion-list v-if="store.draft.display.bundle.length" class="scr_list" lines="full">
					<ion-list-header>{{ tr("PRODUCT") }}</ion-list-header>
					<ion-item v-for="(b, i) in store.draft.display.bundle" :key="i">
						<ion-label>
							<h3>{{ b.name }}</h3>
							<p>{{ tr("QTY") }}: {{ b.qty }} · {{ tr("BUNDLE_PRICE") }}: {{ money(b.price) }}</p>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
		</ion-content>

		<ion-footer>
			<ion-toolbar class="pmc_btns">
				<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/PMM20000')">{{ tr("BACK") }}</ion-button>
				<ion-button :disabled="!store.draft || store.submitting" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PMM30000Store } from "@/store/POS/PMM/PMM30000Store";

/** PMM30000 — review the promotion draft and create it (idempotent submit). */
defineOptions({ name: "PMM30000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`PMM30000.${key}`);
const store = PMM30000Store();

useViewEnter(() => {
	if (!store.loadDraft()) router.replace("/PMM20000");
});
watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });

const money = (v: unknown) => "$ " + UT.currency((v as string | number) ?? 0, "USD");
const rows = computed(() => {
	const d = store.draft?.display;
	if (!d) return [];
	return [
		{ key: "NAME", value: d.name },
		{ key: "TYPE", value: d.type },
		{ key: "REWARD", value: d.reward },
		{ key: "APPLIES_TO", value: d.scope },
		{ key: "PERIOD", value: d.period },
		{ key: "ACTIVE", value: d.isActive ? tr("YES") : tr("NO") }
	];
});
</script>

<style scoped>
.pmc_value { font-size: 14px; white-space: normal; }
.pmc_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 16px; }
.pmc_btns { --padding-start: 16px; --padding-end: 16px; }
.pmc_btns ion-button { width: calc(50% - 4px); }
ion-label h3 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
