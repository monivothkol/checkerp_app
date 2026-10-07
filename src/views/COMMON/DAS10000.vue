<template>
	<ion-page>
		<bm-header title="Dashboard" default-href="/main/menu" />
		<ion-content>
			<ion-refresher slot="fixed" @ion-refresh="onRefresh($event)">
				<ion-refresher-content />
			</ion-refresher>

			<div class="das_stats">
				<div v-for="s in stats" :key="s.label" class="das_stat">
					<p>{{ s.label }}</p>
					<strong>{{ money(s.value) }}</strong>
				</div>
			</div>

			<section class="das_card">
				<h3>Weekly Sales Trend (Last 8 Weeks)</h3>
				<div class="das_chart"><Bar :data="weeklyChart" :options="barOptions" /></div>
			</section>
			<section class="das_card">
				<h3>Daily Sale Profit (Last 7 Days)</h3>
				<div class="das_chart"><Bar :data="dailyChart" :options="barOptions" /></div>
			</section>
			<section class="das_card">
				<h3>Top Products by Sales (30 Days)</h3>
				<p class="das_sub">by {{ identifierLabel }}</p>
				<div v-if="dashboard.topProducts.length" class="das_chart"><Bar :data="topProductsChart" :options="hBarOptions" /></div>
				<p v-else class="das_empty">No sales in the last 30 days</p>
			</section>
			<section class="das_card">
				<h3>Top Profit Items (30 Days)</h3>
				<p class="das_sub">by {{ identifierLabel }}</p>
				<div v-if="dashboard.topProfitItems.length" class="das_chart"><Bar :data="topProfitChart" :options="hBarOptions" /></div>
				<p v-else class="das_empty">No sales in the last 30 days</p>
			</section>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip, type ChartOptions, type TooltipItem } from "chart.js";
import type { RefresherCustomEvent } from "@ionic/vue";
import HttpNetworkService from "@/services/http-network-service";
import POP from "@/core/utilities/pop";
import { useViewEnter } from "@/core/modules/use-view-enter";
import type { DashboardData } from "@/models/COMMON/DAS10000";

/**
 * DAS10000 — store dashboard (DAS10000I01): revenue tiles, 8-week trend, 7-day revenue/profit, 30-day top products/profit.
 * Same vue-chartjs bars as the web: the bm-chart-* components are stacked/vertical-only and can't show grouped or horizontal bars.
 */
defineOptions({ name: "DAS10000" });

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

type Row = Record<string, unknown>;
const num = (v: unknown): number => Number(v ?? 0);
const usd = (v: number): string => "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
const money = (v: number): string => "$" + num(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const label = (r: Row, k: string): string => String(r[k] ?? "");
// Product label as two lines (Chart.js renders a string[] label on separate lines): name, then code.
const productLabel = (r: Row): string[] => {
	const code = String(r.productCode ?? "").trim();
	const name = String(r.productName ?? "");
	return code ? [name, code] : [name];
};

const dashboard = ref<DashboardData>({
	todayRevenue: 0, thisWeekRevenue: 0, thisMonthRevenue: 0, todayActualPayment: 0,
	dailySaleProfit: [], topProducts: [], topProfitItems: [], weeklyTrend: [], productIdentifier: "PRODUCT_CODE"
});

const stats = computed(() => [
	{ label: "This Month", value: dashboard.value.thisMonthRevenue },
	{ label: "This Week", value: dashboard.value.thisWeekRevenue },
	{ label: "Today Revenue", value: dashboard.value.todayRevenue },
	{ label: "Today Actual Payment", value: dashboard.value.todayActualPayment }
]);
const identifierLabel = computed(() => (dashboard.value.productIdentifier === "BARCODE" ? "Barcode" : "Code"));

const barOptions: ChartOptions<"bar"> = {
	responsive: true, maintainAspectRatio: false,
	plugins: {
		legend: { display: true, position: "top" },
		tooltip: { callbacks: { label: (c: TooltipItem<"bar">) => `${c.dataset.label}: ${usd(c.parsed.y ?? 0)}` } }
	},
	scales: { y: { beginAtZero: true, ticks: { callback: (v: number | string) => usd(Number(v)) } } }
};
const hBarOptions: ChartOptions<"bar"> = {
	indexAxis: "y", responsive: true, maintainAspectRatio: false,
	plugins: {
		legend: { display: false },
		tooltip: { callbacks: { label: (c: TooltipItem<"bar">) => `${c.dataset.label}: ${usd(c.parsed.x ?? 0)}` } }
	},
	scales: { x: { beginAtZero: true, ticks: { callback: (v: number | string) => usd(Number(v)) } } }
};

const weeklyChart = computed(() => {
	const rows = dashboard.value.weeklyTrend ?? [];
	return { labels: rows.map((r) => label(r, "label")), datasets: [{ label: "Revenue ($)", backgroundColor: "#3b82f6", data: rows.map((r) => num(r.revenue)) }] };
});
const dailyChart = computed(() => {
	const rows = dashboard.value.dailySaleProfit ?? [];
	return {
		labels: rows.map((r) => label(r, "label")),
		datasets: [
			{ label: "Revenue ($)", backgroundColor: "#3b82f6", data: rows.map((r) => num(r.revenue)) },
			{ label: "Profit ($)", backgroundColor: "#22c55e", data: rows.map((r) => num(r.profit)) }
		]
	};
});
const topProductsChart = computed(() => {
	const rows = dashboard.value.topProducts ?? [];
	return { labels: rows.map(productLabel), datasets: [{ label: "Sales ($)", backgroundColor: "#f59e0b", data: rows.map((r) => num(r.amount)) }] };
});
const topProfitChart = computed(() => {
	const rows = dashboard.value.topProfitItems ?? [];
	return { labels: rows.map(productLabel), datasets: [{ label: "Profit ($)", backgroundColor: "#22c55e", data: rows.map((r) => num(r.profit)) }] };
});

function loadDashboard(): Promise<void> {
	return new Promise((resolve) => {
		HttpNetworkService.getInstance().request({
			trCode: "DAS10000I01",
			reqBody: {},
			enableLoading: true,
			listener: {
				onSuccess: (payload: DashboardData) => { dashboard.value = payload; resolve(); },
				onFail: (error: { message?: string; code?: string }) => { POP.apiError(error, "Dashboard"); resolve(); }
			}
		});
	});
}

useViewEnter(() => void loadDashboard());
async function onRefresh(ev: RefresherCustomEvent): Promise<void> { await loadDashboard(); await ev.target.complete(); }
</script>

<style scoped>
.das_stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px 16px 0; }
.das_stat { background: var(--ion-color-light); border-radius: 8px; padding: 12px; }
.das_stat p { margin: 0 0 4px; font-size: 12px; color: var(--ion-color-medium); }
.das_stat strong { font-size: 16px; }
.das_card { margin: 16px; padding: 12px; border: 1px solid var(--ion-color-light-shade); border-radius: 8px; }
.das_card h3 { margin: 0; font-size: 14px; font-weight: 600; }
.das_sub { margin: 2px 0 0; font-size: 12px; color: var(--ion-color-medium); }
.das_chart { height: 240px; position: relative; margin-top: 8px; }
.das_empty { margin: 16px 0 4px; font-size: 12px; text-align: center; color: var(--ion-color-medium); }
</style>
