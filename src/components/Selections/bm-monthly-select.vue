<template>
    <!-- Label -->
    <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>

    <!-- Selectbox -->
    <div class="selectbox_wrapper" :class="[{ 'disabled': props.disabled, 'focus': isFocus, 'error': props.hasError }]">
        <span v-if="selectedOption" class="value">{{ selectedOption }}</span>
        <span v-if="!selectedOption" class="placeholder">{{ displayPlaceholder }}</span>
        <bm-button :disabled="props.disabled" @click="onClickSelectBox()">{{ $t('COMMON.BM_MONTHLY_SELECT.BUTTON_LABEL') }}</bm-button>
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
import { computed, onMounted, ref, useSlots, watch } from "vue";
import BmMonthYearPicker from "../Pickers/bm-month-year-picker.vue";
import LocalServices from "@/services/local-services";
import { BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { PICKER_TYPE } from "@/enum/date-type-enum";
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

const emit = defineEmits(["update:modelValue", "selected"]);

const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});

const displayPlaceholder = computed(() => props.placeholder || translateService.translate("COMMON.BM_MONTHLY_SELECT.PLACEHOLDER"));
const displayTitle = computed(() => props.title || translateService.translate("COMMON.BM_MONTHLY_SELECT.TITLE"));

const defaultMonthList = computed<Array<{ key: string, value: string }>>(() => [
    { key: "01", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_01") },
    { key: "02", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_02") },
    { key: "03", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_03") },
    { key: "04", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_04") },
    { key: "05", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_05") },
    { key: "06", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_06") },
    { key: "07", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_07") },
    { key: "08", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_08") },
    { key: "09", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_09") },
    { key: "10", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_10") },
    { key: "11", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_11") },
    { key: "12", value: translateService.translate("COMMON.BM_MONTHLY_SELECT.MONTH_12") },
]);

const selectedYear= ref<string>(BizCheckMobileDateTime.getYear().toString());
const selectedMonth = ref<string>(BizCheckMobileDateTime.getMonth().toString());

const selectedOption = computed(() => {
    if (!props.modelValue) return "";
    const monthOption = defaultMonthList.value.find((option: { key: string; value: string }) => option.key === props.modelValue);
    return monthOption ? `${monthOption.value} ${selectedYear.value}` : "";
});

onMounted( () => {
    selectedMonth.value = props.modelValue;
});

watch(() => props.modelValue, () => {
    // selectedOption is now computed, no need to manually update it
}, { immediate: true });

const onClickSelectBox = func(() => {
    DialogUtil.showDialog(BmMonthYearPicker, {
        props: {
            disabled: props.disabled,
            title: displayTitle.value,
            month: selectedMonth.value,
            year: selectedYear.value,
            pickerType: PICKER_TYPE.DisableFuture
        },
        onDidDismiss: (result: any) => {
            BizCheckMobileLogger.info("onClickSelectBox => ", result);
            if (result && result.role === "confirm") {
                selectedMonth.value = result.data.month;
                selectedYear.value = result.data.year;
                emit("update:modelValue", result.data.month);
                emit("selected", result.data);
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
