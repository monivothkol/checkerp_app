<template>
    <template v-if="component">
        <component :is="component" />
    </template>
    <div v-else class="modal_wrapper">
        <div class="modal_header"	>
            <ion-label>{{ title }}</ion-label>
        </div>
        <div class="modal_content">
            <span v-safe-html="message"></span>
        </div>
        <div class="modal_footer">
            <bm-button v-for="button in getFooterButtons()" :key="button.label" @click="onClickFooterButton(button.type)">{{ button.label }}</bm-button>
        </div>
    </div>

</template>

<script lang="ts" setup>
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import type { Component } from "vue";

interface Props {
    title: string;
    message: string;
    footerButtons: Array<{ label: string; type: "negative" | "positive" }>;
    component: Component | null;
}
const props = withDefaults(defineProps<Props>(), {
    title: "Notice",
    message: "This is a message",
    footerButtons: () => [ { label: "Close", type: "negative" } ],
    component: null
});

const getFooterButtons = func(() => {
    return props.footerButtons.map((button) => {
        return {
            label: button.label,
            type: button.type
        };
    });
}, "getFooterButtons");

const onClickFooterButton = func((type: "negative" | "positive") => {
    if (type === "negative") {
        DialogUtil.closeDialog({ role: "cancel" });
    } else {
        DialogUtil.closeDialog({ role: "confirm" });
    }
}, "onClickFooterButton");
</script>

<style scoped lang="scss">
.popup_wrapper { position: absolute; top: 50%; left: 50%; width: 100%; transform: translate(-50%, -50%); }
</style>
