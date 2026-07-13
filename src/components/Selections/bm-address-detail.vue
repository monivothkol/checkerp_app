<template>
    <div class="wrap_address_detail">
        <p class="address txt_ellipse_2_lines">{{ props.address }}</p>
        <p class="distance" @click="onFindLocation">{{ props.distanceText || getDistance(props.distance?.currentLocation || {latitude: 0, longitude: 0}, props.distance?.latitude || 0, props.distance?.longitude || 0) }}</p>
    </div>
</template>
<script setup lang="ts">
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { func } from "@/utilities/func";
import GoogleService from "@/services/google-service";
interface Props {
    address: string,
	distanceText: string,
    distance: { currentLocation: {latitude: number, longitude: number}, latitude: number, longitude: number } ,
}

const props = withDefaults(defineProps<Props>(), {
    address: "N/A",
    distance: {currentLocation: {latitude: 0, longitude: 0}, latitude: 0, longitude: 0 } as any,
});
BizCheckMobileLogger.log("bm-address-detail", props.distance);
const googleService = new GoogleService();

const emit = defineEmits(["onClickDistance", "update:distanceText"]);

const getDistance = func((currentLocation: any, latitude: number, longitude: number) => {
    if(latitude === 0 || longitude === 0) {
        return "0.0km";
    }
	const distance = googleService.calculateDistance(currentLocation, {latitude: latitude, longitude: longitude}, "km");
	emit("update:distanceText", distance.distanceText || "0.0km");
	return distance?.distanceText || "0.0km";
});

const onFindLocation = func(() => {
    BizCheckMobileLogger.log("onFindLocation");
    emit("onClickDistance");
});
</script>
<style scoped lang="scss">
    .wrap_address_detail { display: flex; border-radius: var(--radius8); gap: 8px; background: #E9EBF0; padding: 16px; align-items: center;
        .address { flex: 1; font-size: var(--font14); font-weight: 600; line-height: 140%; color: var(--fontColor02); }
        .distance { background: url("@/assets/images/ico_distance.svg") no-repeat top center; padding-top: 24px; white-space: nowrap; text-align: center; font-size: var(--font12); font-weight: 600; line-height: 140%; color: var(--colorPrimary);}
    }
</style>
