<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/LVM11000" />
		<ion-content>
			<bm-empty-state v-if="!store.draft" description="LVM12000.NO_DRAFT" />
			<template v-else>
				<ion-list class="scr_list" lines="full">
					<ion-item><ion-label><p>{{ tr("STAFF") }}</p><h3>{{ store.draft.display.staffName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("TYPE") }}</p><h3>{{ store.draft.display.typeName }}</h3></ion-label></ion-item>
					<ion-item><ion-label><p>{{ tr("DATES") }}</p><h3>{{ store.draft.display.startDate }} → {{ store.draft.display.endDate }}</h3></ion-label></ion-item>
					<ion-item>
						<ion-label><p>{{ tr("DAYS") }}</p><h3><strong>{{ store.draft.display.days }}</strong></h3></ion-label>
						<ion-badge v-if="store.draft.display.isHalfDay" slot="end" color="tertiary">{{ tr("HALF_DAY") }}</ion-badge>
					</ion-item>
					<ion-item v-if="store.draft.display.reason"><ion-label class="ion-text-wrap"><p>{{ tr("REASON") }}</p><h3>{{ store.draft.display.reason }}</h3></ion-label></ion-item>
				</ion-list>

				<ion-list class="scr_list" lines="full">
					<ion-list-header>{{ tr("APPROVAL_LINE") }}</ion-list-header>
					<ion-item v-for="(name, i) in store.approvers" :key="i">
						<ion-badge slot="start" color="primary">{{ i + 1 }}</ion-badge>
						<ion-label>{{ name }}</ion-label>
					</ion-item>
					<ion-item v-if="!store.approvers.length"><ion-note>{{ tr("NO_APPROVERS") }}</ion-note></ion-item>
				</ion-list>

				<div v-if="store.draft.display.followers.length" class="lvm_chips">
					<p>{{ tr("FOLLOWERS") }}</p>
					<ion-chip v-for="(name, i) in store.draft.display.followers" :key="i">{{ name }}</ion-chip>
				</div>
			</template>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="lvm_btns">
					<ion-button fill="outline" :disabled="store.submitting" @click="router.push('/LVM11000')">{{ tr("BACK") }}</ion-button>
					<ion-button :disabled="store.submitting || !store.draft" @click="store.submit(tr('FAILED'))">{{ tr("CONFIRM") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { LVM12000Store } from "@/store/POS/LVM/LVM12000Store";

/** New leave request, step 2: review the draft (approval line in order) and submit it (idempotent). */
defineOptions({ name: "LVM12000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`LVM12000.${k}`);
const store = LVM12000Store();

watch(() => store.redirectTo, (to) => { if (to) router.replace(to); });
useViewEnter(() => { if (!store.loadDraft()) router.replace("/LVM11000"); });
</script>

<style scoped>
ion-label h3 { font-size: 14px; }
.lvm_chips { padding: 8px 16px; }
.lvm_chips p { font-size: 12px; font-weight: 700; color: var(--ion-color-medium); margin: 0 0 4px; }
.lvm_btns { display: flex; gap: 8px; padding: 0 8px; }
.lvm_btns ion-button { flex: 1; }
</style>
