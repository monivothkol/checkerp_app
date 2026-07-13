<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ displayTitle }}</ion-label>
        </div>
        <div class="modal_content">
            <div v-if="weekOfYears.length > 0 && yearList.length > 0" class="picker_wrapper">
                <!-- Month -->
                <div class="picker_col">
                    <ion-label class="lbl">Weeks</ion-label>
                    <bm-looping-scroll :key="`weeks-${selectedYear}`" :initial-value="selectedWeekTh" :items="weekOfYears" :enable-drag="true"
                        :box-height="50" :wrapper-width="80" :wrapper-height="180" @scroll-change="onScrollChangeWeek">
                        <template #item="{ item }">
                            {{ item.value }}
                        </template>
                    </bm-looping-scroll>
                </div>
                <!-- Year -->
                <div class="picker_col">
                    <ion-label class="lbl">{{ $t('COMMON.BM_MONTH_YEAR_PICKER.YEAR') }}</ion-label>
                    <bm-looping-scroll :initial-value="selectedYear" :items="yearList" :enable-drag="true"
                        :box-height="50" :wrapper-width="80" :wrapper-height="180" @scroll-change="onScrollChangeYear">
                        <template #item="{ item }">
                            {{ item.value }}
                        </template>
                    </bm-looping-scroll>
                </div>
            </div>
            <!-- Loading state -->
            <div v-else class="loading_container">
                <ion-label>Loading...</ion-label>
            </div>
        </div>
        <div class="modal_footer">
            <bm-button class="btn02" @click="onClickBtnNegative()"><span>{{ $t("COMMON.BUTTON.CLOSE")
                    }}</span></bm-button>
            <bm-button class="btn01" @click="onClickBtnPositive()"><span>{{ $t("COMMON.BUTTON.CONFIRM")
                    }}</span></bm-button>
        </div>
    </div>
</template>

<!-- eslint-disable @typescript-eslint/naming-convention -->
<script setup lang="ts">
import { PICKER_TYPE } from "@/enum/date-type-enum";
import LocalServices from "@/services/local-services";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { computed, onMounted, ref } from "vue";

const translateService = new LocalServices();
interface Props {
    title?: string,
    week?: string,
    year?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    week: "",
    year: ""
});

const displayTitle = computed(() => props.title || translateService.translate("COMMON.BM_WEEK_SELECT.TITLE"));

const weekOfYears = ref<Array<{ key: string, value: string }>>([]);
const yearList = ref<Array<{ key: string, value: string }>>([]);
const currentYear = BizCheckMobileDateTime.getYear().toString();
const selectedYear = ref(currentYear);
const selectedWeekTh = ref<{ key: string, value: string } | null>(null);
const weekTh = ref<string>("");

onMounted(() => {
    BizCheckMobileLogger.info("props => ", props, BizCheckMobileDateTime.getMonth());

    // First generate the year list
    generateYearList();

    // Set the selected year from props or use current year
    if (props.year) selectedYear.value = props.year;

    // Generate weeks for the selected year
    weekOfYears.value = generateWeeksOfYear(selectedYear.value, PICKER_TYPE.DisableFuture);

    // Initialize week selection
    if (props.week) {
        weekTh.value = props.week;
        // Initialize selectedWeekTh with the matching week object
        const matchingWeek = weekOfYears.value.find((week) => week.key === props.week);
        if (matchingWeek) {
            selectedWeekTh.value = matchingWeek;
        } else {
            // If provided week not found, default to current week
            setDefaultWeek();
        }
    } else {
        // If no week provided, default to current week
        setDefaultWeek();
    }
});

// Helper function to set default week (current week or closest available)
const setDefaultWeek = () => {
    if (weekOfYears.value.length === 0) return;

    const today = new Date();
    const currentYear = today.getFullYear();
    const isCurrentYear = +selectedYear.value === currentYear;

    let targetWeek = "1"; // Default to week 1 for non-current years

    if (isCurrentYear) {
        // For current year, try to use the actual current week
        targetWeek = getISOWeekNumber(today).toString();
    }

    // Try to find the target week
    const targetWeekItem = weekOfYears.value.find((week) => week.key === targetWeek);

    if (targetWeekItem) {
        selectedWeekTh.value = targetWeekItem;
        weekTh.value = targetWeekItem.key;
    } else {
        // If target week not found, find the closest available week
        let closestWeek = weekOfYears.value[0];
        let minDifference = Math.abs(parseInt(weekOfYears.value[0].key) - parseInt(targetWeek));

        for (const week of weekOfYears.value) {
            const difference = Math.abs(parseInt(week.key) - parseInt(targetWeek));
            if (difference < minDifference) {
                minDifference = difference;
                closestWeek = week;
            }
        }

        selectedWeekTh.value = closestWeek;
        weekTh.value = closestWeek.key;
    }
};

