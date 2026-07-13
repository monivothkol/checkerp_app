<template>
    <div class="chart-container">
        <div class="chart">
            <Pie :options="chartOptions" :data="chartData" />
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Author: Rethysen
 * Credit From: Chansopheaktra
 * Component: pie-chart
 * Create on: 10/23/2024
 * Description: Common Pie Chart
 * Last Modified on: 12/31/2024
 *
 * @example
 * <pie-chart :config="chartData.pie"></pie-chart>
 *
 * @prop {object}        config
 * @prop {string[]}      config.labels
 * @prop {Array<Object>} config.datas
 * @prop {string}        config.datas[].label
 * @prop {number[]}      config.datas[].data
 * @prop {string[]}      config.datas[].backgroundColor
 *
 * */
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { computed } from "vue";
import { Pie } from "vue-chartjs";

ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface Props {
    config: {
        labels: string[];
        datas: Array<{ data: number[]; backgroundColor?: string[] }>;
    }
}

const props = defineProps<Props>();
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorPrimary");
const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorSecondary");
const defaultbgColor = [secondaryColor, primaryColor];
const chartData = computed(() => {
    return {
        labels: props.config.labels,
        datasets: props.config.datas.map( (data, index) => ({
            label: props.config.labels[index],
            data: data.data,
            backgroundColor: data.backgroundColor || defaultbgColor,
            hoverOffset: 4
        }))
    };
});

// Create reactive chart options using `ref`
const chartOptions = computed((): any => {
    return {
        responsive: true,
        maintainAspectRatio: true,
        devicePixelRatio: 2,
        plugins: {
            datalabels: { display: false },
            legend: {
                display: true,
                position: "bottom" as const,
                labels: {
                    boxWidth: 10,
                    font: { size: 12 }
                }
            }
        },
        tooltip: {
            enabled: true
        }
    };
});

</script>
<style lang="scss" scoped>
.chart-container {
    display: flex;
    flex-direction: inherit;
    align-items: center;
    justify-content: center;
}
.chart {
    width: 200px;
    height: 200px;
}
</style>
