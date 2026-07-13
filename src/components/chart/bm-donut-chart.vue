<template>
    <div class="chart-container">
        <div class="chart">
            <Doughnut :id="annotationID" :data="chartData" :options="chartOptions"/>
        </div>
        <div class="legend">
            <ul>
                <li v-for="(_, i) in chartData.labels" :key="i"> {{ getPercentage(i) }}% </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Author: Rethysen
 * Credit From: Chansopheaktra
 * Component: donut-chart
 * Create on: 11/13/2024
 * Description: Common Donut Chart
 * Last Modified on: 11/19/2024
 * 
 * @example
 * <donut-chart :config="chartData.donut"></donut-chart>
 * 
 * @prop {object}        config
 * @prop {string[]}      config.labels
 * @prop {Array<Object>} config.datas 
 * @prop {string}        config.datas[].label
 * @prop {number[]}      config.datas[].data
 * @prop {string[]}      config.datas[].backgroundColor
 * 
 * */
import { ChartUtil } from "@/utilities/chart-util";
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { computed, ref } from "vue";
import { Doughnut } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);


interface ChartData {
    data: number[];
}
interface Props {
    config: {
        labels: string[],
        datas: Array<ChartData>,
        backgroundColor?: string[]
    }
}
const props = defineProps<Props>();

const annotationID = ref(ChartUtil.generateUniqueID());

const getPercentage = (index: number) => {
    const data = chartData.value.datasets[0].data;
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((data[index] / total) * 100);
};

// Create reactive chart data using `ref`
const chartData = computed(() => {
    // Use the first dataset from config.datas
    const dataset = props.config.datas[0];
    return {
        labels: props.config.labels,
        datasets: [{
            data: dataset.data,
            backgroundColor: props.config.backgroundColor || ["#8979FF", "#FF928A","#3CC3DF", "#FFAE4C"],
            hoverOffset: 4
        }]
    };
});

// Create reactive chart options using `ref`
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: true,
    devicePixelRatio: 2,
    title: {
        display: true,
        text: "My First Dataset",
        fontSize: 20,
        fontColor: "#000000"
    },
    plugins: {
        datalabels: { display: false },
        legend: {
            display: true,
            position: "right" as const,
            labels: {
                boxWidth: 10,
                font: {
                    size: 12
                }
            }
        },
    },
    tooltip: { enabled: true }
}));
</script>
<style lang="scss" scoped>
.legend {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.chart-container {
    display: flex;
    flex-direction: inherit;
    align-items: center;
    justify-content: center;
}
:deep(.legend ul) {
    list-style: none;
    padding: 0;
    margin: 0;
}
:deep(.legend ul li) {  
    display: flex;
    align-items: start;
    justify-content: start;
}
.chart {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>