<template>
    <div class="component_group">
        <ion-label class="lbl txt_ellipsis">
            <slot name="label"></slot>
        </ion-label>
        <div class="input_group">
            <div class="inp_date" :class="{ disabled: props.disabled, readonly: props.readonly }">
                <span v-if="fromDate || toDate" class="value">{{ fromDate ? dateFormat(fromDate) : "" }} <span v-if="toDate">~</span> {{ toDate ? dateFormat(toDate) : "" }}</span>
                <span class="placeholder txt_ellipsis">{{ $t('COMMON.BM_DATE_RANGE_SELECT.SELECT_DATE_RANGE') }}</span>
                <ion-button v-if="fromDate || toDate" class="btn_clear" @click="clearInput">{{ $t('COMMON.BM_DATE_RANGE_SELECT.CLEAR') }}</ion-button>
                <ion-button class="btn_date_picker" :disabled="props.disabled" @click="onClickDatePicker('fromDate')">{{ $t('COMMON.BM_DATE_RANGE_SELECT.DATE_PICKER') }}</ion-button>
            </div>
        </div>
        <ion-label class="lbl_note">
            <slot name="info"></slot>
        </ion-label>
        <ion-label class="lbl_error">
            <slot name="error"></slot>
        </ion-label>
    </div>
</template>

<script setup lang="ts">
import { BizCheckMobileDateTime, BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { onMounted } from "vue";
import BmDatePicker from "../Pickers/bm-date-picker.vue";
import DialogUtil from "@/utilities/dialog-util";
import { PICKER_TYPE } from "@/enum/date-type-enum";
import { func } from "@/utilities/func";

defineOptions ({
    name: "BMDateRangeSelection",
    description: "Date Range Selection",
});

interface Props {
    disabled?: boolean,
    readonly?: boolean,
    hasInfo?: boolean,
    hasError?: boolean,
    label?: string,
    info?: string,
    error?: string,
    modelValue: any,
    isDefaultDate: boolean,
    yearRange?: number
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    readonly: false,
    hasInfo: false,
    hasError: false,
    label: "",
    info: "",
    error: "",
    modelValue: {},
    isDefaultDate: true,
    yearRange: 70
});

const fromDate = defineModel<string | null>("fromDate", { required: false });
const toDate = defineModel<string | null>("toDate", { required: false });
const emit = defineEmits(["update:modelValue"]);

// Set default date range: 1 week ago to today
onMounted(() => {
    if (props.isDefaultDate && (!fromDate.value || !toDate.value)) {
        const today = BizCheckMobileDateTime.getCurrentDate();
        const oneWeekAgo = BizCheckMobileDateTime.subtractDays(today, 7);
        if (!fromDate.value) {
            fromDate.value = oneWeekAgo;
        }
        if (!toDate.value) {
            toDate.value = today;
        }
    }
});

const onClickDatePicker = (selectOn: "fromDate" | "toDate") => {
    BizCheckMobileLogger.log("onClickDatePicker", selectOn, fromDate.value, toDate.value);
    DialogUtil.showDialog(BmDatePicker,{
        props: {
            selectedRange: {
                fromDate: fromDate.value || "",
                toDate: toDate.value || ""
            },
            selectOn: selectOn,
            calendarType: PICKER_TYPE.General,
            usingAs: "dateRange",
            yearRange: props.yearRange
        },
        onDidDismiss: (result: any) => {
            if (result.role === "apply" && result.data) {
                fromDate.value = result.data.datePicker.fromDate;
                toDate.value = result.data.datePicker.toDate;
                emit("update:modelValue", result.data.datePicker);
            }
        },
    });
};

const clearInput = () => {
    fromDate.value = null;
    toDate.value = null;
    emit("update:modelValue", { fromDate: null, toDate: null });
};

const dateFormat = func( (date: string) => {
    return BizCheckMobileString.dateFormat(date);
});

</script>

<style scoped lang="scss">
.input_group { display: flex; flex-direction: row; gap: 8px; align-items: center;}
.lbl { display: block; color: var(--fontColor02); font-size: var(--font12); font-weight: 600; line-height: 140%; margin-bottom: 4px;
    &:empty { display: none;}
}
.inp_date { position: relative; height: 44px; display: flex; align-items: center; background-color: #FFFFFF; padding:  0 30px 0 12px; border-radius: var(--radius8); --border-width: 0; border: 1px solid #DDDDDD; flex: 1;
    .placeholder { display: block; font-size: var(--font14); font-weight: 500; line-height: 18px; color: #999999;  }
    .value { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #000000;
        &::empty { display: none;}
    }
    .value:not(:empty) + .placeholder { display: none;}
    .btn_date_picker { position: absolute; left: 0; width: 100%; margin-left: auto; text-indent: -9999rem; min-height: 24px; --background-activated: transparent; --background: transparent; background: transparent url("@/assets/images/ico_btn_calendar.svg") no-repeat right 10px center; background-size: 18px auto; --border-radius: 0;}
    &.disabled { background-color: #DDDDDD;
        .value { color: var(--fontColor03);}
        .btn_date_picker { background-image: url("@/assets/images/ico_btn_calendar_disabled.svg"); }
        .btn_clear { display: none;}
    }
    &.readonly { background-color: #DDDDDD; color: var(--fontColor01);
        .btn_clear { display: none;}
    }
}
.lbl_note { display: block; color: var(--fontColor03); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
.lbl_error { display: block; color: var(--ion-color-danger); font-size: var(--font12); font-weight: 500; line-height: 140%; margin-top: 4px;
    &:empty { display: none;}
}
.btn_clear { margin-left: auto; z-index: 99999; width: 30px; height: 30px; --background: transparent; text-indent: -9999rem; background: url("@/assets/images/ico_btn_clear_input.svg") center no-repeat;}
</style>
