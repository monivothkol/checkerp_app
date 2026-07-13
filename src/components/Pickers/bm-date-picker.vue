<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <div class="calendar_header">
                <span class="select_month" @click="onMonthYearPicker">{{ getMonthYearLabel }}</span>
            </div>
            <ion-buttons slot="end">
                <bm-button class="btn_today" @click="onClickHeaderBtn">
                    <span>{{ props.headerBtn.label }}</span>
                </bm-button>
                <bm-button class="btn_previous" :disabled="isDisabledBtnPrevMonth" @click="triggerPrevMonth">&lt;</bm-button>
                <bm-button class="btn_next" :disabled="isDisabledBtnNextMonth" @click="triggerNextMonth">&gt;</bm-button>
            </ion-buttons>
        </div>
        <div class="modal_content">
            <ion-list>
                <div class="calendar_container">
                    <!-- Weekday headers -->
                    <ion-grid class="day_list">
                        <ion-row>
                            <ion-col v-for="(day, index) in daysLabel" :key="day.key">
                                <div :class="{ weekend: index === 0 }">{{ day.value }}</div>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <!-- Calendar days container with swipe -->
                    <div class="calendar_days_container" :style="calendarDaysContainerStyle">
                        <div ref="wrapperRef"
                        class="calendar_days_wrapper" :style="{
                            transform: slideDirection === 'next' ? 'translateX(-66.666%)' : slideDirection === 'prev' ? 'translateX(0%)' : `translateX(calc(-33.333% + ${swipeOffset}px))`,
                            transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }"
                        @touchstart="onTouchStart"
                        @touchmove="onTouchMove"
                        @touchend="onTouchEnd"
                        >
                            <!-- Previous month days -->
                            <div class="calendar_month_card">
                                <ion-grid>
                                    <ion-row v-for="(daysCol, colIndex) in prevMonthDayList" :key="`prev-${colIndex}`">
                                        <ion-col v-for="(dayRow, rowIndex) in daysCol" :key="`prev-${rowIndex}`">
                                            <div class="day"
                                            :class="[
                                                    isDisabledDate(dayRow),
                                                    isPrevMonth(dayRow),
                                                    isNextMonth(dayRow),
                                                    isWeekend(rowIndex, dayRow),
                                                    isToday(dayRow),
                                                    isSelectedDay(dayRow),
                                                    isSelectedRangeFromDate(dayRow),
                                                    isSelectedRange(rowIndex, dayRow),
                                                    isSelectedRangeToDate(dayRow),
                                                ]"
                                            >{{ dayRow.day }}</div>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </div>

                            <!-- Current month days -->
                            <div class="calendar_month_card">
                                <ion-grid>
                                    <ion-row v-for="(daysCol, colIndex) in dayList" :key="colIndex">
                                        <ion-col v-for="(dayRow, rowIndex) in daysCol" :key="rowIndex">
                                            <div class="day"
                                                :class="[
                                                    isDisabledDate(dayRow),
                                                    isPrevMonth(dayRow),
                                                    isNextMonth(dayRow),
                                                    isWeekend(rowIndex, dayRow),
                                                    isToday(dayRow),
                                                    isSelectedDay(dayRow),
                                                    isSelectedRangeFromDate(dayRow),
                                                    isSelectedRange(rowIndex, dayRow),
                                                    isSelectedRangeToDate(dayRow),
                                                ]"
                                                @click="onClickDay(dayRow)"
                                            >
                                                {{ dayRow.day }}
                                                <span v-if="isFromDateLabel(dayRow)" class="range_label">{{ $t('COMMON.BM_DATE_PICKER.FROM') }}</span>
                                                <span v-if="isToDateLabel(dayRow)" class="range_label">{{ $t('COMMON.BM_DATE_PICKER.TO') }}</span>
                                            </div>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </div>

                            <!-- Next month days -->
                            <div class="calendar_month_card">
                                <ion-grid>
                                    <ion-row v-for="(daysCol, colIndex) in nextMonthDayList" :key="`next-${colIndex}`">
                                        <ion-col v-for="(dayRow, rowIndex) in daysCol" :key="`next-${rowIndex}`">
                                            <div class="day"
                                            :class="[
                                                    isDisabledDate(dayRow),
                                                    isPrevMonth(dayRow),
                                                    isNextMonth(dayRow),
                                                    isWeekend(rowIndex, dayRow),
                                                    isToday(dayRow),
                                                    isSelectedDay(dayRow),
                                                    isSelectedRangeFromDate(dayRow),
                                                    isSelectedRange(rowIndex, dayRow),
                                                    isSelectedRangeToDate(dayRow),
                                                ]"
                                            >{{ dayRow.day }}</div>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </div>
                        </div>
                    </div>
                </div>
            </ion-list>
        </div>
        <div class="modal_footer">
            <bm-button class="btn02" @click="onClickBtnNegative"><span>{{ negativeButton.label }}</span></bm-button>
            <bm-button :disabled-button="isDisableBtnPositive" class="btn01" @click="onClickBtnPositive()"><span>{{ positiveButton.label }}</span></bm-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PICKER_TYPE } from "@/enum/date-type-enum";
