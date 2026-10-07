<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ADM30000" />
		<ion-content>
			<ion-progress-bar v-if="store.loading" type="indeterminate" />
			<ion-list v-else class="scr_list" lines="full">
				<ion-item>
					<ion-label class="ion-text-wrap">
						<p>{{ tr("LOGO") }}</p>
						<img v-if="store.logoUrl" :src="store.logoUrl" class="adm_logo" alt="logo" />
						<div v-else class="adm_logo adm_logo_ph">{{ tr("NO_LOGO") }}</div>
						<p class="adm_hint">{{ tr("LOGO_HINT") }}</p>
					</ion-label>
					<ion-button slot="end" fill="outline" :disabled="store.uploadingLogo" @click="logoInput?.click()">{{ tr("UPLOAD_LOGO") }}</ion-button>
					<input ref="logoInput" type="file" accept="image/*" style="display: none" aria-label="Upload image" @change="onLogoPicked" />
				</ion-item>
				<ion-item><ion-input :value="store.fixed.companyCode" :label="tr('CODE')" label-placement="stacked" disabled /></ion-item>
				<ion-item><ion-input :value="store.fixed.subdomain" :label="tr('SUBDOMAIN')" label-placement="stacked" disabled /></ion-item>
				<ion-item><ion-input :value="store.fixed.currency" :label="tr('CURRENCY')" label-placement="stacked" disabled /></ion-item>
				<ion-item><ion-input v-model="store.form.companyName" :label="`${tr('NAME')} *`" label-placement="stacked" :maxlength="150" /></ion-item>
				<ion-item><ion-input v-model="store.form.legalName" :label="tr('LEGAL_NAME')" label-placement="stacked" :maxlength="150" /></ion-item>
				<ion-item><ion-input v-model="store.form.taxId" :label="tr('TAX_ID')" label-placement="stacked" :maxlength="50" /></ion-item>
				<ion-item><ion-input v-model="store.form.email" :label="tr('EMAIL')" label-placement="stacked" type="email" :maxlength="150" /></ion-item>
				<ion-item><ion-input v-model="store.form.phone" :label="tr('PHONE')" label-placement="stacked" type="tel" inputmode="tel" :maxlength="50" /></ion-item>
				<ion-item><ion-input v-model="store.form.address" :label="tr('ADDRESS')" label-placement="stacked" :maxlength="250" /></ion-item>
				<ion-item><ion-input v-model="store.form.city" :label="tr('CITY')" label-placement="stacked" :maxlength="100" /></ion-item>
				<ion-item><ion-input v-model="store.form.state" :label="tr('STATE')" label-placement="stacked" :maxlength="100" /></ion-item>
				<ion-item><ion-input v-model="store.form.postalCode" :label="tr('POSTAL_CODE')" label-placement="stacked" :maxlength="20" /></ion-item>
				<ion-item><ion-input v-model="store.form.country" :label="tr('COUNTRY')" label-placement="stacked" :maxlength="100" /></ion-item>
				<ion-item>
					<ion-label position="stacked">{{ tr("INVOICE_TERMS") }}</ion-label>
					<!-- Terms are HTML (the web edits them in a rich-text box): edit in place so existing formatting survives. -->
					<div ref="termsEl" class="adm_terms" contenteditable="true" @input="onTermsInput" />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" :disabled="store.saving" @click="router.push('/ADM30000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="store.saving || store.loading || !store.canSave" @click="onSave">{{ tr("SAVE") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM31000Store } from "@/store/POS/ADM/ADM31000Store";

/** ADM31000 — edit store information + logo upload (≤ 2 MB image). */
defineOptions({ name: "ADM31000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM31000.${k}`);
const router = useRouter();
const store = ADM31000Store();
const logoInput = ref<HTMLInputElement>();
const termsEl = ref<HTMLDivElement>();

watch(() => store.redirectTo, (to) => { if (to) router.push(to); });
// Seed the editor once per load (not reactively — rewriting innerHTML while typing moves the caret).
watch(() => store.loading, async (busy) => {
	if (busy) return;
	await nextTick();
	if (termsEl.value) termsEl.value.innerHTML = UT.purifyHTML(store.form.invoiceTerms ?? "");
});

useViewEnter(() => store.load());

function onTermsInput(): void {
	store.form.invoiceTerms = termsEl.value?.innerHTML ?? "";
}
function onSave(): void {
	store.save({ savedTitle: tr("SAVED"), savedMsg: tr("SAVED_MSG"), failedTitle: tr("FAILED") });
}
function onLogoPicked(e: Event): void {
	const input = e.target as HTMLInputElement;
	const file = input.files?.[0];
	input.value = ""; // allow re-picking the same file
	if (!file) return;
	if (!file.type.startsWith("image/")) { POP.alert({ status: "error", content: tr("LOGO_TYPE_ERR") }); return; }
	if (file.size > 2 * 1024 * 1024) { POP.alert({ status: "error", content: tr("LOGO_SIZE_ERR") }); return; }
	const reader = new FileReader();
	reader.onload = () => store.uploadLogo(String(reader.result), file.type, tr("FAILED"));
	reader.readAsDataURL(file);
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
.adm_logo { display: block; height: 64px; max-width: 160px; object-fit: contain; border: 1px solid var(--ion-color-light-shade); border-radius: 8px; padding: 4px; margin: 4px 0; background: #fff; }
.adm_logo_ph { width: 120px; display: flex; align-items: center; justify-content: center; border-style: dashed; font-size: 12px; color: var(--ion-color-medium); }
.adm_hint { font-size: 12px; }
.adm_terms { width: 100%; min-height: 96px; padding: 8px; margin: 8px 0; font-size: 14px; line-height: 1.6; border: 1px solid var(--ion-color-light-shade); border-radius: 8px; outline: none; }
.adm_terms :deep(ul) { list-style: disc; padding-left: 16px; }
.adm_terms :deep(ol) { list-style: decimal; padding-left: 16px; }
.adm_terms :deep(p) { margin: 0 0 4px; }
</style>
