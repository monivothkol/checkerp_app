<template>
    <bm-header :back-button="false" :btn-close="!form.isSearchFocused">
        <template #custom>
            <bm-input-search v-if="form.isSearchFocused" ref="inputSearchRef" v-model="form.search" :class="{ 'no_border': form.isSearchFocused }" @focus="form.isSearchFocused = true"></bm-input-search>
        </template>
    </bm-header>
    <bm-content class="bg_white" infinite refresher @infinite="onInfinite" @refresh="onRefresh">
        <!-- Default view: not searching -->
        <div v-if="!form.isSearchFocused">
            <div class="tit_wrapper">
                <h5>{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.SEARCH_ADDRESS') }}</h5>
                <p>{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.KINDLY_PROVIDE_YOUR_ADDRESS_INFORMATION') }}</p>
            </div>
            <div class="formwrap01">
                <ion-row>
                    <ion-col>
                        <div class="inp_search" @click="onClickSearch">
                            <ion-label v-if="!selectedValue">{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.CITY_DISTRICT_OR_POSTAL_CODE') }}</ion-label>
                            <ion-label v-else class="value">{{ selectedValue.label }}</ion-label>
                        </div>
                    </ion-col>
                </ion-row>
            </div>
        </div>

        <!-- Search active view -->
        <div v-if="form.isSearchFocused" class="formwrap">
            <div v-if="form.search.length === 0">
                <bm-empty-state description="{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.TYPE_A_KEYWORD_TO_SEARCH_ADDRESS') }}"></bm-empty-state>
            </div>
            <div v-else-if="resultList.length === 0">
                <bm-empty-state description="{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.NO_RESULTS_FOUND') }}"></bm-empty-state>
            </div>
            <bm-list v-else :list="filteredOptions" class="result_list" @on-click-item="onSelected">
                <template #item="{ item }">
                    <p>{{ item.label }}</p>
                </template>
            </bm-list>
        </div>
    </bm-content>
    <bm-footer>
        <bm-button class="btn02" expand="block" @click="onCancel">{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.CANCEL') }}</bm-button>
        <bm-button class="btn01" expand="block" :disabled-button="disabledConfirmBtn" @click="onConfirm">{{ $t('COMMON.BM_ADDRESS_SELECTION_DETAIL.CONFIRM') }}</bm-button>
    </bm-footer>
</template>
<script setup lang="ts">
import ComModule from "@/modules/com-module";
import DialogUtil from "@/utilities/dialog-util";
import { func } from "@/utilities/func";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { computed, onMounted, ref, nextTick } from "vue";

const resultList = ref<Array<{ label: string, value: string, detail: any }>>([]);
// const selectedValue = ref<string>("");
const comModal = ComModule.getInstance();
// const options = ref<Array<{label: string, value: string}>>([]);
const pageNumber = ref<number>(1);
const selectedValue = ref<any>();

const filteredOptions = computed(() => {

    if (form.value.search) {
        return resultList.value.filter((option) => {
            return option.label.toLowerCase().includes(form.value.search.toLowerCase());
        });
    }

    return resultList.value;
});

const disabledConfirmBtn = computed( () => {
    return !selectedValue.value || Object.keys(selectedValue.value).length === 0;
});

const onInfinite = func( (event: InfiniteScrollCustomEvent) => {
    pageNumber.value++;
    inquiresAddress(pageNumber.value, event);
});

const onRefresh = func( (event: RefresherCustomEvent) => {
    inquiresAddress(1, event);
});

onMounted(() => {
    inquiresAddress(1);
});
const form = ref({
    search: "",
    cityProvince: "",
    commune: "",
    district: "",
    village: "",
    isSearchFocused: false,
});

const inquiresAddress = func((pageNumber: number, event?: any) => {
    comModal.searchAddress({
        body: {
            pageNumber: pageNumber,
            pageSize: 30
        },
        enableLoading: pageNumber === 1,
        onSuccess: (response) => {
            resultList.value = [];
            for (const element of response.list) {
                resultList.value.push({
                    label: `${element.villageCode}: ${element.villageNameEn}, ${element.communeNameEn}, ${element.districtNameEn}, ${element.provinceNameEn}`,
                    value: element.villageCode,
                    detail: element
                });
            }
            BizCheckMobileLogger.log("", resultList.value);
            if (event) event.target.complete();
        }
    });
});

const onConfirm = func( () => {
    DialogUtil.closeModal({role: "confirm", data: selectedValue.value});
});

const onCancel = func( () => {
    DialogUtil.closeModal({role: "cancel"});
});

const onSelected = func( (value: any) => {
    selectedValue.value = value;
    form.value.isSearchFocused = false;
    form.value.search = "";
});

const inputSearchRef = ref<InstanceType<typeof import("@/components/TextFields/bm-input-search.vue").default> | null>(null);


const onClickSearch = async () => {
    form.value.isSearchFocused = true;
    await nextTick();
    setTimeout(async () => {
        if (inputSearchRef.value?.focus) {
            await inputSearchRef.value.focus();
        } else if (inputSearchRef.value?.$el?.setFocus) {
            await inputSearchRef.value.$el.setFocus();
        }
    }, 150);
};

</script>
<style scoped lang="scss">
/* .component_group { display: flex; flex-direction: column; gap: 16px;}
.selection_group { display: flex; align-items: center; gap: 12px;
    label { font-weight: 500; color: var(--ion-color-dark);
        &.disabled { opacity: 0.6; }
    }
}
.txt_message { font-size: var(--font14); font-weight: 500; line-height: 18px; color: #999999;}
.modal_header { flex-direction: column; gap: 8px;} */

    .tit_wrapper {
        h5 { font-size: var(--font20); font-weight: 700; line-height: 140%; color: var(--fontColor01); margin-bottom: 8px;}
        p { font-size: var(--font14); font-weight: 400; line-height: 140%; color: var(--fontColor03); }
    }

    .inp_search { background: #FFFFFF url("@/assets/images/ico_btn_search.svg") right 12px center no-repeat; display: flex; min-height: 44px; padding: 16px 32px 12px 12px; justify-content: space-between; align-items: center; align-self: stretch; border-radius: var(--radius8); border: 1px solid var(--Border, #D9D9D9);
        ion-label { font-size: var(--font14); font-weight: 500; line-height: 140%; color: #CCCCCC; }
        .value { font-size: var(--font14); font-weight: 500; line-height: 140%; color: var(--fontColor01); }
    }

    .result_list {
        p { font-size: var(--font16); font-weight: 400; line-height: 140%; color: var(--fontColor01);
            em { font-weight: 700;}
        }
    }
</style>