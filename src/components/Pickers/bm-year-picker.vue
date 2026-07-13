<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ props.title }}</ion-label>
        </div>
        <div class="modal_content">
            <div class="picker_wrapper">
                <!-- Year -->
                <div class="picker_col">
                <ion-label class="lbl">{{ $t('COMMON.BM_YEAR_PICKER.YEAR') }}</ion-label>
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
            <bm-button v-if="negativeBtn" class="btn02" @click="onClickBtnNegative()"><span>{{ negativeBtn.label }}</span></bm-button>
            <bm-button v-if="positiveBtn" class="btn01" @click="onClickBtnPositive()"><span>{{ positiveBtn.label }}</span></bm-button>
        </div>
    </div>
</template>

<!-- eslint-disable @typescript-eslint/naming-convention -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { PICKER_TYPE } from "@/enum/date-type-enum";
import { func } from "@/utilities/func";
import { BizCheckMobileDateTime } from "@/shared/bizcheckmobile";
import DialogUtil from "@/utilities/dialog-util";

interface Props {
    title?: string,
    year: string,
    pickerType?: PICKER_TYPE
    footerBtns?: Array<{ label: string, type: "negative" | "positive" }>,
}

const props = withDefaults(defineProps<Props>(), {
    title: "Select Year",
    year: "",
    pickerType: PICKER_TYPE.General,
    footerBtns: () => [
        { label: "Cancel", type: "negative" },
        { label: "Confirm", type: "positive" }
    ]
});

const yearList = ref<Array<{ key: string, value: string }>>([]);
const currentYear = BizCheckMobileDateTime.getYear().toString();
const selectedYear = ref(currentYear);

onMounted(() => {
    if (props.year) selectedYear.value = props.year;
    generateYearList(props.pickerType);
});

const negativeBtn = computed(() => {
    return props.footerBtns.find((btn) => btn.type === "negative");
});

const positiveBtn = computed(() => {
    return props.footerBtns.find((btn) => btn.type === "positive");
});

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

const onScrollChangeYear = func((index: number, item: { key: string, value: string }) => {
    selectedYear.value = item.value;
}, "onScrollChangeYear");

const onClickBtnNegative = func(() => {
    DialogUtil.closeDialog({ role: "cancel" });
}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {
    DialogUtil.closeDialog({ role: "confirm", data: { year: selectedYear.value } });
}, "onClickBtnPositive");

if (props.year) selectedYear.value = props.year;

generateYearList(props.pickerType);

</script>

<style scoped lang="scss">
.picker_wrapper { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; }
.picker_col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.lbl { display: block; color: var(--fontColor02); font-size: var(--font14); font-weight: 600; line-height: 140%; text-align: center; margin-bottom: 8px; }
</style>