import { IDay } from "@/interfaces/COMMON/date-picker";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime, BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";
import { computed, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import BmMonthYearPicker from "./bm-month-year-picker.vue";
import { useI18n } from "vue-i18n";
import LocalServices from "@/services/local-services";

defineOptions({
    name: "BMDatePicker",
    description: "Date Picker"
});

//// props declaration
const props = defineProps({
    selectedDate: {
        type: String,
        required: false,
        default: ""
    },
    selectedRange: {
        type: Object as PropType<{ fromDate: string, toDate: string }>,
        required: false,
        default: () => ({ fromDate: "", toDate: "" })
    },
    selectOn: {
        type: String as PropType<"fromDate" | "toDate">,
        required: false,
        default: "toDate"
    },
    usingAs: {
        type: String as PropType<"date" | "dateRange">,
        required: false,
        default: "date"
    },
    calendarType: {
        type: String as PropType<string>,
        required: false,
        default: "general",
    },
    title: {
        type: String,
        required: false,
        default: "Select Date"
    },
    disabledDates: {
        type: Array as PropType<Array<string>>,
        required: false,
        default: new Array<string>()
    },
    enableDateBetween: {
        type: Object as PropType<{ fromDate: string, toDate: string }>,
        required: false,
        default: () => ({ fromDate: "", toDate: "" })
    },
    headerBtn: {
        type: Object as PropType<{ label: string, type: "reset" | "today" }>,
        required: false,
        default: () => ({ label: "Today", type: "today" })
    },
    yearRange: {
        type: Number,
        required: false,
        default: 70
    },
});

const { t } = useI18n();

//// variables declaration
const daysLabel = ref<Array<{ value: string, key: number }>>([
    { value: t("COMMON.BM_DATE_PICKER.SUNDAY"), key: 0 },
    { value: t("COMMON.BM_DATE_PICKER.MONDAY"), key: 1 },
    { value: t("COMMON.BM_DATE_PICKER.TUESDAY"), key: 2 },
    { value: t("COMMON.BM_DATE_PICKER.WEDNESDAY"), key: 3 },
    { value: t("COMMON.BM_DATE_PICKER.THURSDAY"), key: 4 },
    { value: t("COMMON.BM_DATE_PICKER.FRIDAY"), key: 5 },
    { value: t("COMMON.BM_DATE_PICKER.SATURDAY"), key: 6 }
]);
const dayList = ref<Array<Array<IDay>>>([]);
const prevMonthDayList = ref<Array<Array<IDay>>>([]);
const nextMonthDayList = ref<Array<Array<IDay>>>([]);
const currentShowingDate = ref<{ day: number, month: number, year: number }>({ day: 0, month: 0, year: 0 });
// date picker
const pSelectedDate = ref<{ day: number, month: number, year: number }>({ day: 0, month: 0, year: 0 });
const strSelectedDate = ref<string>(props.selectedDate || ""); // selected raw date as string with format "YYYYMMDD" e.g. 20220131
const tempStrSelectedDate = ref<string>(props.selectedDate || ""); // use return back in case user click on reset button and then cancel button

// date range picker
const pSelectedRangeFromDate = ref<{ day: number, month: number, year: number }>({ day: 0, month: 0, year: 0 });
const pSelectedRangeToDate = ref<{ day: number, month: number, year: number }>({ day: 0, month: 0, year: 0 });
const tempStrSelectedRangeFromDate = ref<string>(props.selectedRange.fromDate || "");
const tempStrSelectedRangeToDate = ref<string>(props.selectedRange.toDate || "");
const enableSwipe = ref(false); // for enable or disable swipe
const isDisabledBtnPrevMonth = ref<boolean>(false);
const isDisabledBtnNextMonth = ref<boolean>(false);
const isDisableBtnPositive = ref<boolean>(true);

// Swipe gesture variables
const touchStartX = ref<number>(0);
const touchStartY = ref<number>(0);
const touchEndX = ref<number>(0);
const touchEndY = ref<number>(0);
const minSwipeDistance = 50; // Reduced from 75px to 50px for more sensitive swipes
const isSwiping = ref<boolean>(false);
const swipeProgress = ref<number>(0); // 0 to 1 for swipe progress
const swipeOffset = ref<number>(0); // Visual offset for transform
const tempCurrentShowingDate = ref<{ day: number, month: number, year: number }>({ day: 0, month: 0, year: 0 });
const slideDirection = ref<"none" | "next" | "prev">("none");
const isTransitioning = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);
const transitionTimeout = ref<number | null>(null);
const clsStartEndRange1 = ref("");
const clsStartEndRange2 = ref("");

//// methods declaration and call when component is on created
const onGetDaysOfWeek = func((dates: { month: number, year: number }) => {
    const daysOfWeekList = BizCheckMobileDateTime.getCalendarMatrix(dates.year, dates.month);
    BizCheckMobileLogger.info("daysOfWeekList => ", daysOfWeekList);
    return daysOfWeekList.map(week =>
        week.map(cell => {
            return {
                day: cell.date,
                month: cell.month,
                year: cell.year,
                isDisabled: cell.status !== "current",   // adjust if your logic differs
                isPrevMonth: cell.status === "prev",
                isNextMonth: cell.status === "next",
            };
        })
    );
}, "onGetDaysOfWeek");

