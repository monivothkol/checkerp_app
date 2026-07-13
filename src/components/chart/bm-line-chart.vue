<template>
    <!-- Author: Chansopheaktra Component: line-chart Created on: 10/23/2024 -->
    <div class="chart-container">
        <Line :id="chartID" :options="chartOptions" :data="chartData" :plugins="[ChartUtil.verticalAnnotationPlugin(chartID, 'line'), HTMLLegendPlugin]" />
    </div>
</template>

<script setup lang="ts">
/**
 * Author: Chansopheaktra
 * Component: line-chart
 * Create on: 10/23/2024
 * Description: Common Line Chart
 * Last Modified on: 11/20/2024
 *
 * @example
 * <line-chart :config="chartData.line"></line-chart>
 *
 * @prop {object}        config
 * @prop {string[]}      config.labels
 * @prop {string}        config.currency ("USD" | "KHR")
 * @prop {Array<Object>} config.datas
 * @prop {string}        config.datas[].label
 * @prop {number[]}      config.datas[].data
 * @prop {boolean}       showLegend
 *
 * */
import { Line } from "vue-chartjs";
import { computed, ref } from "vue";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Chart } from "chart.js";
import chartDataLabels from "chartjs-plugin-datalabels";
import annotationPlugin from "chartjs-plugin-annotation";
import { ChartUtil } from "@/utilities/chart-util";
import { BizCheckMobileLogger, BizCheckMobileString } from "@/shared/bizcheckmobile";

ChartJS.register(chartDataLabels, annotationPlugin, Tooltip, CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface Props {
    config: {
        labels: string[];
        currency: string;
        datas: Array<{ data: number[] }>;
    }
}
const props = defineProps<Props>();

// Create reactive chart data using `ref`
const chartID = ref(ChartUtil.generateUniqueID());
const legendID = ref(ChartUtil.generateUniqueID());
const legendContainerID = ref(ChartUtil.generateUniqueID());
const chartData = computed(() => {
    return {
        labels: props.config.labels,
        datasets: ChartUtil.generateDatasets(props.config.datas)
    };
});

// Create reactive chart options using `ref`
const chartOptions = computed((): any => {
    return {
        responsive: true,
        maintainAspectRatio: true,
        devicePixelRatio: 2, // make the line smooth by increasing device pixel ratio
        scales: {
            x: {
                // grid: { display: false },
                ticks: {
                    color: "#666",
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                }
            },
            y: {
                beginAtZero: true,
                grace: "50%",
                ticks: {
                    color: "#666",
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: false,
                },
                border: { display: false },
            }
        },
        plugins: {
            datalabels: { display: false },
            tooltip: {
                enabled: false, // disable default tooltip
                position: "average",
                external: (args: any) => {
                    return tooltipHandler(args);
                }
            },
            legend: { display: false },
            [legendID.value]: {
                containerID: legendContainerID.value,
            }
        },
        interaction: {
            intersect: false,
            mode: "nearest",
            axis: "xy"
        },
    };
});

const tooltipHandler = (context: any) => {
    ChartUtil.generateTooltip(context, (tooltip: any, el: any) => {
        if (tooltip.body && tooltip.dataPoints.length > 0) {
            const seenValues = new Set(); // avoid duplicates
            const tableBody = document.createElement("tbody");

            tooltip.dataPoints.forEach((dataPoint: any) => {
                // const title = tooltip.title[0] || "";
                const label = dataPoint.dataset.label;
                // const rawValue = dataPoint.raw;
                // const formattedValue = "4,000.00";
                const formattedValue = BizCheckMobileString.currencyFormat(dataPoint.raw, {currencyCode: props.config.currency});

                const uniqueKey = `${label}-${formattedValue}`;
                if (seenValues.has(uniqueKey)) return; // Skip duplicate
                seenValues.add(uniqueKey);

                tableBody.appendChild(
                    ChartUtil.stringToHTMLElement(`
                        <tr>
                            <td style="display: flex; flex-direction: column; align-items: center;">
                                <b style="color: #015ab3; font-size: 12px;">${formattedValue} ${props.config.currency}</b>
                            </td>
                        </tr>
                    `)
                );
            });

            const tableRoot = el.querySelector("table");

            // Clear old tooltip content
            while (tableRoot.firstChild) {
                tableRoot.firstChild.remove();
            }

            // Append new content
            tableRoot.appendChild(tableBody);

            const tooltipWidth = el.offsetWidth;
            context.chart.canvas.parentNode.style.position = "relative";

            // Tooltip position inside canvas

            const point = tooltip.dataPoints?.[0]?.element;
            if (!point) {
                el.style.opacity = "0";
                return;
            }

            // Width clamping
            const x = point.x;
            const maxX = context.chart.canvas.parentNode.clientWidth - tooltipWidth - 8;
            const left = Math.min(Math.max(x - tooltipWidth / 2, 8), maxX);

            // === STYLE ===
            el.style.left = `${left}px`;
            el.style.opacity = "1";
            el.style.position = "absolute";
            el.style.padding = "0";
            el.style.top = "-10px";
            el.style.pointerEvents = "none";
            el.style.zIndex = "1000";
            el.style.whiteSpace = "nowrap";
            el.style.wordBreak = "break-word";
            el.style.maxWidth = "calc(100% - 16px)"; // handles small screens
            el.style.transform = "translate(0%, 0px)";
        }
    });
};

// Legends
const HTMLLegendPlugin = {
    id: legendID.value,
    afterUpdate(chart: any, _: any, options: any) {
        const ul = getOrCreateLegendList(chart, options.containerID);
        if (!ul) return;

        // Remove old legend items
        while (ul.firstChild) ul.firstChild.remove();

        // Inject style to ul element
        ul.style.justifyContent = "center";
        ul.style.minWidth = "150px";

        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);

        items.forEach((item: any) => {
            const li = document.createElement("li");
            Object.assign(li.style, {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                marginLeft: "10px",
            });

            li.onclick = () => {
                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                chart.update();
            };

            li.appendChild(generateAverageLegend(item));

            ul.appendChild(li);
        });
    }
};

