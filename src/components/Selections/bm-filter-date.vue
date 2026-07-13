<template>
    <div class="modal_wrapper">
        <div class="modal_header">
            <ion-label>{{ $t('COMMON.BM_FILTER_DATE.FILTER_DATE') }}</ion-label>
        </div>
        <div class="modal_content">
            <div class="formwrap01">
                <ion-row>
                    <ion-col>
                        <bm-segment :value="dateRange">
                            <template #label>{{ $t('COMMON.BM_FILTER_DATE.DATE_RANGE') }}</template>
                            <bm-segment-button value="1 Week" label="{{ $t('COMMON.BM_FILTER_DATE.1_WEEK') }}"/>
                            <bm-segment-button value="1 Month" label="{{ $t('COMMON.BM_FILTER_DATE.1_MONTH') }}"/>
                            <bm-segment-button value="3 Months" label="{{ $t('COMMON.BM_FILTER_DATE.3_MONTHS') }}"/>
                            <bm-segment-button value="6 Months" label="{{ $t('COMMON.BM_FILTER_DATE.6_MONTHS') }}"/>
                        </bm-segment>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <bm-date-range-selection :value="dateRange">
                            <template #label>Date</template>
                        </bm-date-range-selection>
                    </ion-col>
                </ion-row>
            </div>
        </div>
        <div class="modal_footer">
            <bm-button class="btn02">Cancel</bm-button>
            <bm-button class="btn01">Confirm</bm-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const dateRange = ref<string>("1 Week");

</script>
<style scoped lang="scss">

</style>