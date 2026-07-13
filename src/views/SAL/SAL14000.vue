<template>
	<ion-page>
		<bm-header :title="$t('SAL14000.TITLE')" :back-button="false" />
		<bm-content>
			<div class="wrap_content">
				<!-- TODO: quotation result UI -->
				<bm-button @click="onClickDone">{{ $t("COMMON.BUTTON.OK") }}</bm-button>
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: SAL14000
 * Description: Create Quotation Result
 *
 * ---------------------------------------------------------
 * */
import QuotationModule from "@/modules/sal-module";
import RouterServices from "@/services/router-services";
import { SharedDataStore } from "@/stores/shared-data";
import { onMounted, ref } from "vue";

defineOptions({
	name: "SAL14000",
	description: "Create Quotation Result"
});

const quotationModule = QuotationModule.getInstance();
const routerService = new RouterServices();
const quotationNo = ref<string>("");

onMounted(() => {
	const createdQuotationNo = SharedDataStore().getItem("SAL14000QuotationNo") as string;
	if (!createdQuotationNo) return;

	quotationModule.fetchQuotationResult({
		body: { quotationNo: createdQuotationNo },
		enableLoading: true,
		onSuccess: (response) => {
			quotationNo.value = response.data?.quotationNo ?? "";
		}
	});
});

const onClickDone = () => {
	routerService.push("/SAL11000");
};
</script>
