<template>
    <ion-label class="lbl txt_ellipsis">
        <slot name="label"></slot>
    </ion-label>
    <div class="inp_date" :class="{ disabled: props.disabled, readonly: props.readonly, error: props.hasError || errorMessage !== '', required: props.required }">
        <span class="value">{{ dateFormat(date) }}</span>
        <span class="placeholder">{{ props.placeholder }}</span>
        <ion-button v-if="date && !props.readonly" class="btn_clear" @click="clearInput">Clear</ion-button>
        <ion-button class="btn_date_picker" :disabled="props.disabled" @click="onClickDatePicker()">Date Picker</ion-button>
    </div>
    <ion-label v-if="props.hasInfo !== undefined && props.hasInfo" class="lbl_note">
        <slot name="info"></slot>
    </ion-label>
    <ion-label v-if="props.hasError !== undefined && props.hasError" class="lbl_error">
        <slot name="error"></slot>
    </ion-label>
</template>

<script setup lang="ts">
import { PICKER_TYPE } from "@/enum/date-type-enum";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { onMounted, ref, watch } from "vue";
import BmDatePicker from "../Pickers/bm-date-picker.vue";

defineOptions ({
	name: "BMDateSelection",
	description: "Date Selection",
});

interface Props {
    disabled?: boolean,
    readonly?: boolean,
    hasInfo?: boolean,
    hasError?: boolean,
    modelValue: string;
    placeholder?: string;
    required?: boolean;
    yearRange?: number;
    calendarType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    readonly: false,
    hasInfo: false,
    hasError: false,
    modelValue: "",
    placeholder: "Select Date",
    required: false,
    yearRange: 70,
    calendarType: PICKER_TYPE.General
});

const date = ref<string>("");
const errorMessage = ref<string>("");
const emit = defineEmits(["update:modelValue"]);


watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        date.value = props.modelValue;
	    emit("update:modelValue", date.value);
    }
}, { immediate: true });

if ( props.modelValue && props.modelValue !== "" ) {
    date.value = props.modelValue;
	emit("update:modelValue", date.value);
}

const onClickDatePicker = () => {
    BizCheckMobileLogger.info("date.value", date.value);
    DialogUtil.showDialog(BmDatePicker,{
        props: {
            calendarType: props.calendarType,
            usingAs: "date",
            selectedDate: date.value,
            yearRange: props.yearRange
        },
        onDidDismiss: (result: any) => {
            if (result.role === "apply" && result.data) {
                date.value = result.data.datePicker;
                emit("update:modelValue", date.value);
            }
        },
    });
};

onMounted(() => { //emit default date (current date)
	emit("update:modelValue", date.value);
});

const clearInput = () => {
    date.value = "";
};

const dateFormat = func( (value: string) => {
    if (!value?.trim()) {
        return "";
    }
    return BizCheckMobileString.dateFormat(value);
});

</script>

<style scoped lang="scss">
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;}
.inp_date { position: relative; height: 44px; display: flex; gap: 8px; align-items: center; justify-content: space-between; background-color: #FFFFFF; padding: 0 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #DDDDDD; padding-right: 30px;
    .placeholder { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #999999;}
    .value { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #000000;
        &:empty { display: none;}
    }
    .value:not(:empty) + .placeholder { display: none;}
    .btn_date_picker { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background: transparent url("@/assets/images/ico_btn_calendar.svg") no-repeat right 10px center; background-size: 18px auto; --border-radius: 0;}
    &.disabled { background-color: #DDDDDD;
        .value { color: var(--fontColor03);}
        .btn_date_picker { background-image: url("@/assets/images/ico_btn_calendar_disabled.svg"); }
        .btn_clear { display: none;}
    }
    &.readonly { background-color: #DDDDDD; color: var(--fontColor01);}
    &.required { border-color: var(--ion-color-primary);}
    &.error { border-color: var(--ion-color-danger);}

}
.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
.btn_clear { margin-left: auto; z-index: 99999; width: 30px; height: 30px; --background: transparent; text-indent: -9999rem; background: url("@/assets/images/ico_btn_clear_input.svg") center no-repeat;}
</style>
