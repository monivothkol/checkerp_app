<template>
	<ion-page>
		<bm-content>
			<div class="wrap_content">
				<h1 class="login_welcome">{{ $t("AUT10000.LABEL.WELCOME") }}</h1>

				<!-- TODO(style): replace with the CHECK ERP logo image -->
				<div class="login_logo">
					<img src="@/assets/images/nivots_logo.svg" alt="CHECK ERP">
				</div>

				<div class="formwrap01">
					<ion-row>
						<ion-col>
							<bm-input v-model="companyId" :placeholder="$t('AUT10000.LABEL.COMPANY_ID')">
								<template #label>{{ $t("AUT10000.LABEL.COMPANY_ID") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col>
							<bm-input v-model="username" :placeholder="$t('AUT10000.LABEL.USERNAME')">
								<template #label>{{ $t("AUT10000.LABEL.USERNAME") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col>
							<bm-input v-model="password" :placeholder="$t('AUT10000.LABEL.PASSWORD')" type="password">
								<template #label>{{ $t("AUT10000.LABEL.PASSWORD") }}</template>
							</bm-input>
						</ion-col>
					</ion-row>
					<ion-row>
						<ion-col>
							<p class="login_forgot">
								{{ $t("AUT10000.LABEL.FORGOT_PASSWORD") }}
								<a @click="onClickForgotPassword">{{ $t("AUT10000.BUTTON.CLICK_HERE") }}</a>
							</p>
						</ion-col>
					</ion-row>
				</div>

				<!-- TODO(style): OR divider -->
				<div class="login_or">
					<span class="circle">{{ $t("AUT10000.LABEL.OR") }}</span>
				</div>

				<bm-button class="btn01 has_ico marTop16" fill="outline" @click="onClickGoogleLogin">
					<span class="ico_gmail">{{ $t("AUT10000.BUTTON.LOGIN_WITH_GOOGLE") }}</span>
				</bm-button>
			</div>
		</bm-content>
		<bm-footer>
			<bm-button class="btn01" @click="onClickLogin">
				<span>{{ $t("AUT10000.BUTTON.LOGIN") }}</span>
			</bm-button>
		</bm-footer>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: AUT10000
 * Description: Login
 *
 * ---------------------------------------------------------
 * */
import AuthModule from "@/modules/aut-module";
import RouterServices from "@/services/router-services";
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { onIonViewWillEnter } from "@ionic/vue";
import { ref } from "vue";

defineOptions({
	name: "AUT10000",
	description: "Login"
});

const authModule = AuthModule.getInstance();
const routerService = new RouterServices();
const companyId = ref("");
const username = ref("");
const password = ref("");

onIonViewWillEnter(() => {
	companyId.value = "";
	username.value = "";
	password.value = "";
});

const onClickLogin = () => {
	if (!companyId.value || !username.value || !password.value) {
		DialogUtil.showToast({ message: "Please enter company ID, username and password" });
		return;
	}

	authModule.login({
		body: {
			companyId: companyId.value,
			username: username.value,
			password: password.value
		},
		enableLoading: true,
		onSuccess: (response) => {
			BizCheckMobileLogger.info("AUT10000 login success", response);
			routerService.replace("/main/home");
		},
		onFailed: (error: any) => {
			DialogUtil.showAlert({
				header: "Login Failed",
				message: error?.message || "Invalid username or password"
			});
		}
	});
};

const onClickGoogleLogin = () => {
	// TODO: integrate Google Sign-In SDK, then send idToken to backend
	BizCheckMobileLogger.info("AUT10000 login with Google clicked");
};

const onClickForgotPassword = () => {
	// TODO: navigate to forgot-password screen when its screen ID is defined
	BizCheckMobileLogger.info("AUT10000 forgot password clicked");
};
</script>

<style lang="scss" scoped>
.login_welcome { padding-top: 32px; font-size: 1.4rem; font-weight: 700; text-align: center;}
.login_logo { margin: 24px auto; text-align: center; width: 100%; height: 80px;}
.login_or { margin-top: 16px; width: 100%; height: 45px; position: relative; display: flex; align-items: center; justify-content: center;
	.circle { z-index: 1; text-align: center; line-height: 45px; background: #FFFFFF; border-radius: 100%;; height: 45px; width: 45px;}
	&::before { content: ""; position: absolute; left: 0; top: calc(50% - 1px); height: 2px; width: 100%; background-color: #CCCCCC;}
}
.login_forgot { text-align: center; font-size: var(--font14); font-weight: 400; 
	a { font-weight: 600; color: var(--colorPrimary); text-decoration: underline;}
}
</style>