const updateAllMonthLayers = func((currentDate: { day: number, month: number, year: number }) => {
    // Update current month
    dayList.value = onGetDaysOfWeek({ month: currentDate.month, year: currentDate.year });

    // Update previous month
    const prevMonth = currentDate.month === 0 ? 11 : currentDate.month - 1;
    const prevYear = currentDate.month === 0 ? currentDate.year - 1 : currentDate.year;
    prevMonthDayList.value = onGetDaysOfWeek({ month: prevMonth, year: prevYear });

    // Update next month
    const nextMonth = currentDate.month === 11 ? 0 : currentDate.month + 1;
    const nextYear = currentDate.month === 11 ? currentDate.year + 1 : currentDate.year;
    nextMonthDayList.value = onGetDaysOfWeek({ month: nextMonth, year: nextYear });

}, "updateAllMonthLayers");

const getCurrentDate = func((): { day: number, month: number, year: number } => {
    const currentDate = new Date(); // Example: January 2024 (Month is 0-indexed), so January is 0 and December is 11
    return { day: currentDate.getDate(), month: currentDate.getMonth(), year: currentDate.getFullYear() };
}, "getCurrentDate");

const initSelectedDateFromProp = func(() => {
    const getDate = { day: 0, month: 0, year: 0 };

    if (props.disabledDates.length > 0 && props.selectedDate === "") {
        // props.disabledDates[0] => YYYYMMDD
        // const firstDisabledDate = props.disabledDates[0];
        const resDate = BizCheckMobileDateTime.getPreviousDay(); // DateUtil.getNextOrPrevDate("PrevDate", 1, { specifiedDate: firstDisabledDate, outputFormat: "YYYYMMDD" });

        strSelectedDate.value = resDate;

        getDate.month = Number(resDate.substring(4, 6));
        getDate.year = Number(resDate.substring(0, 4));
        getDate.day = Number(resDate.substring(6, 8));
    }
    else {
        const dateSelected = BizCheckMobileDateTime.getDate(props.selectedDate);
        getDate.year = +dateSelected.getFullYear(); // +DateUtil.setDateFormat(props.selectedDate, "ServerToClient", { outputFormat: "YYYY" });
        getDate.month = +dateSelected.getMonth() + 1; // +DateUtil.setDateFormat(props.selectedDate, "ServerToClient", { outputFormat: "MM" });
        getDate.day = +dateSelected.getDate(); // +DateUtil.setDateFormat(props.selectedDate, "ServerToClient", { outputFormat: "DD" });
    }
    return { day: getDate.day, month: getDate.month == 0 ? 0 : getDate.month - 1, year: getDate.year };
}, "initSelectedDateFromProp");

const initSelectedRangeFromProp = func((date: string) => {
    const getDate = { day: 0, month: 0, year: 0 };
    getDate.year = +BizCheckMobileString.dateFormat(date, "YYYY");
    getDate.month = +BizCheckMobileString.dateFormat(date, "MM");
    getDate.day = +BizCheckMobileString.dateFormat(date, "DD");
    return { day: getDate.day, month: getDate.month == 0 ? 0 : getDate.month - 1, year: getDate.year };
}, "initSelectedRangeFromProp");

// Swipe gesture handlers
const onTouchStart = func((event: TouchEvent) => {
    // Skip swipe handling if disabled
    if (!enableSwipe.value) return;

    // Reset any stuck states first
    if (isTransitioning.value) {
        isTransitioning.value = false;
        slideDirection.value = "none";
    }

    touchStartX.value = event.touches[0].clientX;
    touchStartY.value = event.touches[0].clientY;
    isSwiping.value = false;
    swipeProgress.value = 0;
    swipeOffset.value = 0;
    // Store current date for potential rollback
    tempCurrentShowingDate.value = { ...currentShowingDate.value };

    // Add immediate visual feedback
    if (wrapperRef.value) {
        wrapperRef.value.style.transition = "none";
    }
}, "onTouchStart");

const onTouchMove = func((event: TouchEvent) => {
    // Skip swipe handling if disabled
    if (!enableSwipe.value) return;

    // Don't process if we're in a transition
    if (isTransitioning.value) return;

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;

    const deltaX = currentX - touchStartX.value;
    const deltaY = currentY - touchStartY.value;

    // Check if this is a horizontal swipe with lower threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 3) {
        // Only prevent default if we're actually swiping
        if (!isSwiping.value) {
            isSwiping.value = true;
        }

        // Calculate swipe progress (0 to 1) with smaller distance for more responsive feel
        const maxSwipeDistance = 100; // Reduced from 150px to 100px for faster response
        swipeProgress.value = Math.min(Math.abs(deltaX) / maxSwipeDistance, 1);

        // Calculate visual offset for transform with more responsive scaling
        const containerWidth = 100; // 100% of container width
        const maxOffset = containerWidth; // Maximum offset is one full month width
        swipeOffset.value = (deltaX / maxSwipeDistance) * maxOffset;

        // Determine swipe direction and target month
        const isSwipeRight = deltaX > 0;

        // Check if target month is allowed
        const canNavigate = isSwipeRight ? !isDisabledBtnPrevMonth.value : !isDisabledBtnNextMonth.value;

        if (canNavigate) {
            // Keep current month data stable, only show visual sliding effect
            // The actual month data will only update when swipe completes
        }

        // Prevent default for horizontal swipes with lower threshold
        if (Math.abs(deltaX) > 20 && event.cancelable) {
            try {
                event.preventDefault();
            } catch (e) {
                // Ignore preventDefault errors
            }
        }
    }
}, "onTouchMove");