const generateWeeksOfYear = func((year: string, pickerType: PICKER_TYPE) => {
    const weeks: Array<{ key: string; value: string }> = [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const isCurrentYear = +year === currentYear;

    // Calculate current week dynamically based on the selected year
    let currentWeek = 0;
    if (isCurrentYear) {
        currentWeek = getISOWeekNumber(today);
    }

    // Find all weeks for this year by checking each week from 1 to 53
    for (let weekNum = 1; weekNum <= 53; weekNum++) {
        // Create a date for this week of the year
        const date = getDateFromISOWeek(+year, weekNum);

        // Check if this date actually belongs to the target year
        if (date.getFullYear() === +year) {
            // Only apply filtering for the current year
            if (isCurrentYear) {
                // For current year with DisableFuture: exclude future weeks (but include current week)
                if (pickerType === PICKER_TYPE.DisableFuture && weekNum > currentWeek) continue;

                // For current year with DisablePast: exclude past weeks
                if (pickerType === PICKER_TYPE.DisablePast && weekNum < currentWeek) continue;
            }

            // Add week with proper ordering
            weeks.push({ key: weekNum.toString(), value: `${weekNum}th` });
        }
    }

    return weeks;
}, "generateWeeksOfYear");

// Helper: Get date from ISO week number and year
function getDateFromISOWeek(year: number, week: number): Date {
    const date = new Date(year, 0, 4); // Start with Jan 4th (always in week 1)
    const dayOfWeek = date.getDay();
    const diff = ((dayOfWeek + 6) % 7); // Days to Thursday
    date.setDate(date.getDate() - diff + (week - 1) * 7);
    return date;
}

// Helper: ISO week number
function getISOWeekNumber(d: Date) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const generateYearList = func(() => {
    const yearRange = 50;

    yearList.value = Array.from({ length: yearRange + 1 }, (_, i) => ({
        key: `${+currentYear - yearRange + i}`,
        value: `${+currentYear - yearRange + i}`
    }));
    return;
}, "generateYearList");

const onScrollChangeWeek = func((index: number, item: { key: string, value: string }) => {
    BizCheckMobileLogger.info("onScrollChangeWeek", item);
    selectedWeekTh.value = item;
    weekTh.value = item.key; // Update weekTh to match the new selection
}, "onScrollChangeWeek");

const onScrollChangeYear = func((index: number, item: { key: string, value: string }) => {
    BizCheckMobileLogger.info("onScrollChangeYear =>", item);
    const previousSelectedWeek = weekTh.value;
    selectedYear.value = item.value;

    // Use different picker type based on selected year
    const currentYear = new Date().getFullYear();
    const pickerType = +selectedYear.value === currentYear ? PICKER_TYPE.DisableFuture : PICKER_TYPE.General;

    weekOfYears.value = generateWeeksOfYear(selectedYear.value, pickerType);

    // Find the best matching week in the new year
    const matchingWeek = weekOfYears.value.find((week) => week.key === previousSelectedWeek);

    if (matchingWeek) {
        // Keep the same week number if it exists in the new year
        selectedWeekTh.value = matchingWeek;
        weekTh.value = matchingWeek.key;
    } else if (weekOfYears.value.length > 0) {
        // Find the closest week to the previous selection
        const previousWeekNum = parseInt(previousSelectedWeek) || 0;
        let closestWeek = weekOfYears.value[0];
        let minDifference = Math.abs(parseInt(weekOfYears.value[0].key) - previousWeekNum);

        for (const week of weekOfYears.value) {
            const difference = Math.abs(parseInt(week.key) - previousWeekNum);
            if (difference < minDifference) {
                minDifference = difference;
                closestWeek = week;
            }
        }

        selectedWeekTh.value = closestWeek;
        weekTh.value = closestWeek.key;
    } else {
        // If no weeks available (edge case), set to null
        selectedWeekTh.value = null;
        weekTh.value = "";
    }

    BizCheckMobileLogger.info("weeks 1=> ", weekOfYears.value);
}, "onScrollChangeYear");

const onClickBtnNegative = func(() => {
    DialogUtil.closeDialog({ role: "cancel" });
}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {
    if (!selectedWeekTh.value) {
        // Fallback to current week if no week is selected
        setDefaultWeek();
    }
    DialogUtil.closeDialog({ role: "confirm", data: { weekTh: selectedWeekTh.value, year: selectedYear.value } });
}, "onClickBtnPositive");

</script>

<style scoped lang="scss">
.picker_wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.picker_col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.lbl {
    display: block;
    color: var(--fontColor02);
    font-size: var(--font14);
    font-weight: 600;
    line-height: 140%;
    text-align: center;
    margin-bottom: 8px;
}

.loading_container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 180px;
    color: var(--fontColor02);
    font-size: var(--font14);
}
</style>