const getOrCreateLegendList = (chart: Chart, id: string) => {
    try {
        const legendContainer = document.getElementById(id);

        let listContainer = legendContainer?.querySelector("ul");

        if (!listContainer) {
            listContainer = document.createElement("ul");
            listContainer.style.display = "flex";
            listContainer.style.flexDirection = "row";
            listContainer.style.margin = "0";
            listContainer.style.padding = "0";

            legendContainer?.appendChild(listContainer);
        }

        return listContainer;
    } catch (error) {
        BizCheckMobileLogger.info("Error while generating legend: ", error);
    }
};

const generateAverageLegend = (item: any): HTMLElement => {
    return ChartUtil.stringToHTMLElement(
        `
            <li style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; cursor: pointer; margin-left: 10px;">
                <span style="border: 1px dashed ${item.strokeStyle}; display: inline-block; flex-shrink: 0; height: 2px; margin-right: 10px; width: 20px "> </span>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <b style=" font-size: 14px; color: #333333; font-weight: 500;"> ${item.text} </b>
                </div>
            </li>
        `
    );
};

</script>

<style lang="scss" scoped>
.chart-container {
    position: relative;

    .legend {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: 10px
    }
}
</style>

<!-- <template>
    <div class="chart-container">
        <Line :id="legendContainerID" :options="chartOptions" :data="chartData" />
    </div>
</template>

<script setup lang="ts">
/**
 * Author: Chansopheaktra
 * Component: line-chart
 * Create on: 10/23/2024
 * Description: Common Line Chart
 * Last Modified on: 11/20/2024
 *
 * @example
 * <line-chart :config="chartData.line"></line-chart>
 *
 * @prop {object}        config
 * @prop {string[]}      config.labels
 * @prop {string}        config.currency ("USD" | "KHR")
 * @prop {Array<Object>} config.datas
 * @prop {string}        config.datas[].label
 * @prop {number[]}      config.datas[].data
 * @prop {boolean}       showLegend
 *
 * */
import { ChartUtil } from "@/utilities/chart-util";
import { CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { computed, ref } from "vue";
import { Line } from "vue-chartjs";

ChartJS.register(Tooltip,Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// interface Props {
//     config: {
//         labels: string[];
//         datas: Array<{ label: string; data: number[] }>;
//     }
// }
// const props = defineProps<Props>();

const legendContainerID = ref(ChartUtil.generateUniqueID());

const chartData = computed(() => {
    return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Janny Assets",
                data: [5000, 5200, 5600, 6000, 6300, 4000, 3900, 4100, 4200, 4300, 4500, 4700],
                borderColor: "#0025C9",
                backgroundColor: (ctx: any) => {
                    const chart = ctx.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, "#0025C9");
                    gradient.addColorStop(1, "#0025C94D");
                    return gradient;
                },
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                order: 1,
            },
            {
                label: "20s Average Assets",
                data: [4000, 5300, 5500, 5700, 4100, 6100, 6300, 4700, 6700, 6900, 7100, 4300],
                borderColor: "#bdbdbd",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                order: 2,
            }
        ]
    };
});

// Create reactive chart options using `ref`
const chartOptions = computed((): any => {
    return {
        responsive: true,
        plugins: {
            datalabels: { display: false },
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    font: { size: 14 }
                }
            },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                grid: { color: "#eee" },
                ticks: {
                    color: "#888",
                    maxRotation: 0,
                    minRotation: 0,
                    font: { size: 12 }
                }
            },
            y: {
                grid: { color: "#eee" },
                ticks: { color: "#888", font: { size: 12 } }
            }
        }
    };
});

</script>

<style lang="scss" scoped>
.chart-container {
    position: relative;

    .legend {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: 10px
    }
}
</style> -->