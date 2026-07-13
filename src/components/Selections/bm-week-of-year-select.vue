<template>
    <!-- Label -->
    <ion-label v-if="slots.label !== undefined" class="lbl txt_ellipsis" :class="labelClass">
        <slot name="label"></slot>
    </ion-label>

    <!-- Selectbox -->
    <div class="selectbox_wrapper" :class="[{ 'disabled': props.disabled, 'focus': isFocus, 'error': props.hasError }]">
        <span v-if="displaySelectedWeek" class="value">{{ displaySelectedWeek }}</span>
        <span v-if="!displaySelectedWeek" class="placeholder">{{ displayPlaceholder }}</span>
        <bm-button :disabled="props.disabled" @click="onClickSelectBox()">Please Week of year</bm-button>
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
import { computed, onMounted, ref, useSlots } from "vue";
import BmWeekOfYear from "../Pickers/bm-week-of-year.vue";
import { PICKER_TYPE } from "@/enum/date-type-enum";

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
const selectedWeek = ref<{ key: string, value: string }>({key: "", value: ""});
const weekOfYears = ref<Array<{ key: string, value: string }>>([]);
const currentYear = BizCheckMobileDateTime.getYear().toString();
const selectedYear = ref(currentYear);
const displaySelectedWeek = ref<string>("");

const slots = useSlots();

const labelClass = computed(() => {
    return slots?.error !== undefined ? "error" : "";
});

onMounted( () => {
    weekOfYears.value = generateWeeksOfYear(selectedYear.value, PICKER_TYPE.DisableFuture);
    BizCheckMobileLogger.info("weeks => ", weekOfYears.value);
    if (props.modelValue && props.modelValue !== "") {
        BizCheckMobileLogger.info("selectedWeek 1 => ", selectedWeek.value, props.modelValue);
        selectedWeek.value = weekOfYears.value.filter( (item) => item.key === props.modelValue)[0];
    } else {
        const today = new Date();
        const currentWeek = getISOWeekNumber(today);
        BizCheckMobileLogger.info("selectedWeek 2 => ", selectedWeek.value, currentWeek, currentWeek - 1);
        selectedWeek.value = weekOfYears.value.filter( (item) => item.key === ( currentWeek - 1).toString())[0];
    }
     displaySelectedWeek.value = ` ${selectedWeek.value.value} ${selectedYear.value}`;
    emit("update:modelValue", selectedWeek.value.key);
    emit("selected", {week: selectedWeek.value.key, year: selectedYear.value});
});

const generateWeeksOfYear = func((year: string, pickerType: PICKER_TYPE) => {
    const weeks: Array<{ key: string; value: string }> = [];
    const today = new Date();
    const currentWeek = getISOWeekNumber(today);

    // Start from Jan 1 of the year
    let date = new Date(+year, 0, 1);

    while (date.getFullYear() === +year) {
        const weekNumber = getISOWeekNumber(date);

        // Exclude current week
        if (weekNumber >= currentWeek) {
            if (pickerType === PICKER_TYPE.DisableFuture) break; // stop at current week
        }

        if (pickerType === PICKER_TYPE.DisablePast && weekNumber < currentWeek) {
            date.setDate(date.getDate() + 7);
            continue; // skip past weeks
        }

        // Add week only if not already in array
        if (!weeks.find(w => w.key === weekNumber.toString())) {
            weeks.push({ key: weekNumber.toString(), value: `${weekNumber}th` });
        }

        // Move to next week
        date.setDate(date.getDate() + 7);
    }

    return weeks;
}, "generateWeeksOfYear");

// Helper: ISO week number
function getISOWeekNumber(d: Date) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const displayPlaceholder = computed(() => props.placeholder || "Please select week of year");

const onClickSelectBox = func(() => {
    DialogUtil.showDialog(BmWeekOfYear, {
        props: {
            year: selectedYear.value,
            week: selectedWeek.value.key
        },
        onDidDismiss: (result: any) => {
            if (result && result.role === "confirm") {
                selectedWeek.value = result.data.weekTh;
                selectedYear.value = result.data.year;
                displaySelectedWeek.value =  `${selectedWeek.value.value} ${selectedYear.value}`;
                emit("update:modelValue", result.data.weekTh.key);
                emit("selected", {week: result.data.weekTh.key, year: result.data.year});
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
