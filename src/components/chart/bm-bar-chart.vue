<template>
    <div class="chart-container">
        <Bar :id="annotationID" :options="chartOptions" :data="chartData"/>
    </div>
</template>

<script lang="ts" setup>
import { ChartUtil } from "@/utilities/chart-util";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { computed, ref } from "vue";
import { Bar } from "vue-chartjs";
import datalabels from "chartjs-plugin-datalabels";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, datalabels);

const props = defineProps<{
    config: {
        labels: string[],
        datas: { label?: string, data: number[], backgroundColor?: string }[]
    }
}>();


const annotationID = ref(ChartUtil.generateUniqueID());
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorPrimary");
const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--colorSecondary");
const defaultbgColor = [secondaryColor, primaryColor];

const chartData = computed(() => {
    return {
        labels: props.config.labels,
        datasets: props.config.datas.map( (data, index) => ({
            label: data.label,
            data: data.data,
            backgroundColor: data.backgroundColor || defaultbgColor[index]
        }))
    };
});

const chartOptions = {
    responsive: true,
    scales: {
        y: {
            stacked: true,
            ticks: {
                color: "#00aaff",
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                font: {
                    size: 9 // Set your desired font size here
                }
            }
        },
        x: {
            stacked: true,
            ticks: {
                color: "#00aaff",
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                font: {
                    size: 9 // Set your desired font size here
                }
            }
        }
    },
    plugins: {
        datalabels: {
            display: false
        },
        legend: {
            display: false
        },
        tooltip: {
            enabled: true
        }
    }
};
</script>
