import { BizCheckMobileDateTime } from "@/shared/bizcheckmobile";

/* eslint-disable no-unused-vars */
export abstract class ChartUtil {

    /**
     * Converts a string to an HTML element.
     * @param htmlString - The string to be converted.
     * @returns HTML element.
     */
    public static stringToHTMLElement(htmlString: string): HTMLElement {
        // Create a template element
        const template = document.createElement("template");

        // Set the innerHTML of the template element to the given string
        template.innerHTML = htmlString.trim();

        // Get the first child of the template element (which is the converted HTML element)
        return template.content.firstChild as HTMLElement;
    }

    // Line chart datasets
    public static generateDatasets(data: any,): [] {
        return data.map((item: any, index: number) => {
            return {
                ...item,
                pointRadius: 0,
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "#015ab3",
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6,
                borderColor: index === 0 ? "#0025C9" : "#bdbdbd",
                backgroundColor: (context: any) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    // return if the chart is not yet rendered
                    if (!chartArea) return null;
                    else {
                        if (index === 0) {
                            return this.generateGradientColors(ctx, chartArea);
                        } else {
                            return "#0025C94D";
                        }
                    }
                },
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                order: 1,
            };
        });
    }

    // Dotted Line chart datasets
    public static generateDottedLineDatasets(data: any): [] {
        return data.map((item: any, index: number) => {
            return {
                ...item,
                pointRadius: 4,
                pointBackgroundColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "#015ab3",
                pointHoverBorderWidth: 2.5,
                pointHoverRadius: 6,
                borderColor: index === 0 ? "#015ab3" : "#63bae7",
                borderWidth: 2.5,
                borderDash: index === 0 ? [] : [4, 4]
            };
        });
    }

    // Line chart datasets
    public static generateSpendingDatasets(data: any): [] {
        return data.map((item: any, index: number) => {
            return {
                ...item,
                pointRadius: 4,
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "#015ab3",
                pointHoverBorderWidth: 3,
                pointHoverRadius: 6,
                backgroundColor: index === 0 ? "#ed7d31" : "#63bae7",
                borderColor: index === 0 ? "#ed7d31" : "#63bae7",
                borderDash: index !== 0 ? [5, 5] : [],
                borderWidth: index !== 0 ? 2 : 4,
            };
        });
    }

    // Bar Average Chart
    public static generateAverageBarColors(data: number[]): string[] {
        const colors: Array<string> = [];
        const maxValue = Math.max(...data); // Find the highest value
        const lastIndex = data.length - 1;  // Index of the last value (Today)

        data.forEach((value, index) => {
            if (index === lastIndex) {
                // Last value (Today)
                colors.push("#015ab3");
            } else if (value === maxValue) {
                // Highest value
                colors.push("#63bae7");
            } else {
                // All other values
                colors.push("#f0f0f0");
            }
        });

        return colors;
    }

    public static generateHourlyBarColors(data: { labels: string[]; currency: string; datas: Array<HourlySaleChart>; }): string[] {

        const colors: Array<string> = [];
        const isCurrentHour = BizCheckMobileDateTime.getCurrentDate("HH");// dayjs().format("ha")?.replace(/.$/, "");

        data.labels.forEach((value) => {
            if (value === isCurrentHour) {
                colors.push("#015ab3");
            } else {
                colors.push(data.datas[0].backgroundColor[0]);
            }
        });

        return colors;
    }

    public static generateRandomColors(): string {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    public static generateGradientColors(ctx: any, chartArea: any): CanvasGradient {
        // const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        // gradient.addColorStop(0, "rgb(203 188 188 / 0%)");
        // gradient.addColorStop(transparency, "rgb(76, 175, 254)");
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "#0025C9");
        gradient.addColorStop(1, "#0025C94D");
        // gradient.addColorStop(0, "rgb(203 188 188 / 0%)");
        // gradient.addColorStop(transparency, "rgb(76, 175, 254)");

        return gradient;
    }

    public static generateTooltip(context: any, callback: (response: any, el: HTMLElement) => void) {

        const { chart, tooltip: tooltipModel } = context;

        const el = this.getOrCreateTooltip(chart);
        const parent = chart.canvas.parentNode as HTMLElement;
        parent.style.position = "relative";

        // Hide if no tooltip
        if (tooltipModel.opacity === 0) {
            el.style.opacity = "0";
            return;
        }

        // Render custom content
        callback(tooltipModel, el);

        // Set position
        const tooltipWidth = el.offsetWidth;

        const point = tooltipModel.dataPoints?.[0]?.element;
        if (!point) {
            el.style.opacity = "0";
            return;
        }

        const x = point.x;

        // Clamp position inside parent
        const TOOLTIP_MARGIN = 16;
        const maxX = parent.clientWidth - tooltipWidth - TOOLTIP_MARGIN;
        const minX = TOOLTIP_MARGIN;
        const left = Math.max(minX, Math.min(x - tooltipWidth / 2, maxX));

        const top = -40; // Fix position tooltip

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.opacity = "1";
    }

    // Vertical Annotation
    public static verticalAnnotationPlugin(id: string, type: "bar" | "line" | "dottedLine" | "spending" | "unset") {
        return {
            id: "verticalAnnotation",
            afterDatasetsDraw: (chart: any) => {
                if (!chart._active || chart._active.length === 0) return;

                const { chartArea: { top, bottom } } = chart;

                const xValue = chart._active[0].element.x;
                const yValue = chart._active[0].element.y;

                const ctx = (document.getElementById(id) as HTMLCanvasElement).getContext("2d");

                ctx!.lineWidth = 2;
                ctx!.strokeStyle = "#80acd9";

                if (type !== "line" && type !== "spending" && type !== "dottedLine") {
                    ctx!.setLineDash([5, 5]);
                }

                ctx!.beginPath();

                switch (type) {
                    case "bar": {
                        const bottomValue = bottom - chart._active[0].element.height;
                        ctx!.moveTo(xValue, top);
                        ctx!.lineTo(xValue, bottomValue);
                        ctx!.stroke();

                        break;
                    }
                    case "line": {
                        ctx!.moveTo(xValue, bottom);
                        ctx!.lineTo(xValue, yValue);
                        ctx!.stroke();

                        break;
                    }
                    case "dottedLine": {
                        ctx!.lineWidth = 1;
                        ctx!.strokeStyle = "#015ab3";
                        ctx!.moveTo(xValue, top);
                        ctx!.lineTo(xValue, bottom);
                        ctx!.stroke();

                        break;
                    }
                    case "spending": {
                        ctx!.moveTo(xValue, top);
                        ctx!.lineTo(xValue, bottom);
                        ctx!.stroke();

                        break;
                    }
                    default: {
                        ctx!.moveTo(xValue, top);
                        ctx!.lineTo(xValue, bottom);
                        ctx!.stroke();

                        break;
                    }
                }
            }
        };
    }

    public static generateUniqueID(): string {
        return Math.random().toString(36).substring(7);
    }

    private static getOrCreateTooltip(chart: any) {
        let tooltipEl = chart.canvas.parentNode.querySelector("div");

        if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            Object.assign(tooltipEl.style, {
                opacity: 1,
                pointerEvents: "none",
                position: "absolute",
                transition: "all .1s ease",
                whiteSpace: "nowrap",
                wordBreak: "break-word",
            });

            const table = document.createElement("table");
            table.style.margin = "0px";

            tooltipEl.appendChild(table);
            chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
    }
}

export interface HourlySaleChart {
    label: string;
    data: { earned: number; average: number; count: number; }[];
    backgroundColor: string[]
}