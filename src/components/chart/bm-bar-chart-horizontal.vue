<template>
    <div class="chart-container">
        <div class="chart">
            <Bar :id="annotationID" :data="chartData" :options="chartOptions" />
        </div>
        <div class="progress-label">
            {{ completed.toLocaleString() }}/{{ total.toLocaleString() }} {{ props.config.currency ? props.config.currency : "" }} ({{ props.config.percentage ?? percent }}%)
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ChartUtil } from "@/utilities/chart-util";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import datalabels from "chartjs-plugin-datalabels";
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, datalabels);

const props = defineProps<{
    config: {
        totalTarget: number;
        currentTarget: number;
        currency: string;
		percentage?: number;
    },

}>();


const annotationID = ref(ChartUtil.generateUniqueID());

const completed: number = props.config?.currentTarget || 0;
const total: number = props.config?.totalTarget || 0;
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorPrimary");
const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorSecondary");

const percent = Math.round((completed / total) * 100);

const chartData = computed(() => {
    const remaining = completed === total ? 0.0001 : total - completed;
    return {
        labels: [""],
        datasets: [
            {
                data: [completed],
                backgroundColor: primaryColor,
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            },
            {
                data: [remaining],
                backgroundColor: secondaryColor,
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            }
        ]
    };
});

const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
        datalabels: { display: false },
        legend: { display: false },
        tooltip: { enabled: false }
    },
    scales: {
        x: { display: false, stacked: true, max: total },
        y: { display: false, stacked: true }
    }
};
</script>
<style lang="scss" scoped>
.chart {
    height: 10px;
    width: 100%;
    position: relative;
    border-radius: 10px;
    canvas {
        border-radius: 10px;
        width: 100% !important;
        height: 100% !important;
    }
}

.progress-label {
    display: flex;
    text-align: end;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    justify-content: end;
	margin-top: 5px;
}
</style>
