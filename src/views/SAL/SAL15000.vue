<template>
	<ion-page>
		<bm-header :title="$t('SAL15000.TITLE')" />
		<bm-content>
			<div class="wrap_content">
				<!-- TODO: quotation detail UI -->
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: SAL15000
 * Description: Quotation Detail
 *
 * ---------------------------------------------------------
 * */
import { SAL15000Detail } from "@/interfaces/SAL/SAL15000";
import QuotationModule from "@/modules/sal-module";
import RouterServices from "@/services/router-services";
import { onMounted, ref } from "vue";

defineOptions({
	name: "SAL15000",
	description: "Quotation Detail"
});

const quotationModule = QuotationModule.getInstance();
const routerService = new RouterServices();
const quotationDetail = ref<SAL15000Detail | null>(null);

onMounted(() => {
	const quotationNo = routerService.getQueryParam("quotationNo");
	if (!quotationNo) return;

	quotationModule.fetchQuotationDetail({
		body: { quotationNo },
		enableLoading: true,
		onSuccess: (response) => {
			quotationDetail.value = response.data;
		}
	});
});
</script>