const onTouchEnd = func((event: TouchEvent) => {
    // Skip swipe handling if disabled
    if (!enableSwipe.value) return;

    // Don't process if we're already transitioning
    if (isTransitioning.value) return;

    touchEndX.value = event.changedTouches[0].clientX;
    touchEndY.value = event.changedTouches[0].clientY;

    const deltaX = touchEndX.value - touchStartX.value;
    const deltaY = touchEndY.value - touchStartY.value;

    // Restore transition for smooth animation
    if (wrapperRef.value) {
        wrapperRef.value.style.transition = "";
    }

    // Check if the swipe is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && !isDisabledBtnPrevMonth.value) {
            // Swipe right - slide to previous month
            slideDirection.value = "prev";
            isTransitioning.value = true;
            swipeOffset.value = 0; // reset manual offset

            // Set a timeout to prevent getting stuck
            transitionTimeout.value = window.setTimeout(() => {
                if (isTransitioning.value) {
                    onTransitionEnd();
                }
            }, 500);
        } else if (deltaX < 0 && !isDisabledBtnNextMonth.value) {
            // Swipe left - slide to next month
            slideDirection.value = "next";
            isTransitioning.value = true;
            swipeOffset.value = 0;

            // Set a timeout to prevent getting stuck
            transitionTimeout.value = window.setTimeout(() => {
                if (isTransitioning.value) {
                    onTransitionEnd();
                }
            }, 500);
        } else {
            // Rollback
            slideDirection.value = "none";
            swipeOffset.value = 0;
        }
    } else {
        // Rollback
        slideDirection.value = "none";
        swipeOffset.value = 0;
    }
    isSwiping.value = false;
    swipeProgress.value = 0;
}, "onTouchEnd");

// Add transitionend handler
const onTransitionEnd = func(() => {
    // Prevent multiple calls
    if (!isTransitioning.value) return;

    // Clear any pending timeout
    if (transitionTimeout.value) {
        clearTimeout(transitionTimeout.value);
        transitionTimeout.value = null;
    }

    if (slideDirection.value === "next") {
        onClickNextMonth();
    } else if (slideDirection.value === "prev") {
        onClickPrevMonth();
    }

    // Instantly reset wrapper to center (no animation)
    if (wrapperRef.value) {
        wrapperRef.value.style.transition = "none";
        wrapperRef.value.style.transform = "translateX(-33.333%)";
        // Force reflow to apply the style immediately
        void wrapperRef.value.offsetWidth;
        wrapperRef.value.style.transition = "";
    }

    // Reset all states
    slideDirection.value = "none";
    isTransitioning.value = false;
    isSwiping.value = false;
    swipeProgress.value = 0;
    swipeOffset.value = 0;
}, "onTransitionEnd");

// //// lifecycle hooks
onMounted(() => {
    // TODO: init selected date for date range picker
    if (props.usingAs === "dateRange") {
        pSelectedRangeFromDate.value = initSelectedRangeFromProp(props.selectedRange.fromDate);
        pSelectedRangeToDate.value = initSelectedRangeFromProp(props.selectedRange.toDate);

        /**NOTE: condition to check user click open From Date or To Date */
        if (props.selectOn === "fromDate") {
            currentShowingDate.value = props.selectedRange.fromDate ? initSelectedRangeFromProp(props.selectedRange.fromDate) : getCurrentDate();
        } else {
            currentShowingDate.value = props.selectedRange.toDate ? initSelectedRangeFromProp(props.selectedRange.toDate) : getCurrentDate();
        }
        updateAllMonthLayers(currentShowingDate.value);
        if ( props.selectedRange.fromDate === props.selectedRange.toDate ) {
            isDisableBtnPositive.value = true;
        } else {
            isDisableBtnPositive.value = !pSelectedRangeFromDate.value.day || !pSelectedRangeToDate.value.day;
        }
        clsStartEndRange1.value = "selectedStartRange";
        clsStartEndRange2.value = "selectedEndRange";
    }

    if (props.usingAs === "date") {
        pSelectedDate.value = initSelectedDateFromProp();
        currentShowingDate.value = props.selectedDate ? initSelectedDateFromProp() : getCurrentDate();
        updateAllMonthLayers(currentShowingDate.value);
        isDisableBtnPositive.value = !strSelectedDate.value;
    }

    handleDisabledBtnNextOrPrevMonth();  //// call this function to update isDisabledPastDate and isDisabledFutureDate prevent click on prev month and next month
    handleDisabledDate();
    if (wrapperRef.value) {
        wrapperRef.value.addEventListener("transitionend", onTransitionEnd);
    }
});

onBeforeUnmount(() => {
    if (wrapperRef.value) {
        wrapperRef.value.removeEventListener("transitionend", onTransitionEnd);
    }

    // Clear any pending timeout
    if (transitionTimeout.value) {
        clearTimeout(transitionTimeout.value);
        transitionTimeout.value = null;
    }
});


