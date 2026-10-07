<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/main/menu" />
		<ion-content class="ion-padding">
			<div v-if="store.result" class="atd_result" :class="store.result.ok ? 'ok' : 'err'">
				<ion-icon :icon="store.result.ok ? checkmarkCircle : closeCircle" :color="store.result.ok ? 'success' : 'danger'" class="atd_result_icon" />
				<div>
					<div class="atd_result_action">{{ tr(store.result.titleKey) }}</div>
					<div class="atd_hint">{{ store.result.detail }}</div>
				</div>
			</div>

			<div class="atd_scan">
				<template v-if="cameraSupported">
					<video v-show="scanning" ref="video" class="atd_video" muted playsinline></video>
					<ion-button v-if="!scanning" expand="block" @click="startScan">{{ tr("START_CAMERA") }}</ion-button>
					<ion-button v-else expand="block" fill="outline" :disabled="store.submitting" @click="stopScan">{{ tr("STOP_CAMERA") }}</ion-button>
				</template>
				<ion-note v-else class="atd_hint">{{ tr("NO_CAMERA") }}</ion-note>
			</div>

			<!-- Manual fallback: paste the code shown under the QR -->
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-input v-model="store.manualToken" :placeholder="tr('MANUAL_PH')" :clear-input="true" />
					<ion-button slot="end" :disabled="store.submitting || !store.manualToken" @click="store.submit(store.manualToken)">{{ tr("SUBMIT") }}</ion-button>
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import NATIVE from "@/core/utilities/native-bridge";
import { onBeforeUnmount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { onIonViewWillLeave } from "@ionic/vue";
import { checkmarkCircle, closeCircle } from "ionicons/icons";
import { ATD40000Store } from "@/store/POS/ATD/ATD40000Store";

/**
 * Staff self check-in: scans the counter QR with the camera (BarcodeDetector where the WebView has it,
 * manual paste otherwise) and posts ATD41000; each scan fills the next punch slot.
 */
defineOptions({ name: "ATD40000" });

interface DetectedCode { rawValue: string }
interface QrDetector { detect(source: HTMLVideoElement): Promise<DetectedCode[]> }
type DetectorCtor = new (opts: { formats: string[] }) => QrDetector;

const { t } = useI18n();
const tr = (k: string) => t(`ATD40000.${k}`);
const store = ATD40000Store();
const video = ref<HTMLVideoElement>();
// Native shell scanner first (one scan per tap), else the WebView camera with BarcodeDetector.
const cameraSupported = ref(NATIVE.canScanBarcode() || (typeof navigator !== "undefined" && !!navigator.mediaDevices && "BarcodeDetector" in window));
const scanning = ref(false);
let stream: MediaStream | null = null;
let scanTimer: ReturnType<typeof setInterval> | undefined;

async function startScan(): Promise<void> {
	if (NATIVE.canScanBarcode()) {
		const code = await NATIVE.scanBarcode();
		if (code) store.submit(code);
		return;
	}
	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
		const el = video.value as HTMLVideoElement;
		el.srcObject = stream;
		await el.play();
		scanning.value = true;
		const Detector = (window as unknown as { BarcodeDetector: DetectorCtor }).BarcodeDetector;
		const detector = new Detector({ formats: ["qr_code"] });
		scanTimer = setInterval(async () => {
			if (store.submitting || Date.now() < store.cooldownUntil) return;
			try {
				const codes = await detector.detect(el);
				if (codes.length) store.submit(codes[0].rawValue);
			} catch { /* frame not ready */ }
		}, 500);
	} catch {
		stopScan();
		cameraSupported.value = false;
	}
}
function stopScan(): void {
	if (scanTimer) clearInterval(scanTimer);
	scanTimer = undefined;
	stream?.getTracks().forEach((track) => track.stop());
	stream = null;
	scanning.value = false;
}
// Ionic keeps the page alive when navigating away: release the camera then too.
onIonViewWillLeave(stopScan);
onBeforeUnmount(stopScan);
</script>

<style scoped>
.atd_result { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; margin-bottom: 16px; background: var(--ion-color-light); }
.atd_result_icon { font-size: 32px; }
.atd_result_action { font-size: 16px; font-weight: 700; }
.atd_hint { font-size: 12px; color: var(--ion-color-medium); }
.atd_scan { display: flex; flex-direction: column; align-items: stretch; gap: 12px; margin-bottom: 16px; }
.atd_video { width: 100%; border-radius: 8px; background: #000; }
</style>
