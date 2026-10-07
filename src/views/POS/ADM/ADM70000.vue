<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.botToken" :label="tr('BOT_TOKEN')" label-placement="stacked" type="password" autocomplete="off"
						:placeholder="store.hasToken ? tr('TOKEN_UNCHANGED') : tr('TOKEN_PH')" :helper-text="store.hasToken ? tr('TOKEN_KEEP_HINT') : tr('TOKEN_SECURE_HINT')">
						<ion-input-password-toggle slot="end" />
					</ion-input>
				</ion-item>
				<ion-item><ion-input v-model="store.form.botUsername" :label="tr('BOT_USERNAME')" label-placement="stacked" placeholder="@mybot" autocapitalize="off" /></ion-item>
				<ion-item>
					<ion-input v-model="chatDraft" :label="`${tr('CHAT_IDS')} *`" label-placement="stacked" :placeholder="tr('CHAT_PH')" :helper-text="tr('CHAT_HINT')"
						enterkeyhint="done" @keyup.enter="addChat" @ion-blur="addChat" />
					<ion-button slot="end" fill="clear" :disabled="!chatDraft.trim()" @click="addChat"><ion-icon slot="icon-only" :icon="add" /></ion-button>
				</ion-item>
				<div v-if="store.chatList.length" class="adm_chips">
					<ion-chip v-for="(c, i) in store.chatList" :key="c" @click="store.chatList.splice(i, 1)">
						<ion-label>{{ c }}</ion-label><ion-icon :icon="closeCircle" />
					</ion-chip>
				</div>
				<ion-item><ion-toggle v-model="store.form.enablePaymentAlerts">{{ tr("PAYMENT_ALERTS") }}</ion-toggle></ion-item>
				<ion-item><ion-toggle v-model="store.form.enableDailySummary">{{ tr("DAILY_SUMMARY") }}</ion-toggle></ion-item>
				<ion-item v-if="store.form.enableDailySummary"><ion-input v-model="store.form.dailySummaryTime" :label="tr('SUMMARY_TIME')" label-placement="stacked" type="time" /></ion-item>
				<ion-item><ion-input v-model="store.form.timezone" :label="tr('TIMEZONE')" label-placement="stacked" /></ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button expand="block" :disabled="store.saving || store.loading || !store.chatList.length" @click="save">{{ tr("SAVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { add, closeCircle } from "ionicons/icons";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM70000Store } from "@/store/POS/ADM/ADM70000Store";

/** ADM70000 — Telegram alerts: bot token (write-only), chat ids (tags), alerts, daily summary time, timezone. */
defineOptions({ name: "ADM70000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM70000.${k}`);
const store = ADM70000Store();
const chatDraft = ref("");

useViewEnter(() => store.load());

/** Tag input: add the typed chat id once (the web's tags select ignores duplicates). */
function addChat(): void {
	const v = chatDraft.value.trim();
	if (v && !store.chatList.includes(v)) store.chatList.push(v);
	chatDraft.value = "";
}
function save(): void {
	addChat();
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failedTitle: tr("FAILED") });
}
</script>

<style scoped>
.adm_btns { display: flex; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_chips { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 16px 8px; }
ion-chip { font-size: 12px; margin: 0; }
</style>
