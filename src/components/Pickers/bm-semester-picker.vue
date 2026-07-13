<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ displayTitle }}</ion-label>
        </div>

        <div class="modal_content">
            <div class="picker_wrapper">

                <!-- Semester -->
                <div class="picker_col">
                    <ion-label class="lbl">
                        {{ $t('COMMON.BM_SEMESTER_PICKER.MONTH') }}
                    </ion-label>

                    <bm-looping-scroll
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
                    <ion-label class="lbl">
                        {{ $t('COMMON.BM_SEMESTER_PICKER.YEAR') }}
                    </ion-label>

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
            <bm-button
                v-if="negativeBtn"
                class="btn02"
                @click="onClickBtnNegative()"
            >
                <span>{{ negativeBtn.label }}</span>
            </bm-button>

            <bm-button
                v-if="positiveBtn"
                class="btn01"
                @click="onClickBtnPositive()"
            >
                <span>{{ positiveBtn.label }}</span>
            </bm-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PICKER_TYPE } from "@/enum/date-type-enum";
import LocalServices from "@/services/local-services";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime } from "@/shared/bizcheckmobile";
import { computed, onMounted, ref } from "vue";

const translateService = new LocalServices();

interface Props {
    title?: string
    semester: string
    year: string
    pickerType?: PICKER_TYPE
    footerBtns?: Array<{ label: string, type: "negative" | "positive" }>
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    semester: "",
    year: "",
    pickerType: PICKER_TYPE.General,
    footerBtns: () => [
        { label: "", type: "negative" },
        { label: "", type: "positive" }
    ]
});

const displayTitle = computed(() =>
    props.title || translateService.translate("COMMON.BM_SEMESTER_PICKER.TITLE")
);

const defaultMonthList = computed<Array<{ key: string, value: string }>>(() => [
    { key: "01", value: translateService.translate("COMMON.BM_SEMESTER_PICKER.SEMESTER_1") },
    { key: "02", value: translateService.translate("COMMON.BM_SEMESTER_PICKER.SEMESTER_2") }
]);

const displayFooterBtns = computed(() =>
    props.footerBtns.map((btn) => ({
        ...btn,
        label:
            btn.label ||
            (btn.type === "negative"
                ? translateService.translate("COMMON.BUTTON.CANCEL")
                : translateService.translate("COMMON.BUTTON.CONFIRM"))
    }))
);

const monthList = ref<Array<{ key: string, value: string }>>([]);
const yearList = ref<Array<{ key: string, value: string }>>([]);

const currentYear = BizCheckMobileDateTime.getYear().toString();

const selectedMonth = ref(props.semester || "01");
const selectedYear = ref(props.year || currentYear);
const dataSelected = ref<{ key: string, value: string }>({ key: "", value: "" });

const negativeBtn = computed(() =>
    displayFooterBtns.value.find((btn) => btn.type === "negative")
);

const positiveBtn = computed(() =>
    displayFooterBtns.value.find((btn) => btn.type === "positive")
);

// const getCurrentSemester = () => {
//     const month = new Date().getMonth() + 1;
//     return month <= 6 ? 1 : 2;
// };

onMounted(() => {
    if (props.semester) selectedMonth.value = props.semester;
    if (props.year) selectedYear.value = props.year;
    dataSelected.value = defaultMonthList.value.find((option: { key: string; value: string }) => option.key === selectedMonth.value) ?? { key: "", value: "" };
    generateYearList(props.pickerType);
    generateMonthList();
});

const generateMonthList = func(() => {

    // const currentSemester = getCurrentSemester();

    // if (selectedYear.value === currentYear) {

    //     monthList.value = defaultMonthList.value.filter(
    //         (s) => Number(s.key) <= currentSemester
    //     );

    // } else {

        monthList.value = [...defaultMonthList.value];

    // }

    // ensure S1 is first default render
    if (!monthList.value.find(m => m.key === selectedMonth.value)) {
        selectedMonth.value = monthList.value[0].key; // S1
    }

}, "generateMonthList");

const generateYearList = func((type: PICKER_TYPE) => {

    const yearRange = 50;

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

const onScrollChangeMonth = func((index: number, item: any) => {

    selectedMonth.value = item.key;
    dataSelected.value = item;
}, "onScrollChangeMonth");

const onScrollChangeYear = func((index: number, item: any) => {

    selectedYear.value = item.value;
    // dataSelected.value = item;

    // generateMonthList();

}, "onScrollChangeYear");

const onClickBtnNegative = func(() => {

    DialogUtil.closeDialog({ role: "cancel" });

}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {

    DialogUtil.closeDialog({
        role: "confirm",
        data: {
            semester: selectedMonth.value,
            data: dataSelected.value,
            year: selectedYear.value
        }
    });

}, "onClickBtnPositive");
</script>

<style scoped lang="scss">
.picker_wrapper { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 0px; }

.picker_col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }

.lbl { display: block; color: var(--fontColor02); font-size: var(--font14); font-weight: 600; line-height: 140%; text-align: center; margin-bottom: 8px; }
</style>