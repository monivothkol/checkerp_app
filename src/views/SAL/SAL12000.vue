<template>
	<ion-page>
		<bm-header :title="$t('SAL12000.TITLE')" />
		<bm-content>
			<div class="wrap_content">
				<!-- TODO: create quotation form UI -->
				<bm-button @click="onClickNext">{{ $t("COMMON.BUTTON.NEXT") }}</bm-button>
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: SAL12000
 * Description: Create Quotation
 *
 * ---------------------------------------------------------
 * */
import { SAL12000Request } from "@/interfaces/SAL/SAL12000";
import RouterServices from "@/services/router-services";
import { SharedDataStore } from "@/stores/shared-data";
import { ref } from "vue";

defineOptions({
	name: "SAL12000",
	description: "Create Quotation"
});

const routerService = new RouterServices();

const quotationForm = ref<SAL12000Request>({
	customerName: "",
	quotationDate: "",
	currencyCode: "USD",
	itemList: []
});

const onClickNext = () => {
	SharedDataStore().setItem("SAL12000Form", quotationForm.value);
	routerService.push("/SAL13000");
};
</script>
