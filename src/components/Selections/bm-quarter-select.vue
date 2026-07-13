<template>
    <!-- Label -->
    <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>

    <!-- Selectbox -->
    <div class="selectbox_wrapper" :class="[{ 'disabled': props.disabled, 'focus': isFocus, 'error': props.hasError }]">
        <span v-if="selectedQuarter" class="value">{{ selectedQuarter }}</span>
        <span v-if="!selectedQuarter" class="placeholder">{{ displayPlaceholder }}</span>
        <bm-button :disabled="props.disabled" @click="onClickSelectBox()">{{ t('COMMON.BM_QUARTER_SELECT.BUTTON_LABEL') }}</bm-button>
    </div>

    <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
        <slot name="info"></slot>
    </ion-label>
    <ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
        <slot name="error"></slot>
    </ion-label>
</template>

<script lang="ts" setup>
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { computed, ref, useSlots } from "vue";
import { useI18n } from "vue-i18n";
import BmQuarterPicker from "../Pickers/bm-quarter-picker.vue";
import LocalServices from "@/services/local-services";
const { t } = useI18n();
const translateService = new LocalServices();
interface Props {
    modelValue: string;
    placeholder?: string;
    title?: string;
    message?: string;
    disabled?: boolean;
    isFocus?: boolean;
    hasInfo?: boolean;
    hasError?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    placeholder: "",
    title: "",
    message: "",
    disabled: false,
    isFocus: false,
    hasInfo: false,
    hasError: false
});
const defaultMonthList = computed(() => [
    { key: "01", value: translateService.translate("COMMON.BM_QUARTER_PICKER.QUARTER_1") },
    { key: "02", value: translateService.translate("COMMON.BM_QUARTER_PICKER.QUARTER_2") },
    { key: "03", value: translateService.translate("COMMON.BM_QUARTER_PICKER.QUARTER_3") },
    { key: "04", value: translateService.translate("COMMON.BM_QUARTER_PICKER.QUARTER_4") }
]);

const emit = defineEmits(["update:modelValue", "selected"]);
const selectedQuarter = ref<string>(defaultMonthList.value.find((option: { key: string; value: string }) => option.key === props.modelValue)?.value ?? "01");
const currentYear = ref<string>(BizCheckMobileDateTime.getYear().toString());
const quarter = ref(props.modelValue || "01");
const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});

const displayPlaceholder = computed(() => props.placeholder || t("COMMON.BM_QUARTER_SELECT.PLACEHOLDER"));

const onClickSelectBox = func(() => {
    DialogUtil.showDialog(BmQuarterPicker, {
        props: {
            year: currentYear.value,
            quarter: quarter.value
        },
        onDidDismiss: (result: any) => {
            if (result && result.role === "confirm") {
                selectedQuarter.value = result.data.data.value;
                quarter.value = result.data.quarter;
                currentYear.value = result.data.year;
                emit("update:modelValue", result.data.quarter);
                emit("selected", result.data);
                BizCheckMobileLogger.log("onClickSelectBox => ", result.data);
            }
        },
    });
}, "onClickSelectBox");

</script>

<style scoped lang="scss">
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
.selectbox_wrapper { background-color: #FFFFFF; position: relative; height: 44px; font-size: var(--font14); font-weight: 500; line-height: 18px; display: flex; gap: 8px; align-items: center; justify-content: space-between; padding:  0 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #D9D9D9;
    .placeholder { color: var(--fontColor03);}
    ion-button { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background-size: 18px auto;; --border-radius: 0; --background-activated-opacity: 0; --background-focused-opacity: 0; --background-hover-opacity: 0;
        &::part(native) { background: transparent url("@/assets/images/select_arrow.svg") right 12px center no-repeat;}
    }
    &.disabled { background-color: #DDDDDD; color: var(--fontColor02);}
    &.focus { border-color: var(--ion-color-primary);}
    &.error { border-color: var(--ion-color-danger); background-color: rgba(255, 0, 0, 0.05);}
}

.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}


</style>