// // Computed Define Block
const isDisabledDate = computed(() => (day: IDay) => day.isDisabled ? "disabled" : "");

const isPrevMonth = computed(() => (day: IDay) => {
    // if day is next month and selected day, return selectedDay
    if (day.isPrevMonth && isSelectedDay.value(day)) {
        return "selectedDay";
    } else if (day.isPrevMonth) {
        return "prev-month";
    } else {
        return "";
    }
});

const isNextMonth = computed(() => (day: IDay) => {
    if (day.isNextMonth && isSelectedDay.value(day)) {
        return "selectedDay";
    } else if (day.isNextMonth) {
        return "next-month";
    } else {
        return "";
    }
});

const isWeekend = computed(() => (index: number, day: IDay) => {
    // Sunday index = 0
    if (index === 0 && !day.isNextMonth && !day.isPrevMonth) {
        return "weekend";
    }
    return "";
});

const isToday = computed(() => (date: IDay) => {
    const today = getCurrentDate();
    if (date.day === today.day && date.month === today.month && date.year === today.year) {
        return "today";
    }
    return "";
});

// const isDisabledToday = computed(() => {
//     return props.calendarType === PICKER_TYPE.DisablePastAndToday ||
//         props.calendarType === "disableFutureAndToday" ||
//         props.calendarType === "recurring";
// });

const isSelectedDay = computed(() => (day: IDay): string => {
    if (props.usingAs === "dateRange") return "";

    if (day.day === pSelectedDate.value.day &&
        day.month === pSelectedDate.value.month &&
        day.year === pSelectedDate.value.year
    ) {
        return "selectedDay";
    }
    return "";
});
const translateService = new LocalServices();
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

const getMonthYearLabel = computed(() => {
    if (currentShowingDate.value.year === 0) return;
    return `${currentShowingDate.value.year} ${defaultMonthList.value.filter( (item) => Number(item.key) === (currentShowingDate.value.month +1))[0].value}`; // BizCheckMobileString.dateFormat(`${currentShowingDate.value.year}${(currentShowingDate.value.month + 1).toString().padStart(2, "0")}${currentShowingDate.value.day}`, "YYYY MMMM").toLocaleUpperCase();
});

const negativeButton = computed(()=> {
    // const result = props.footerButtons.find((btn) => btn.type === "negative");
    // if (result) return result;
    return { label: translateService.translate("COMMON.BUTTON.CANCEL"), type: "negative" };
});

const positiveButton = computed(()=> {
    // const result = props.footerButtons.find((btn) => btn.type === "positive");
    // if (result) return result;
    return { label: translateService.translate("COMMON.BUTTON.CONFIRM"), type: "positive" };
});

const calendarDaysContainerStyle = computed(() => ({
    touchAction: enableSwipe.value ? "pan-y" : "auto"
}));

// // START COMPUTED ============================ date range picker ============================
const isSelectedRangeFromDate = computed(() => (day: IDay) => {
    if (day.day === pSelectedRangeFromDate.value.day &&
        day.month === pSelectedRangeFromDate.value.month &&
        day.year === pSelectedRangeFromDate.value.year
    ) {
        return `selectedDay ${clsStartEndRange1.value}`;
    }
});

const isSelectedRangeToDate = computed(() => (day: IDay) => {
    if (day.day === pSelectedRangeToDate.value.day &&
        day.month === pSelectedRangeToDate.value.month &&
        day.year === pSelectedRangeToDate.value.year
    ) {
        return `selectedDay ${clsStartEndRange2.value}`;
    }
});

const isFromDateLabel = computed(() => (day: IDay): boolean => {
    if (props.usingAs !== "dateRange") return false;

    // Get the actual from date (considering swap)
    const fromDate = formatDayToDateString(pSelectedRangeFromDate.value);
    const toDate = formatDayToDateString(pSelectedRangeToDate.value);
    const dayDate = formatDayToDateString(day);

    // If both dates are selected, determine which is actually "from" (smaller date)
    if (pSelectedRangeFromDate.value.day !== 0 && pSelectedRangeToDate.value.day !== 0) {
        const actualFromDate = BizCheckMobileDateTime.isLessThanEqualTo(fromDate, toDate) ? fromDate : toDate;
        return dayDate === actualFromDate;
    }

    // If only from date is selected
    return day.day === pSelectedRangeFromDate.value.day &&
           day.month === pSelectedRangeFromDate.value.month &&
           day.year === pSelectedRangeFromDate.value.year;
});

const isToDateLabel = computed(() => (day: IDay): boolean => {
    if (props.usingAs !== "dateRange") return false;
    if (pSelectedRangeToDate.value.day === 0) return false;

    // Get the actual to date (considering swap)
    const fromDate = formatDayToDateString(pSelectedRangeFromDate.value);
    const toDate = formatDayToDateString(pSelectedRangeToDate.value);
    const dayDate = formatDayToDateString(day);

    // If both dates are selected and they're the same, don't show "To" label
    if (fromDate === toDate) return false;

    // Determine which is actually "to" (larger date)
    const actualToDate = BizCheckMobileDateTime.isLessThanEqualTo(fromDate, toDate) ? toDate : fromDate;
    return dayDate === actualToDate;
});

