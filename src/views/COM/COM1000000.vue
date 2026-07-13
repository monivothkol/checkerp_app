<template>

<div class="modal_wrapper"  >
		<div class="modal_header">
			<ion-label>{{ $t('COM1000000.TITLE') }}</ion-label>
			<bm-button class="btn_head_close type02" @click="onCancelClick()">{{ $t('COM1000000.BUTTON.CLOSE') }}</bm-button>
		</div>
		<div class="modal_content">
			<ion-content ref="contentWrapper" style="min-height: 490px; overflow-y: hidden;">
				<div class="wrap_content">
					<div class="formwrap01">
						<ion-row>
							<ion-col>
								<bm-input v-model="inputKeyword" type="text" :placeholder="$t('COM1000000.PLACEHOLDER.SEARCH_ADDRESS')" :debounce="1000" @on-input="handleInput($event)"></bm-input>
							</ion-col>
						</ion-row>
					</div>
					<bm-list :list="results" :total-count="totalCount" :infinite-scroll="false" class="marTop20 list_industry_category">
						<template #item="{ item }">
							<p @click="onSelectAddres(item)"><b>{{ item.villageCode }}</b> : {{ item.villageNameEn }}, {{ item.communeNameEn }}, {{ item.districtNameEn }}, {{ item.provinceNameEn }}</p>
						</template>
					</bm-list>
					<ion-infinite-scroll :disabled="isDisabledInfinite" threshold="100px" @ion-infinite="onInfinite($event)">
						<ion-infinite-scroll-content loading-spinner="crescent"></ion-infinite-scroll-content>
					</ion-infinite-scroll>
				</div>
			</ion-content>
		</div>
	</div>

</template>
<script setup lang="ts">
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { ref, onMounted } from "vue";
import { InfiniteScrollCustomEvent } from "@ionic/vue";
import DialogUtil from "@/utilities/dialog-util";
import ComModule from "@/modules/com-module";
import { COM1000000Item, COM1000000Response } from "@/interfaces/COM/COM1000000";
const comModule = ComModule.getInstance();
const results = ref<COM1000000Item[]>([]);
const currentPage = ref<number>(1);
const pageSize = ref<number>(15);
const contentWrapper = ref<any>(null);
const totalCount = ref<number>(0);
const isDisabledInfinite = ref<boolean>(false);
const inputKeyword = ref<string>("");
const handleInput = (event: any) => {
	BizCheckMobileLogger.info("handleInput: ", event);
	currentPage.value = 1;
	results.value = [];
	totalCount.value = 0;
	isDisabledInfinite.value = false;
	fetchAddressCustomer();
};
const onInfinite = (event: InfiniteScrollCustomEvent) => {
	currentPage.value++;
	if(totalCount.value > results.value.length) {
		fetchAddressCustomer(event);
	} else {
		isDisabledInfinite.value = true;
	}
	setTimeout(() => {
		event.target.complete();
	}, 500);
};


const fetchAddressCustomer = (event?: any) => {
	BizCheckMobileLogger.info("fetchAddressCustomer: ", inputKeyword.value);
	comModule.searchAddress({
		body: {
			keyword: inputKeyword.value ?? "",
			pageNumber: currentPage.value,
			pageSize: pageSize.value,
		},
		enableLoading: false,
		onSuccess: (response: COM1000000Response) => {
			totalCount.value = response.totalCount;
			if(currentPage.value > 1) {
				results.value = [...results.value, ...response.list];
			} else {
				results.value = response.list;
			}

			BizCheckMobileLogger.log("results", results.value.length , "totalCount", totalCount.value, response.list.length);
			if(response.list.length < pageSize.value) {
				isDisabledInfinite.value = true;
			}
			if(event) {
				setTimeout(() => {
					event.target.complete();
				}, 500);
			}
		},
	});
};

const onSelectAddres = (result: COM1000000Item) => {
	BizCheckMobileLogger.log("result", result);
	DialogUtil.closeModal({ role: "confirm", data: result });
	DialogUtil.closeAllModals();
};
const onCancelClick = () => {
	DialogUtil.closeModal({ role: "cancel" });
	DialogUtil.closeAllModals();
};
onMounted(() => {
	fetchAddressCustomer();
});
</script>

