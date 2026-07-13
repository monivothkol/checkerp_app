<template>
    <div mode="modal" class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ props.title }}</ion-label>
        </div>
        <div class="modal_content">
            <div class="picker_wrapper">
                <!-- Hour -->
                <div class="picker_col">
                    <ion-label class="lbl">{{ $t('COMMON.BM_TIME_PICKER.HOUR') }}</ion-label>
                    <bm-looping-scroll
                        :initial-value="selectedHour"
                        :items="hourList"
                        :enable-drag="true"
                        :box-height="50"
                        :wrapper-width="80"
                        :wrapper-height="150"
                        @scroll-change="onScrollChangeHour"
                    >
                        <template #item="{ item }">
                            {{ item.value }}
                        </template>
                    </bm-looping-scroll>
                </div>
                <!-- Minute -->
                <div class="picker_col">
                    <ion-label class="lbl">{{ $t('COMMON.BM_TIME_PICKER.MINUTE') }}</ion-label>
                    <bm-looping-scroll
                        :initial-value="selectedMinute"
                        :items="minuteList"
                        :enable-drag="true"
                        :box-height="50"
                        :wrapper-width="80"
                        :wrapper-height="150"
                        @scroll-change="onScrollChangeMinute"
                    >
                        <template #item="{ item }">
                            {{ item.value }}
                        </template>
                    </bm-looping-scroll>
                </div>
                <!-- AM/PM Selector -->
                <!-- <div class="picker_col">
                    <div class="ampm_toggle">
                        <div v-for="amPm in amPmList" :key="amPm" :class="['ampm_pill', { active: selectedAmPm === amPm }]" @click="onClickAMPM(amPm)">
                            {{ amPm }}
                        </div>
                    </div>
                </div> -->
            </div>
        </div>
        <div class="modal_footer">
            <bm-button v-if="negativeBtn" class="btn02" @click="onClickBtnNegative()"><span>{{ negativeBtn.label }}</span></bm-button>
            <bm-button v-if="positiveBtn" :disabled="isDisabledBtnPositive" class="btn01" @click="onClickBtnPositive()"><span>{{ positiveBtn.label }}</span></bm-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { func } from "@/utilities/func";
import DialogUtil from "@/utilities/dialog-util";

interface Props {
    time: {
        hour: string,
        minute: string
    },
    title: string
}

const props = withDefaults(defineProps<Props>(), {
    time: () => ({ hour: "", minute: "" }),
    title: "Select Time",
    footerBtns: () => []
});

const hourList = ref<Array<{ key: string, value: string }>>([]);
const minuteList = ref<Array<{ key: string, value: string }>>([]);
// const amPmList = ["AM", "PM"];

const selectedHour = ref("12");
const selectedMinute = ref("00");
const pFooterBtns = ref<Array<{ label: string, type: "negative" | "positive" }>>([
    { label: "Cancel", type: "negative" },
    { label: "Confirm", type: "positive" }
]);

onMounted(() => {
    const current = getCurrentTime24();

    selectedHour.value = props.time.hour || current.hour;
    selectedMinute.value = props.time.minute || current.minute;

    initializeData();
});

const getCurrentTime24 = () => {
    const now = new Date();
    return {
        hour: String(now.getHours()).padStart(2, "0"),   // 00–23
        minute: String(now.getMinutes()).padStart(2, "0") // 00–59
    };
};


// computed define block
const isDisabledBtnPositive = computed(() => hourList.value.length === 0);
const negativeBtn = computed(() => {
    return pFooterBtns.value.find((btn) => btn.type === "negative");
});
const positiveBtn = computed(() => {
    return pFooterBtns.value.find((btn) => btn.type === "positive");
});

// 12-hour AM: 12, 01, 02, ..., 11
// const hour12AM = computed(() => {
//     return Array.from({ length: 12 }, (_, i) => {
//         const hour = i === 0 ? 12 : i;
//         const value = hour < 10 ? `0${hour}` : `${hour}`;
//         return { key: value, value: value };
//     });
// });

// 12-hour PM: 12, 01, 02, ..., 11
// const hour12PM = computed(() => {
//     return Array.from({ length: 12 }, (_, i) => {
//         const hour = i === 0 ? 12 : i;
//         const value = hour < 10 ? `0${hour}` : `${hour}`;
//         return { key: value, value: value };
//     });
// });

// minute: 00 to 59
const minuteOptions = computed(() => {
    return Array.from({ length: 60 }, (_, i) => {
        const value = i < 10 ? `0${i}` : `${i}`;
        return { key: value, value: value };
    });
});

// 24-hour: 00 to 23
const hour24 = computed(() => {
    return Array.from({ length: 24 }, (_, i) => {
        const value = i < 10 ? `0${i}` : `${i}`;
        return { key: value, value };
    });
});


// Initialize data
const initializeData = func(() => {
    hourList.value = hour24.value; // selectedAmPm.value === "AM" ? hour12AM.value : hour12PM.value;
    minuteList.value = minuteOptions.value;
}, "initializeData");

// const onClickAMPM = func((value: string) => {
//     selectedAmPm.value = value;
//     hourList.value = value === "AM" ? hour12AM.value : hour12PM.value;
// }, "onClickAMPM");

const onScrollChangeHour = func((index: number, item: { key: string, value: string }) => {
    selectedHour.value = item.key;
}, "onScrollChangeHour");

const onScrollChangeMinute = func((index: number, item: { key: string, value: string }) => {
    selectedMinute.value = item.key;
}, "onScrollChangeMinute");

const onClickBtnNegative = func(() => {
    DialogUtil.closeDialog({ role: "cancel" });
}, "onClickBtnNegative");

const onClickBtnPositive = func(() => {
    DialogUtil.closeDialog({ role: "apply", data: { hour: selectedHour.value, minute: selectedMinute.value, second: "00"} });
}, "onClickBtnPositive");
</script>

<style scoped lang="scss">
.picker_wrapper { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 10px; touch-action: none; }
.picker_col { flex: 1;
    &:has(.ampm_toggle) { flex: unset;}
}
.ampm_toggle { padding: 4px; width: 54px; display: flex; flex-direction: column; align-items: center; border-radius: var(--radius8); border: 1px solid #D9D9D9; background: #FFFFFF;
    .ampm_pill { width: 100%; height: 38px; border-radius: var(--radius8); display: flex; align-items: center; justify-content: center; font-size: var(--font14); font-weight: 400; cursor: pointer; transition: background 0.2s, color 0.2s; outline: none; background: #FFFFFF; color: var(--fontColor01); border: none; margin: 0; padding: 0;
        &.active { background: var(--colorPrimary); color: #fff;  font-weight: 700;}
    }
}
ion-label.lbl { display: block; color: var(--fontColor02); font-size: var(--font14); font-weight: 600; line-height: 140%; text-align: center; margin-bottom: 8px; }
</style>