const isSelectedRange = computed(() => (index: number, day: IDay) => {

    if (pSelectedRangeFromDate.value.year === 0 || pSelectedRangeToDate.value.year === 0) return;

    let fromDate = formatDayToDateString(pSelectedRangeFromDate.value);
    let toDate = formatDayToDateString(pSelectedRangeToDate.value);

    // Swap if fromDate is greater than toDate (when user selects backwards)
    if (BizCheckMobileDateTime.isGreaterThanTo(fromDate, toDate)) {
        [fromDate, toDate] = [toDate, fromDate];
    }

    const date = formatDayToDateString(day);
    const isInclude = BizCheckMobileDateTime.isBetweenWithinDate(date,fromDate, toDate); // DateUtil.isBetween(date, fromDate, toDate, { inputFormat: "YYYYMMDD", validateType: "()" });

    if (isInclude && index !== 0) {
        return "selectedRange";
    } else if (isInclude && index === 0) {
        return "selectedRangeWeekend";
    }
    return "";
});
// // END COMPUTED ============================ date range picker ============================


// // Method Define Block
const handleDisabledDate = func(() => {

    const formatDayToDateString = func((day: { day: number; month: number; year: number }) => {
        return `${day.year}${day.month + 1}${day.day}`;
    }, "formatDayToDateString");

    const isBefore = func((date1: string, date2: string) => {
        return BizCheckMobileDateTime.isGreaterThanTo(date1, date2);
    }, "isBefore");

    const shouldDisableDate = func((date: string): boolean => {
        if (props.disabledDates.length > 0) {
            return props.disabledDates.includes(date);
        }
        if (props.calendarType === "recurring") {
            return (isBefore(date, props.enableDateBetween.fromDate) || isBefore(props.enableDateBetween.toDate, date));
        }
        return false;
    }, "shouldDisableDate");

    for (const week of dayList.value) {
        for (const day of week) {
            const formattedDate = formatDayToDateString(day);
            if (shouldDisableDate(formattedDate)) {
                day.isDisabled = true;
            }
        }
    }
}, "handleDisabledDate");

const handleDisabledBtnNextOrPrevMonth = func(() => {
    if (props.calendarType === "general") return;

    const isSameMonth = currentShowingDate.value.month === getCurrentDate().month;
    const isSameYear = currentShowingDate.value.year === getCurrentDate().year;

    if (props.calendarType === "disablePast" || props.calendarType === "disablePastAndToday") {
        isDisabledBtnPrevMonth.value = (isSameMonth && isSameYear);
        return;
    }

    if (props.calendarType === "disableFuture" || props.calendarType === "disableFutureAndToday") {
        isDisabledBtnNextMonth.value = (isSameMonth && isSameYear);
    }
}, "handleDisabledBtnNextOrPrevMonth");

const triggerPrevMonth = func(() => {
  if (isTransitioning.value) return;
  slideDirection.value = "prev";
  isTransitioning.value = true;
}, "triggerPrevMonth");

const triggerNextMonth = func(() => {
  if (isTransitioning.value) return;
  slideDirection.value = "next";
  isTransitioning.value = true;
}, "triggerNextMonth");

const onClickHeaderBtn = func(() => {
    if (props.headerBtn.type === "today") {
        if (props.disabledDates.length === 0) {
            currentShowingDate.value = getCurrentDate();
            // use click on today button to update selected date to today
            onClickDay({ ...currentShowingDate.value, isDisabled: false, isPrevMonth: false, isNextMonth: false });

            //// update day list based on selected month and year
            dayList.value = onGetDaysOfWeek({
                year: currentShowingDate.value.year,
                month: currentShowingDate.value.month
            });
        }
        // this case when user click on today button and have disabled date no need to assign current date to currentShowingDate just route calendar to today
        else {
            //// update day list based on selected month and year
            dayList.value = onGetDaysOfWeek({
                year: getCurrentDate().year,
                month: getCurrentDate().month
            });
        }
        handleDisabledDate();
        return;
    }

    if (props.headerBtn.type === "reset") {
        strSelectedDate.value = "";
        pSelectedDate.value = { day: 0, month: 0, year: 0 };
    }
}, "onClickHeaderBtn");

const onClickPrevMonth = func(() => {
    const { month, year } = currentShowingDate.value;

    // month value = 0 for January
    if (month === 0) {
        currentShowingDate.value.month = 11; // set month value = 11 for December
        currentShowingDate.value.year = year - 1; // set year value = year - 1 for previous year e.g. 2021 => 2020
    } else {
        currentShowingDate.value.month = month - 1;
    }

    //// update all month layers
    updateAllMonthLayers(currentShowingDate.value);

    //// call this function to update isDisabledPastDate and isDisabledFutureDate prevent click on prev month and next month
    handleDisabledBtnNextOrPrevMonth();

    handleDisabledDate();
}, "onClickPrevMonth");

