<template>
	<ion-page>
		<bm-header title="Dashboard" />
		<bm-content>
			<div class="wrap_content">
				<!-- Revenue summary -->
				<div class="stat_panel">
					<div class="stat_card">
						<span class="stat_label">This Month</span>
						<span class="stat_value">{{ money(dashboard.thisMonthRevenue) }}</span>
					</div>
					<div class="stat_card">
						<span class="stat_label">This Week</span>
						<span class="stat_value">{{ money(dashboard.thisWeekRevenue) }}</span>
					</div>
					<div class="stat_card">
						<span class="stat_label">Today Revenue</span>
						<span class="stat_value">{{ money(dashboard.todayRevenue) }}</span>
					</div>
					<div class="stat_card">
						<span class="stat_label">Today Actual Payment</span>
						<span class="stat_value">{{ money(dashboard.todayActualPayment) }}</span>
					</div>
				</div>

				<!-- Date filter (visual test: bm-date-single-select) -->
				<div class="date_card">
					<bm-date-single-select v-model="selectedDate" placeholder="Select Date">
						<template #label>Dashboard Date</template>
					</bm-date-single-select>
					<p v-if="selectedDate" class="date_value">Selected: {{ selectedDate }}</p>
				</div>

				<!-- Menu tiles -->
				<div class="menu_grid">
					<div v-for="item in menuItems" :key="item.label" class="menu_tile" @click="onClickMenu(item)">
						<ion-icon :icon="item.icon" class="menu_icon" />
						<span class="menu_label">{{ item.label }}</span>
					</div>
				</div>

				<!-- Daily Sale Profit -->
				<div class="chart_card">
					<h3 class="chart_title">Daily Sale Profit (Last 7 Days)</h3>
					<bm-line-chart v-if="profitChart.labels.length" :config="profitChart" />
				</div>

				<!-- Top 5 Sold Product -->
				<div class="chart_card">
					<h3 class="chart_title">Top 5 Sold Product</h3>
					<bm-bar-chart v-if="topProductChart.labels.length" :config="topProductChart" />
					<p v-else class="chart_empty">No sales in the last 30 days</p>
				</div>
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Component: DAS10000
 * Description: Dashboard (home)
 *
 * ---------------------------------------------------------
 * */
import { DAS10000Response } from "@/interfaces/DAS/DAS10000";
import DashboardModule from "@/modules/das-module";
import RouterServices from "@/services/router-services";
import DialogUtil from "@/utilities/dialog-util";
import { onIonViewWillEnter } from "@ionic/vue";
import {
	calendarOutline, cardOutline, cubeOutline, documentTextOutline,
	fingerPrintOutline, peopleOutline, readerOutline, swapHorizontalOutline, trendingUpOutline
} from "ionicons/icons";
import { reactive, ref } from "vue";

defineOptions({
	name: "DAS10000",
	description: "Dashboard"
});

const dashboardModule = DashboardModule.getInstance();
const routerService = new RouterServices();
const selectedDate = ref<string>("");

const dashboard = ref<DAS10000Response>({
	todayRevenue: 0,
	thisWeekRevenue: 0,
	thisMonthRevenue: 0,
	todayActualPayment: 0,
	dailySaleProfit: [],
	topProducts: []
});

const profitChart = reactive<{ labels: string[]; currency: string; datas: { label?: string; data: number[] }[] }>({
	labels: [],
	currency: "USD",
	datas: []
});
const topProductChart = reactive<{ labels: string[]; datas: { label?: string; data: number[] }[] }>({
	labels: [],
	datas: []
});

interface MenuItem { label: string; icon: string; route?: string }
const menuItems: MenuItem[] = [
	{ label: "Stock", icon: cubeOutline },
	{ label: "Transfer", icon: swapHorizontalOutline },
	{ label: "Purchase-In", icon: cardOutline },
	{ label: "Check-In", icon: fingerPrintOutline },
	{ label: "Attendant", icon: peopleOutline },
	{ label: "Leave", icon: calendarOutline },
	{ label: "Profit & Lost", icon: trendingUpOutline },
	{ label: "Balance Sheet", icon: readerOutline },
	{ label: "Quotation", icon: documentTextOutline, route: "/SAL11000" }
];

const money = (value: number | undefined) => `$${Number(value ?? 0).toFixed(2)}`;

const loadDashboard = () => {
	dashboardModule.fetchDashboard({
		body: {},
		enableLoading: true,
		onSuccess: (response) => {
			dashboard.value = response;
			profitChart.labels = response.dailySaleProfit.map(d => d.label);
			profitChart.datas = [{ label: "Profit", data: response.dailySaleProfit.map(d => Number(d.profit)) }];
			topProductChart.labels = response.topProducts.map(p => p.productName);
			topProductChart.datas = [{ label: "Qty", data: response.topProducts.map(p => Number(p.quantity)) }];
		}
	});
};

const onClickMenu = (item: MenuItem) => {
	if (item.route) {
		routerService.push(item.route);
	} else {
		DialogUtil.showToast({ message: `${item.label} is coming soon` });
	}
};

onIonViewWillEnter(() => {
	loadDashboard();
});
</script>

<style scoped lang="scss">

.stat_panel { margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: linear-gradient(160deg, #8e24aa, #6a1b9a); border-radius: 16px; padding: 12px; }
.stat_card { display: flex; flex-direction: column; gap: 4px; background: rgba(255, 255, 255, 0.14); border-radius: 12px; padding: 12px; }
.stat_label { font-size: 12px; color: #f3e5f5; }
.stat_value { font-size: 16px; font-weight: 700; color: #ffffff; }

.date_card { margin-bottom: 16px; border: 1px solid #ce93d8; border-radius: 12px; padding: 12px; background: #ffffff; }
.date_value { font-size: 12px; color: #6a1b9a; margin: 8px 0 0; }

.menu_grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.menu_tile {
	display: flex; flex-direction: column; align-items: center; gap: 8px;
	border: 1px solid #ce93d8; border-radius: 12px; padding: 12px 8px;
	background: #f7f0fa; cursor: pointer;
}
.menu_icon { font-size: 28px; color: #6a1b9a; }
.menu_label { font-size: 12px; color: #333333; text-align: center; }

.chart_card { border: 1px solid #b3e5fc; border-radius: 12px; padding: 12px; background: #ffffff; }
.chart_title { font-size: 14px; font-weight: 600; text-align: center; margin: 0 0 8px; }
.chart_empty { font-size: 12px; color: #888888; text-align: center; padding: 16px 0; }
</style>
