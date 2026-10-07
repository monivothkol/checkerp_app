<template>
	<ion-page>
		<bm-content>
			<div class="wrap_content">
				<h1 class="login_welcome">{{ tr("LABEL.WELCOME") }}</h1>
				<div class="login_logo">
					<img src="@/assets/images/nivots_logo.svg" alt="CHECK ERP">
				</div>

				<div class="formwrap01">
					<ion-row>
						<ion-col>
							<bm-input v-model="store.subdomain" :placeholder="tr('LABEL.COMPANY_ID')" autocapitalize="off">
								<template #label>{{ tr("LABEL.COMPANY_ID") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col>
							<bm-input v-model="store.username" :placeholder="tr('LABEL.USERNAME')" autocapitalize="off">
								<template #label>{{ tr("LABEL.USERNAME") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col>
							<bm-input v-model="store.password" :placeholder="tr('LABEL.PASSWORD')" type="password" @keyup.enter="onLogin">
								<template #label>{{ tr("LABEL.PASSWORD") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
				</div>
			</div>
		</bm-content>
		<bm-footer>
			<bm-button class="btn01" :disabled="store.submitting" @click="onLogin">
				<span>{{ tr("BUTTON.LOGIN") }}</span>
			</bm-button>
		</bm-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { onIonViewWillEnter, useIonRouter } from "@ionic/vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { SUBDOMAIN_DASHBOARD } from "@/core/config/tenant-nav";
import { AUT10000Store } from "@/store/COMMON/AUT10000Store";

/** AUT10000 — sign in to a company with username and password. */
defineOptions({ name: "AUT10000" });

const { t } = useI18n();
const tr = (key: string) => t(`AUT10000.${key}`);
const store = AUT10000Store();
const router = useIonRouter();

onIonViewWillEnter(() => void store.restore());

async function onLogin(): Promise<void> {
	if (!store.subdomain.trim() || !store.username.trim() || !store.password) {
		POP.alert({ status: "error", title: tr("MESSAGE.LOGIN_FAILED"), content: tr("MESSAGE.REQUIRED") });
		return;
	}
	const res = await store.login();
	if (res.ok) {
		router.navigate(SUBDOMAIN_DASHBOARD, "root", "replace");
		return;
	}
	if (res.silent) return;
	const content = res.message === "COMPANY_NOT_FOUND" ? tr("MESSAGE.COMPANY_NOT_FOUND") : res.message || res.code || tr("MESSAGE.LOGIN_FAILED");
	POP.alert({ status: "error", title: tr("MESSAGE.LOGIN_FAILED"), content });
}
</script>

<style lang="scss" scoped>
.login_welcome { padding-top: 32px; font-size: 16px; font-weight: 700; text-align: center; }
.login_logo { margin: 16px auto; text-align: center; width: 100%; height: 80px; }
</style>
