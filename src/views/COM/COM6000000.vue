<template>
    <ion-page>
        <bm-header :title="$t('COM6000000.TITLE')" />
        <bm-content class="bg_white">
            <div class="wrap_content flex_layout ">
				<div class="banner_text ico_lock">
					<p class="banner_tit">{{ $t('COM6000000.LABEL.ENTER_PASSWORD') }}</p>
					<p class="banner_desc">{{ $t('COM6000000.TEXT.BANNER_DESC') }}</p>
				</div>
                <div class="formwrap01 flex_1">
                    <ion-row>
                        <ion-col>
                            <bm-input ref="passwordInputRef" v-model="password" :placeholder="$t('COM6000000.LABEL.ENTER_VALUE')" type="password" @on-input="onPasswordInput" @on-focus="onPasswordFocus" @on-blur="onPasswordBlur"></bm-input>
                            <div class="dflex end">
                                <bm-button class="btn_text marTop8" @click="onForgetPassword">{{ $t('COM6000000.TEXT.FORGET_PASSWORD') }}</bm-button>
                            </div>
                        </ion-col>
                    </ion-row>
                </div>
                <div v-if="isBioAlreadyRegistered && props.isLogin" class="txt_center bio_place">
                    <ion-button class="btn_bio" :class="bioType === 'FACE_ID' ? 'btn_face' : 'btn_fingerprint'" @click="onBioAuth">
                        <span>{{ bioType === 'FACE_ID' ? $t('COM6000000.TEXT.FACE_ID') : $t('COM6000000.TEXT.FINGERPRINT') }}</span>
                    </ion-button>
                </div>
            </div>
        </bm-content>

        <bm-footer>
            <bm-button class="btn01" :disabled-button="disableBackButton" @click="onConfirm">{{ $t('COM6000000.BUTTON.CONFIRM') }}</bm-button>
        </bm-footer>

    </ion-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LoginModule from "@/modules/login-module";
import RouterServices from "@/services/router-services";
import { SharedDataStore } from "@/stores/shared-data";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger, BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { computed, onMounted, ref } from "vue";
import COM8000000 from "./COM8000000.vue";

const { t } = useI18n();

/**
 * Author: Monivoth
 * Component: COM6000000
 * Create on: 12/15/2025
 * Description: Password Verification
 * */

defineOptions({
    name: "COM6000000",
    description: "Password Verification"
});

const loginModule = LoginModule.getInstance();
const password = ref<string>("");
const routerServices = new RouterServices();
const isBioAlreadyRegistered = ref<boolean>(false);
const bioType = ref<string>("");
enum BiometricType {
	FINGERPRINT = "FINGERPRINT",
	FACE_ID = "FACE_ID",
	NONE = "NONE"
}

const disableBackButton = computed(() => {
    return password.value.length < 6;
});

const onForgetPassword = func( () => {
    DialogUtil.showModal(COM8000000);
});

const props = defineProps({
    mode: {
        type: String,
        default: ""
    },
    isLogin: {
        type: Boolean,
        default: true
    }
});

onMounted(() => {
    isBioAlreadyRegistered.value = JSON.parse(BizCheckMobileProperties.get("isBiometric") || "false");
    bioType.value = BizCheckMobileProperties.get("biometricType") || BiometricType.NONE;
    if (props.isLogin && isBioAlreadyRegistered.value) {
        loginModule.verifyBio({
            callback: () => {
                BizCheckMobileLogger.log("Biometric authentication successful");
                DialogUtil.closeModal({ role: "confirm" });
            }
        });
    }
});

const onVerifyPassword = func(() => {
    const userId = SharedDataStore().getUserInfo().userId;
    loginModule.verifyPassword({
        userId: userId,
        password: password.value,
        callback: () => {
            SharedDataStore().setItem("fromSetting", true);
            if (props.mode === "bio") {
                if (!isBioAlreadyRegistered.value) {
                    routerServices.push("/COM7000000", { autoCloseModal: false, allowSwipeBack: true });
                    setTimeout(() => {
                        DialogUtil.closeModal({ role: "confirm" });
                        password.value = "";
                    }, 500);
                    return;
                } else {
                    LoginModule.getInstance().unRegisterBio({
                        callback: () => {
                            DialogUtil.showAlert({
                                message: t("COM6000000.TEXT.BIO_UNREGISTERED"),
                                onDidDismiss: () => {
                                    DialogUtil.closeModal({ role: "confirm" });
                                    password.value = "";
                                },
                            });
                        }
                    });
                }
            }
            if (props.mode === "passwordChange") {
                routerServices.push("/LOG1200000", { autoCloseModal: false, allowSwipeBack: true });
                setTimeout(() => {
                    DialogUtil.closeModal({ role: "confirm" });
                    password.value = "";
                }, 500);

            }
        }
    });
});

const onPasswordInput = func((event: any) => {
    password.value = event.target.value;

});

const onPasswordFocus = func(() => {
	// eslint-disable-next-line no-restricted-globals
    document.querySelector(".formwrap01")?.classList.add("top-30");
});

const onPasswordBlur = func(() => {
	// eslint-disable-next-line no-restricted-globals
    document.querySelector(".formwrap01")?.classList.remove("top-30");
});

const onConfirm = func( () => {
    if ( props.isLogin ) {
        onSecondTimeLogin();
    } else {
        onVerifyPassword();
    }
});

const onSecondTimeLogin= () => {
    loginModule.secondLogin({
        password: password.value,
        callback: () => {
            BizCheckMobileLogger.log("Password verification successful");
            DialogUtil.closeModal({ role: "confirm" });
        }
    });
};

const onBioAuth = () => {
    loginModule.verifyBio({
        callback: () => {
            DialogUtil.closeModal({ role: "confirm" });
            BizCheckMobileLogger.log("Biometric authentication successful");
        }
    });
};
</script>

<style scoped lang="scss">
	.title { font-size: var(--font24); font-weight: 700; line-height: 140%; color: var(--fontColor01); }
	.desc { margin: 16px 0; font-size: var(--font14); font-weight: 400; line-height: 140%; color: var(--fontColor02);}



	ion-col {
		.btn_text { width: max-content; --border-radius: 0; font-size: var(--font12); font-weight: 500; line-height: 16px; min-height: 24px; --padding-start: 0; --padding-end: 0; --padding-top: 0; --padding-bottom: 0; text-decoration: underline; }
	}
	.btn_bio { position: relative; --background: transparent; height: 24px; min-height: 24px; --padding-bottom: 10px; --padding-start: 36px; color: var(--fontColor01); font-size: var(--font16); font-weight: 500; text-decoration: underline;
		&::before { content: ""; position: absolute; left: 0; top: calc(50% - 12px); width: 24px; height: 24px; background-repeat: no-repeat; background-position: center; background-size: contain;}
		&.btn_face::before { background: url("@/assets/images/ico_btn_face_id.svg") no-repeat left center;}
		&.btn_fingerprint::before { background: url("@/assets/images/ico_btn_fingerprint.svg") no-repeat left center;}
	}

    .formwrap01 { min-height: 106px;}
</style>
