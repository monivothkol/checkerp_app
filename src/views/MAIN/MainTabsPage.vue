<template>
	<ion-page>
		<ion-tabs @ion-tabs-did-change="onTabsDidChange">
			<ion-router-outlet />
			<ion-tab-bar slot="bottom" class="tab_bar">
				<ion-tab-button :class="getActiveTab('home')" tab="home" href="/main/home">
					<ion-icon :icon="homeOutline" />
					<ion-label>Home</ion-label>
				</ion-tab-button>
				<ion-tab-button :class="getActiveTab('invoice')" tab="invoice" href="/main/invoice">
					<ion-icon :icon="receiptOutline" />
					<ion-label>Invoice</ion-label>
				</ion-tab-button>
				<ion-tab-button :class="getActiveTab('product')" tab="product" href="/main/product">
					<ion-icon :icon="cubeOutline" />
					<ion-label>Product</ion-label>
				</ion-tab-button>
				<ion-tab-button :class="getActiveTab('pos')" tab="pos" href="/main/pos">
					<ion-icon :icon="cartOutline" />
					<ion-label>POS</ion-label>
				</ion-tab-button>
				<ion-tab-button :class="getActiveTab('menu')" tab="menu" href="/main/menu">
					<ion-icon :icon="listOutline" />
					<ion-label>Menu</ion-label>
				</ion-tab-button>
			</ion-tab-bar>
		</ion-tabs>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: MainTabsPage
 * Description: #
 *
 * ---------------------------------------------------------
 * */
import { cartOutline, cubeOutline, homeOutline, listOutline, receiptOutline } from "ionicons/icons";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

defineOptions({
	name: "MainTabsPage",
	description: "Main bottom-tab shell"
});

const route = useRoute();
const currentTab = ref<string>("home");

watch(() => route.fullPath, (path) => {
	if (path.startsWith("/main/home")) currentTab.value = "home";
	else if (path.startsWith("/main/invoice")) currentTab.value = "invoice";
	else if (path.startsWith("/main/product")) currentTab.value = "product";
	else if (path.startsWith("/main/pos")) currentTab.value = "pos";
	else if (path.startsWith("/main/menu")) currentTab.value = "menu";
}, { immediate: true });

const onTabsDidChange = (ev: CustomEvent) => {
	const tab = (ev.detail as { tab?: string })?.tab;
	if (tab) currentTab.value = tab;
};

const getActiveTab = computed(() => {
	return (tab: string) => (currentTab.value === tab ? "selected" : "");
});
</script>

<style scoped lang="scss">
.tab_bar {
	min-height: 64px;
	border: none;
	--background: #ffffff;
	box-shadow: 0 -4px 24px 0 #f1f1f9;
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	justify-content: space-evenly;

	ion-tab-button {
		--background: transparent;
		--color: #9e9e9e;
		--color-selected: #6a1b9a;
		max-width: 72px;

		ion-icon { font-size: 22px; }
		ion-label { font-size: 11px; margin-top: 2px; }

		&.selected {
			ion-label { color: #6a1b9a; font-weight: 700; }
			ion-icon { color: #6a1b9a; }
		}
	}
}
</style>
