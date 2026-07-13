<template>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-buttons v-if="props.backButton" slot="start" @click="onClickBack">
                <bm-button :class="{'btn_head_back': props.backButton}"></bm-button>
            </ion-buttons>
            <ion-title v-if="props.title !== ''">{{ props.title }}</ion-title>
            <ion-buttons v-if="props.cancelButton || $slots.btnEnd" slot="end">
                <slot name="btnEnd"></slot>
                <bm-button v-if="props.cancelButton" class="btn_head_txt" text="Cancel" @click="onClickCancel"></bm-button>
            </ion-buttons>
            <slot name="custom"></slot>
        </ion-toolbar>
    </ion-header>
</template>
<script setup lang="ts">
import RouterServices from "@/services/router-services";
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileApp, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { onMounted } from "vue";
const routerService = new RouterServices();
const props = defineProps({
    title: {
        type: String,
        required: false,
        default: ""
    },
    backButton: {
        type: Boolean,
        required: false,
        default: true
    },
    cancelButton: {
        type: Boolean,
        required: false,
        default: false
    },
    showConnectionIndicator: {
        type: Boolean,
        required: false,
        default: false
    },
    iconButton: {
        type: String,
        required: false,
        default: ""
    }
});
const emit = defineEmits(["onClickedBack", "onClickedCancel", "onClickIcon"]);

const onClickBack = () => {
    emit("onClickedBack");

    if (DialogUtil.isModalOpen) {
        DialogUtil.closeModal({ role: "cancel" });
    } else if (!RouterServices.isBackToRoot) {
        routerService.backToRoot();
    } else {
        if (RouterServices.getHistory().length > 0) {
            routerService.back();
        } else {
            routerService.backToRoot();
        }
    }
};

const onClickCancel = () => {
    emit("onClickedCancel");
    if (DialogUtil.isModalOpen) {
        DialogUtil.closeModal();
    } else {
        routerService.backToRoot();
    }
};
onMounted( () => {
    BizCheckMobileLogger.info("on Mount....");
    BizCheckMobileApp.callPlugin({
        pluginKey: "STATUS_BAR_PLUGIN",
        params: {
            header: {
                result: false,
                error_code: "",
                error_message: ""
            },
            body: {
                appearance: "light",
                background_color_string: "#00000000"
            }
        }
    });
});
</script>
<style lang="scss" scoped>
.btn_head_back { width: 48px; height: 48px; --background: transparent; background: url("@/assets/images/ico_btn_head_back.svg") left center no-repeat !important; text-indent: -9999rem;}
ion-header {
    ion-toolbar { --min-height: calc(56px + var(--safeArea));
        &:has(ion-searchbar) { border-bottom: 2px solid var(--colorPrimary); }
        >ion-title { font-size: var(--font16); font-weight: 600; color: var(--fontColor02); text-align: left; padding-inline-start: 52px; 
            &:first-child { padding-inline-start: 16px; } 
            &:empty { display: none; } }
        }
}
</style>