const onClickNextMonth = func(() => {
    const { month, year } = currentShowingDate.value;

    // month value = 11 for December
    if (month === 11) {
        currentShowingDate.value.month = 0; // set month value = 0 for January
        currentShowingDate.value.year = year + 1; // set year value = year + 1 for next year e.g. 2021 => 2022
    } else {
        currentShowingDate.value.month = month + 1;
    }

    //// update all month layers
    updateAllMonthLayers(currentShowingDate.value);

    //// call this function to update isDisabledPastDate and isDisabledFutureDate prevent click on prev month and next month
    handleDisabledBtnNextOrPrevMonth();

    handleDisabledDate();
}, "onClickNextMonth");

const onMonthYearPicker = func(() => {
    DialogUtil.showDialog(BmMonthYearPicker,
        {
            props: {
                month: `${currentShowingDate.value.month + 1}`,
                year: currentShowingDate.value.year.toString(),
                yearRange: props.yearRange,
                pickerType: props.calendarType as PICKER_TYPE,
            },
            onDidDismiss: (result) => {
                if (result.role === "confirm") {
                    currentShowingDate.value.year = +result.data.year;
                    currentShowingDate.value.month = +result.data.month - 1; // month get from month picker start from 1 but day picker start from 0
                    //// update day list based on selected month and year
                    dayList.value = onGetDaysOfWeek({
                        year: +result.data.year,
                        month: +result.data.month - 1 // month get from month picker start from 1 but day picker start from 0
                    });
                }
            },
        });
    handleDisabledDate();
}, "onMonthYearPicker");

const onClickDay = func((date: IDay) => {
    if (props.usingAs === "dateRange") {

        // If both From and To dates are already selected, reset the selection and start a new range
        if (pSelectedRangeFromDate.value.day !== 0 && pSelectedRangeToDate.value.day !== 0) {
            // Reset the selection classes
            clsStartEndRange1.value = "";
            clsStartEndRange2.value = "";

            pSelectedRangeFromDate.value = { day: 0, month: 0, year: 0 };
            pSelectedRangeToDate.value = { day: 0, month: 0, year: 0 };

            // Set the new From date to the clicked date
            pSelectedRangeFromDate.value = { day: date.day, month: date.month, year: date.year };
            isDisableBtnPositive.value = true;
        }

        // If From Date is not selected, set it to the clicked date
        else if (pSelectedRangeFromDate.value.day === 0) {
            pSelectedRangeFromDate.value.day = date.day;
            pSelectedRangeFromDate.value.month = date.month;
            pSelectedRangeFromDate.value.year = date.year;
        }
        // If To Date is not selected, set it to the clicked date
        else if (pSelectedRangeToDate.value.day === 0) {
            pSelectedRangeToDate.value.day = date.day;
            pSelectedRangeToDate.value.month = date.month;
            pSelectedRangeToDate.value.year = date.year;
        }

        // Enable the positive button only when both From and To dates are selected
        if (pSelectedRangeFromDate.value.day !== 0 && pSelectedRangeToDate.value.day !== 0) {

            const fromDate = formatDayToDateString(pSelectedRangeFromDate.value);
            const toDate = formatDayToDateString(pSelectedRangeToDate.value);

            // If fromDate is greater than toDate, swap them for setting class
            if (BizCheckMobileDateTime.isGreaterThanTo(fromDate, toDate)) {
                [clsStartEndRange1.value, clsStartEndRange2.value] = ["selectedEndRange", "selectedStartRange"];
            }
            if (BizCheckMobileDateTime.isLessThanEqualTo(fromDate, toDate)){
                [clsStartEndRange2.value, clsStartEndRange1.value] = ["selectedEndRange", "selectedStartRange"];
            }
            isDisableBtnPositive.value = fromDate === toDate ? true : false;

        }

    } else if (props.usingAs === "date") {

        isDisableBtnPositive.value = false;

        pSelectedDate.value.day = date.day;
        pSelectedDate.value.month = date.month;
        pSelectedDate.value.year = date.year;

        //// update selected date string and add zero to month and day if less than 10 e.g. day: 1 => 01, month: 9 => 09
        const month = date.month + 1;
        const newDay = (date.day < 10) ? `0${date.day}` : date.day;
        const newMonth = (month < 10) ? `0${month}` : month;

        strSelectedDate.value = `${date.year}${newMonth}${newDay}`; // final value for business screen format YYYYMMDD e.g. 20220131
    }
}, "onClickDay");

const formatDayToDateString = func((day: { day: number; month: number; year: number }) => {
    const month = (day.month + 1).toString().padStart(2, "0");
    const dayStr = day.day.toString().padStart(2, "0");
    const dateString = `${day.year}${month}${dayStr}`;
    return dateString;
}, "formatDayToDateString");

const handleDateRangeOnApply = func(() => {
    let fromDate = formatDayToDateString(pSelectedRangeFromDate.value);
    let toDate = formatDayToDateString(pSelectedRangeToDate.value);

    // If fromDate is greater than toDate, swap them
    if (BizCheckMobileDateTime.isGreaterThanTo(fromDate, toDate)) {
        [fromDate, toDate] = [toDate, fromDate];
    }

    return { fromDate, toDate };
}, "handleDateRangeOnApply");

