<template>
    <!-- Label -->
    <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>

    <!-- Selectbox -->
    <div class="selectbox_wrapper" :class="[{ 'disabled': props.disabled, 'focus': isFocus, 'error': props.hasError }]">
        <span v-if="selectedSemester" class="value">{{ selectedSemester }}</span>
        <span v-if="!selectedSemester" class="placeholder">{{ displayPlaceholder }}</span>
        <bm-button :disabled="props.disabled" @click="onClickSelectBox()">{{ t('COMMON.BM_SEMESTER_SELECT.BUTTON_LABEL') }}</bm-button>
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
import { computed, ref, useSlots } from "vue";
import { useI18n } from "vue-i18n";
import BmSemesterPicker from "../Pickers/bm-semester-picker.vue";
import { BizCheckMobileDateTime } from "@/shared/bizcheckmobile";
import LocalServices from "@/services/local-services";
const translateService = new LocalServices();
const { t } = useI18n();

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

const defaultMonthList = computed<Array<{ key: string, value: string }>>(() => [
    { key: "01", value: translateService.translate("COMMON.BM_SEMESTER_PICKER.SEMESTER_1") },
    { key: "02", value: translateService.translate("COMMON.BM_SEMESTER_PICKER.SEMESTER_2") }
]);

const emit = defineEmits(["update:modelValue", "selected"]);

const selectedSemester = ref<string>(defaultMonthList.value.find((option: { key: string; value: string }) => option.key === props.modelValue)?.value ?? "01");
const currentYear = ref<string>(BizCheckMobileDateTime.getYear().toString());
const semester = ref(props.modelValue || "01");

const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});

const displayPlaceholder = computed(() => props.placeholder || t("COMMON.BM_SEMESTER_SELECT.PLACEHOLDER"));

const onClickSelectBox = func(() => {
    DialogUtil.showDialog(BmSemesterPicker, {
        props: {
            year: currentYear.value,
            semester: semester.value
        },
        onDidDismiss: (result: any) => {
            if (result && result.role === "confirm") {
                selectedSemester.value = result.data.data.value;
                semester.value = result.data.semester;
                currentYear.value = result.data.year;
                emit("update:modelValue", result.data.semester);
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
