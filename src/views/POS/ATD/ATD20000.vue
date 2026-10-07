<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content>
			<div class="atd_qr_wrap">
				<canvas ref="qrCanvas" class="atd_qr"></canvas>
				<div class="atd_countdown" :class="{ warn: store.secondsLeft < 60 }">{{ tr("RENEWS_IN") }} {{ store.countdownText }}</div>
				<p class="atd_hint">{{ tr("SCAN_HINT") }}</p>
			</div>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.renewalTime" type="time" :label="tr('RENEWAL_TIME')" label-placement="stacked" :helper-text="tr('RENEWAL_HINT')" />
					<ion-button slot="end" :disabled="store.savingTime" @click="store.saveRenewalTime(tr('SAVE_FAILED'))">{{ tr("SAVE") }}</ion-button>
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import QRCode from "qrcode";
import { ATD20000Store } from "@/store/POS/ATD/ATD20000Store";

/** Rotating check-in QR; staff scan it from /ATD40000 on their phone. */
defineOptions({ name: "ATD20000" });

const { t } = useI18n();
const tr = (k: string) => t(`ATD20000.${k}`);
const store = ATD20000Store();
const qrCanvas = ref<HTMLCanvasElement>();
let tick: ReturnType<typeof setInterval> | undefined;

function renderQr(): void {
	if (qrCanvas.value && store.token) void QRCode.toCanvas(qrCanvas.value, store.token, { width: 280, margin: 1 });
}
// Re-render whenever the store loads a fresh token.
watch(() => store.token, renderQr);

onMounted(() => {
	store.loadToken();
	renderQr();
	tick = setInterval(() => store.tick(), 1000);
});
onBeforeUnmount(() => { if (tick) clearInterval(tick); });
</script>

<style scoped>
.atd_qr_wrap { text-align: center; padding: 16px; }
.atd_qr { max-width: 100%; }
.atd_countdown { font-size: 16px; font-weight: 700; margin-top: 8px; }
.atd_countdown.warn { color: var(--ion-color-danger); }
.atd_hint { font-size: 12px; color: var(--ion-color-medium); margin: 8px 0 0; }
</style>
