<template>
	<ion-page>
		<bm-header :title="$t('SAL13000.TITLE')" />
		<bm-content>
			<div class="wrap_content">
				<!-- TODO: quotation confirm summary UI -->
				<bm-button @click="onClickConfirm">{{ $t("COMMON.BUTTON.CONFIRM") }}</bm-button>
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: SAL13000
 * Description: Create Quotation Confirm
 *
 * ---------------------------------------------------------
 * */
import { SAL13000Request } from "@/interfaces/SAL/SAL13000";
import QuotationModule from "@/modules/sal-module";
import RouterServices from "@/services/router-services";
import { SharedDataStore } from "@/stores/shared-data";

defineOptions({
	name: "SAL13000",
	description: "Create Quotation Confirm"
});

const quotationModule = QuotationModule.getInstance();
const routerService = new RouterServices();

const onClickConfirm = () => {
	const form = SharedDataStore().getItem("SAL12000Form") as SAL13000Request;

	quotationModule.confirmQuotation({
		body: form,
		enableLoading: true,
		onSuccess: (response) => {
			SharedDataStore().setItem("SAL14000QuotationNo", response.data?.quotationNo);
			routerService.push("/SAL14000");
		}
	});
};
</script>