const onClickBtnNegative = func(() => {
    if (props.usingAs === "dateRange") {
        DialogUtil.closeDialog({ role: "cancel", data: { datePicker: { fromDate: tempStrSelectedRangeFromDate.value, toDate: tempStrSelectedRangeToDate.value } } });
    } else {
        DialogUtil.closeDialog({ role: "cancel", data: { datePicker: tempStrSelectedDate.value } });
    }
}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {
    if (props.usingAs === "dateRange") {
        const { fromDate, toDate } = handleDateRangeOnApply();
        DialogUtil.closeDialog({ role: "apply", data: { datePicker: { fromDate: fromDate, toDate: toDate } } });
    }
    else {
        DialogUtil.closeDialog({ role: "apply", data: { datePicker: strSelectedDate.value } });
    }
}, "onClickBtnPositive");

</script>

<style scoped lang="scss">

.modal_header { flex-wrap: wrap;}
.calendar_header { display: flex; justify-content: space-between; align-items: center;
    ion-button { --background: transparent; width: 24px; height: 24px !important; min-height: 24px !important; --padding-start: 0; --padding-end: 0; --padding-top: 0; --padding-bottom: 0; border: 1px solid #DDDDDD !important; border-radius: var(--radius4) !important; margin-right: 8px;}
    .select_month { padding-right: 16px; font-size: var(--font20); font-weight: 700; color: var(--fontColor01); line-height: 28px;}
}

ion-buttons { margin-left: auto;
    ion-button { --background: transparent; width: 24px; height: 24px !important; min-height: 24px !important; --padding-start: 0; --padding-end: 0; --padding-top: 0; --padding-bottom: 0; border: 1px solid #DDDDDD !important; border-radius: var(--radius4) !important; margin-left: 8px;
        &.btn_previous { background: url("@/assets/images/ico_btn_previous_date.svg") center no-repeat; text-indent: -9999px;}
        &.btn_next {  background: url("@/assets/images/ico_btn_next_date.svg") center no-repeat; text-indent: -9999px;}
        &.btn_today { border: none !important; margin: 0 8px 0 0; width: auto; min-height: 18px !important; height: 18px !important; --background: transparent; --padding-start: 0 !important; --padding-end: 0 !important; --padding-top: 0 !important; --padding-bottom: 0 !important; font-size: var(--font14); font-weight: 600; line-height: 18px; color: #000000;
            span { position: relative; padding-left: 14px; color: var(--fontColor01);
                &::before { content: ""; position: absolute; left: 0; top: calc(50% - 3px); width: 6px; height: 6px; background: var(--colorPrimary); border-radius: 50%;}
            }
        }
    }
}


.calendar_container {
    ion-row {
        ion-col { padding: 0;}
    }
    .day_list { border-bottom: 1px solid #DDDDDD;
        ion-row {
            ion-col {
                > div { height: 32px; display: flex; justify-content: center; align-items: center; font-size: var(--font14); font-weight: 600; line-height: 16px; color: #000000;
                    &.weekend { color: #FF0000;}
                }
            }
        }
    }
    .calendar_days_container {
        .calendar_days_wrapper { display: flex; width: 300%; transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); will-change: transform; touch-action: manipulation;
            > .calendar_month_card  { min-width: 33.33%; flex: 1;}
            ion-row { height: 50px;}
            .day { position: relative; font-size: var(--font14); font-weight: 600; color: var(--fontColor01); width: 100%; height: 46px; display: flex; flex-direction: column; justify-content: center; align-items: center;
                .range_label { position: absolute; bottom: px; font-size: .625rem; font-weight: 500; line-height: 12px; color: var(--colorPrimary); white-space: nowrap; z-index: 1; }
                &.selectedDay .range_label { color: var(--colorPrimary); font-weight: 600; bottom: -8px;}
                &.disabled  { color: #CCCCCC; pointer-events: none; font-weight: 500;}
                &.today { position: relative;
                    &::before { content: ""; position: absolute; width: 6px; height: 6px; background: var(--colorPrimary); border-radius: var(--radius8); left: calc(50% - 3px); top: 34px;}
                }
                &.selectedDay { color: #FFFFFF;
                    &::before { content: ""; position: absolute; width: 32px; height: 32px; background: var(--colorPrimary); border-radius: var(--radius8); left: calc(50% - 16px); top: 7px; z-index: -1;}
                }
                &.weekend { color: #FF0000;}
                &.selectedRange, &.selectedRangeWeekend {
                    &::after { content: ""; position: absolute; width: 100%; height: 32px; background: #EEEEEE; left: 0; top: 7px; z-index: -1;}
                }
                &.selectedStartRange {
                    &::after { content: ""; position: absolute; width: 50%; height: 32px; background: #EEEEEE; left: 50%; top: 7px; z-index: -2;}
                }
                &.selectedEndRange {
                    &::after { content: ""; position: absolute; width: 50%; height: 32px; background: #EEEEEE; left: 0; top: 7px; z-index: -2;}
                }
                &.selectedStartRange.selectedEndRange {
                    &::after { content: ""; display: none;}
                }
            }
            ion-row {
                ion-col {
                    &:first-child {
                        .selectedRange, .selectedRangeWeekend  {
                            &::after { border-radius: var(--radius8) 0 0 var(--radius8);}
                        }
                    }
                    &:last-child {
                        .selectedRange, .selectedRangeWeekend {
                            &::after { border-radius: 0 var(--radius8) var(--radius8) 0;}
                        }
                    }
                }
            }
        }
    }
}
</style>
