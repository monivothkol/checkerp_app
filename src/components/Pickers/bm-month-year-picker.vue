<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ displayTitle }}</ion-label>
        </div>
        <div class="modal_content">
            <div class="picker_wrapper">
                <!-- Month -->
                <div class="picker_col">
                <ion-label class="lbl">{{ $t('COMMON.BM_MONTH_YEAR_PICKER.MONTH') }}</ion-label>
                <bm-looping-scroll
                    :key="`month-${selectedYear}`"
                    :initial-value="selectedMonth"
                    :items="monthList"
                    :enable-drag="true"
                    :box-height="50"
                    :wrapper-width="80"
                    :wrapper-height="180"
                    @scroll-change="onScrollChangeMonth"
                >
                    <template #item="{ item }">
                        {{ item.value }}
                    </template>
                </bm-looping-scroll>
                </div>
                <!-- Year -->
                <div class="picker_col">
                <ion-label class="lbl">{{ $t('COMMON.BM_MONTH_YEAR_PICKER.YEAR') }}</ion-label>
                <bm-looping-scroll
                    :initial-value="selectedYear"
                    :items="yearList"
                    :enable-drag="true"
                    :box-height="50"
                    :wrapper-width="80"
                    :wrapper-height="180"
                    @scroll-change="onScrollChangeYear"
                >
                    <template #item="{ item }">
                        {{ item.value }}
                    </template>
                </bm-looping-scroll>
                </div>
            </div>
        </div>
        <div class="modal_footer">
            <bm-button class="btn02" @click="onClickBtnNegative()"><span>{{ $t("COMMON.BUTTON.CLOSE") }}</span></bm-button>
            <bm-button class="btn01" @click="onClickBtnPositive()"><span>{{ $t("COMMON.BUTTON.CONFIRM") }}</span></bm-button>
        </div>
    </div>
</template>

<!-- eslint-disable @typescript-eslint/naming-convention -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { PICKER_TYPE } from "@/enum/date-type-enum";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import DialogUtil from "@/utilities/dialog-util";
import LocalServices from "@/services/local-services";

const translateService = new LocalServices();
interface Props {
    title?: string,
    month?: string,
    year?: string,
	yearRange?: number,
    pickerType?: PICKER_TYPE
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    month: "",
    year: "",
    yearRange: 70,
    pickerType: PICKER_TYPE.General
});
BizCheckMobileLogger.info("props => ", props);
const defaultMonthList = ref<Array<{ key: string, value: string }>>([
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

const displayTitle = computed(() => props.title || translateService.translate("COMMON.BM_MONTHLY_SELECT.TITLE"));

const monthList = ref<Array<{ key: string, value: string }>>([]);
const yearList = ref<Array<{ key: string, value: string }>>([]);

const currentMonth = BizCheckMobileDateTime.getMonth().toString();
const currentYear = BizCheckMobileDateTime.getYear().toString();
const selectedMonth = ref(currentMonth);
const selectedYear = ref(currentYear);

onMounted(() => {
    if (props.month) selectedMonth.value = (props.month).toString().padStart(2, "0");
    if (props.year) selectedYear.value = props.year;

    // Use different picker type based on selected year
    const pickerType = +selectedYear.value === +currentYear ? props.pickerType : PICKER_TYPE.General;

    generateMonthList(pickerType, selectedYear.value);
    generateYearList(props.pickerType);
});

// method define block
const generateMonthList = func((type: PICKER_TYPE, year: string) => {

    let months = [...defaultMonthList.value];

    if (type === PICKER_TYPE.DisableFuture && year === currentYear) {
        months = months.filter(m => +m.key <= +currentMonth);
    }

    if (type === PICKER_TYPE.DisablePast && year === currentYear) {
        months = months.filter(m => +m.key >= +currentMonth);
    }

    monthList.value = months;

    // ensure selected month still valid only for current year with restrictions
    if (type !== PICKER_TYPE.General && !monthList.value.find(m => m.key === selectedMonth.value)) {
        // Select the closest available month if the selected month doesn't exist
        const selectedMonthNum = parseInt(selectedMonth.value) || 1;
        let closestMonth = monthList.value[0];
        let minDifference = Math.abs(parseInt(monthList.value[0].key) - selectedMonthNum);

        for (const month of monthList.value) {
            const difference = Math.abs(parseInt(month.key) - selectedMonthNum);
            if (difference < minDifference) {
                minDifference = difference;
                closestMonth = month;
            }
        }

        selectedMonth.value = closestMonth.key;
    }

}, "generateMonthList");

const generateYearList = func((type: PICKER_TYPE) => {
    const yearRange = props.yearRange;

    if (type === PICKER_TYPE.DisableFuture) {
        yearList.value = Array.from({ length: yearRange + 1 }, (_, i) => ({
            key: `${+currentYear - yearRange + i}`,
            value: `${+currentYear - yearRange + i}`
        }));
        return;
    }

    if (type === PICKER_TYPE.DisablePast) {
        yearList.value = Array.from({ length: yearRange + 1 }, (_, i) => ({
            key: `${+currentYear + i}`,
            value: `${+currentYear + i}`
        }));
        return;
    }

    yearList.value = Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
        key: `${+currentYear - yearRange + i}`,
        value: `${+currentYear - yearRange + i}`
    }));
}, "generateYearList");

const onScrollChangeMonth = func((index: number, item: { key: string, value: string }) => {
    BizCheckMobileLogger.info("onScrollChangeMonth", item);
    selectedMonth.value = item.key;
}, "onScrollChangeMonth");

const onScrollChangeYear = func((index: number, item: { key: string, value: string }) => {
    BizCheckMobileLogger.info("onScrollChangeYear =>", item);
    const previousSelectedMonth = selectedMonth.value;
    selectedYear.value = item.value;

    // Always use appropriate picker type based on selected year, regardless of props.pickerType
    const pickerType = +selectedYear.value === +currentYear ? PICKER_TYPE.DisableFuture : PICKER_TYPE.General;

    generateMonthList(pickerType, selectedYear.value);

    // Only change selected month if the current year doesn't have the selected month value
    const matchingMonth = monthList.value.find((month) => month.key === previousSelectedMonth);
    if (matchingMonth) {
        // Keep the same month if it exists in the new year
        selectedMonth.value = matchingMonth.key;
    } else if (monthList.value.length > 0) {
        // Select the closest available month if the previous month doesn't exist
        const previousMonthNum = parseInt(previousSelectedMonth) || 1;
        let closestMonth = monthList.value[0];
        let minDifference = Math.abs(parseInt(monthList.value[0].key) - previousMonthNum);

        for (const month of monthList.value) {
            const difference = Math.abs(parseInt(month.key) - previousMonthNum);
            if (difference < minDifference) {
                minDifference = difference;
                closestMonth = month;
            }
        }

        selectedMonth.value = closestMonth.key;
    } else {
        // Edge case: no months available
        selectedMonth.value = "";
    }
}, "onScrollChangeYear");

const onClickBtnNegative = func(() => {
    DialogUtil.closeDialog({ role: "cancel" });
}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {
    DialogUtil.closeDialog({ role: "confirm", data: { month: selectedMonth.value, year: selectedYear.value } });
}, "onClickBtnPositive");

</script>

<style scoped lang="scss">
.picker_wrapper { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; }
.picker_col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.lbl { display: block; color: var(--fontColor02); font-size: var(--font14); font-weight: 600; line-height: 140%; text-align: center; margin-bottom: 8px; }
</style>
