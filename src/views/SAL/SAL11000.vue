<template>
	<ion-page>
		<bm-header :title="$t('SAL11000.TITLE')" />
		<bm-content>
			<div class="wrap_content">
				<!-- TODO: quotation list UI -->
				<bm-list :list="quotationList">
					<template #item="{ item }">
						<ion-item button @click="onClickQuotation(item)">
							<ion-label>
								<h2>{{ item.customerName }}</h2>
								<p>{{ item.quotationNo }} · {{ item.quotationDate }}</p>
							</ion-label>
							<ion-note slot="end">{{ item.totalAmount }} {{ item.currencyCode }}</ion-note>
						</ion-item>
					</template>
				</bm-list>
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: SAL11000
 * Description: Quotation List
 *
 * ---------------------------------------------------------
 * */
import { SAL11000Item } from "@/interfaces/SAL/SAL11000";
import QuotationModule from "@/modules/sal-module";
import RouterServices from "@/services/router-services";
import { ref } from "vue";

defineOptions({
	name: "SAL11000",
	description: "Quotation List"
});

const quotationModule = QuotationModule.getInstance();
const routerService = new RouterServices();
const quotationList = ref<SAL11000Item[]>([]);

const loadQuotationList = () => {
	quotationModule.fetchQuotationList({
		body: {},
		enableLoading: true,
		onSuccess: (response) => {
			quotationList.value = response.data?.quotationList ?? [];
		}
	});
};

const onClickQuotation = (item: SAL11000Item) => {
	routerService.push(`/SAL15000?quotationNo=${item.quotationNo}`);
};

defineExpose({ loadQuotationList });
</script>
