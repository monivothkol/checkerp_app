<template>
    <img :src="qrImage" alt="" style="user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;"
        :draggable="false">
    <canvas ref="canvas" style="display: none;"></canvas>
</template>
<script setup lang="ts">
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import * as QRCode from "qrcode";
import { onMounted, ref, watch } from "vue";
const qrImage = ref("");
const canvas = ref();

const props = defineProps<{
    qrData: string;
}>();

defineOptions({
    name: "BQrImage",
    description: "BQrImage component"
});

onMounted(() => {
    BizCheckMobileLogger.info("qrData: ", props.qrData);
    QRCode.toCanvas(canvas.value, props.qrData, { margin: 0 }, (result) => {
        BizCheckMobileLogger.info("result: ", result);
        qrImage.value = canvas.value.toDataURL("image/jpeg");
    });
});

watch(() => props.qrData, (newVal) => {
    BizCheckMobileLogger.info("newVal: ", newVal);
    if (canvas.value && newVal) {
        QRCode.toCanvas(canvas.value, newVal, { margin: 0 }, (result) => {
            BizCheckMobileLogger.info("result: ", result);
            qrImage.value = canvas.value.toDataURL("image/jpeg");
        });
    }
});

</script>
