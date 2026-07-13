<template>
    <!-- Label -->
    <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>

    <!-- Selectbox -->
    <div class="selectbox_wrapper" :class="[{ 'disabled': props.disabled, 'focus': isFocus,  'required': props.required , 'error': errorMessage !== ''}]">
        <span v-if="selectedOption.label" class="value">{{ selectedOption.label }}</span>
        <span v-if="!selectedOption.label" class="placeholder">{{ displayPlaceholder }}</span>
        <ion-button v-if="selectedOption.label && !props.disabled" class="btn_clear" :aria-label="t('COMMON.BM_SELECT_BOX.CLEAR')" @click="clearInput">{{ t('COMMON.BM_SELECT_BOX.CLEAR') }}</ion-button>
		<bm-button :disabled="props.disabled" @click="onClickSelectBox()">{{ t('COMMON.BM_SELECT_BOX.BUTTON_LABEL') }}</bm-button>
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
import { computed, ref, useSlots, watch } from "vue";
import { useI18n } from "vue-i18n";
import BmSelectMenu from "../Modals/bm-select-menu.vue";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";

const { t } = useI18n();

interface Props {
    modelValue: string;
    options: { label: string, value: string }[];
    placeholder?: string;
    title?: string;
    message?: string;
    disabled?: boolean;
    isFooter?: boolean;
    isFocus?: boolean;
    hasInfo?: boolean;
    hasError?: boolean;
	required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: "",
    options: () => [],
    placeholder: "",
    title: "",
    message: "",
    disabled: false,
    isFooter: false,
    isFocus: false,
    hasInfo: false,
    hasError: false,
    required: false
});

const emit = defineEmits(["update:modelValue", "selected"]);

const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});
const errorMessage = ref<string>("");
const displayPlaceholder = computed(() => props.placeholder || t("COMMON.BM_SELECT_BOX.PLACEHOLDER"));
const displayTitle = computed(() => props.title || t("COMMON.BM_SELECT_BOX.TITLE"));
const displayMessage = computed(() => props.message || t("COMMON.BM_SELECT_BOX.MESSAGE"));

const selectedOption = ref(
	{ label: props.options.find((option: any) => option.value === props.modelValue)?.label || "", value: props.modelValue}
);

watch(() => props.options, (newOptions) => {
    const foundOption = newOptions.find((option: any) => option.value === props.modelValue);
    if (foundOption) {
        selectedOption.value = { label: foundOption.label, value: foundOption.value };
    } else {
        selectedOption.value = { label: "", value: "" };
    }
}, { immediate: true, deep: true });

watch(() => props.modelValue, (newValue) => {
    const foundOption = props.options.find((option: any) => option.value === newValue);
    if (foundOption) {
        selectedOption.value = { label: foundOption.label, value: foundOption.value };
    } else {
        selectedOption.value = { label: "", value: "" };
    }
}, { immediate: true });

const onClickSelectBox = func(() => {
    DialogUtil.showDialog(BmSelectMenu, {
        props: {
            disabled: props.disabled,
            title: displayTitle.value,
            message: !isCombobox.value ? displayMessage.value : "",
            searchable: isCombobox.value,
            options: props.options,
            selected: selectedOption.value.value,
            isFocus: props.isFocus,
            isFooter: props.isFooter,
        },
        onDidDismiss: (result: any) => {
            if (result && result.role === "confirm") {
				BizCheckMobileLogger.log("bm-select-box==== ", result.data?.option);
                selectedOption.value = result.data?.option;
                emit("update:modelValue", selectedOption.value.value);
                emit("selected", selectedOption.value);
				const error = validateSelectBox(selectedOption.value.value);
				errorMessage.value = error;
            }
        },
    });
}, "onClickSelectBox");

const validateSelectBox = (value: string): string => {
    if (props.required && !value) {
        return "This field is required";
    }
    return "";
};

watch(props.modelValue, (newVal: any) => {
    if(newVal) {
        selectedOption.value = props.options.find((option: any) => option.value === newVal) || { label: "", value: "" };
    } else {
        selectedOption.value = { label: "", value: "" };
    }
	emit("update:modelValue", selectedOption.value.value);
	emit("selected", selectedOption.value);
	const error = validateSelectBox(selectedOption.value.value);
    errorMessage.value = error;
});

//check if component is being display as combobox or dropdown menu
// combobox has no message and has search function
// dropdown menu has message and no search function
const isCombobox = computed(() => {
    return props.options.length > 10;
});

const clearInput = func(() => {
    selectedOption.value = { label: "", value: "" };
    emit("update:modelValue", "");
    emit("selected", { label: "", value: "" });
	const error = validateSelectBox(selectedOption.value.value);
    errorMessage.value = error;
});

</script>

<style scoped lang="scss">
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
.selectbox_wrapper { background-color: #FFFFFF; position: relative; height: 44px; font-size: var(--font14); font-weight: 500; line-height: 18px; display: flex; gap: 8px; align-items: center; justify-content: space-between; padding:  0 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #D9D9D9;
    .placeholder { color: var(--fontColor03);}
	.btn_clear { margin-left: auto; margin-right: 15px; z-index: 99999; width: 30px; height: 30px; --background: transparent; text-indent: -9999rem; background: url("@/assets/images/ico_btn_clear_input.svg") center no-repeat;}

	ion-button:not(.btn_clear) { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background-size: 18px auto;; --border-radius: 0; --background-activated-opacity: 0; --background-focused-opacity: 0; --background-hover-opacity: 0;
        &::part(native) { background: transparent url("@/assets/images/select_arrow.svg") right 12px center no-repeat;}
    }
    &.disabled { background-color: #DDDDDD; color: var(--fontColor02);}
    &.focus { border-color: var(--ion-color-primary);}
    &.error { border-color: var(--ion-color-danger) !important; }
	&.required { border-color: var(--ion-color-primary);}
}

.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}
.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;}


</style>
