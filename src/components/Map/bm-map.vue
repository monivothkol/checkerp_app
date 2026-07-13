
<template>
	<ion-page>
		<bm-header title="Find Location" />
		<bm-content>
			<div  class="wrap_map">
				<div id="map"></div>
				<bm-button class="btn_my_location" @click="onMyLocation"></bm-button>
			</div>
		</bm-content>
		<bm-footer>
			<bm-button class="btn01" expand="block" @click="onSubmit">Choose this location</bm-button>
		</bm-footer>
	</ion-page>
</template>

<script setup lang="ts">
/**
 * ---------------------------------------------------------
 *
 * Author: Socheat
 * Component: COL4111100
 * Create on: 9/15/2025
 * Description: Visit Report
 *
 * ---------------------------------------------------------
 * */
import { ref, onMounted } from "vue";
// import { locationOutline } from "ionicons/icons";
import DialogUtil from "@/utilities/dialog-util";
import GoogleService from "@/services/google-service";
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
const googleService:GoogleService = new GoogleService();
const location = ref({latitude: 0, longitude: 0, displayName: "", addressDetail: {}});
const currentLocation = ref({latitude: 0, longitude: 0});
const mapData = ref<any>(null);
let marker: any = null;
onMounted(() => {
	initMap();
});

const onMyLocation = async () => {
	mapData.value.setOptions({
		center: { lat: currentLocation.value.latitude, lng: currentLocation.value.longitude },
		zoom: 16,
	});
};

const initMap = async () => {
	DialogUtil.showLoading();
	const map = await googleService.initMapLoad();
	mapData.value = map;
	if (mapData.value) {
		location.value.latitude = mapData.value?.getCenter()?.lat();
		location.value.longitude = mapData.value?.getCenter()?.lng();
		googleService.getAddressDetail({
				latitude: location.value.latitude,
				longitude: location.value.longitude
			}).then( async (response: any) => {
				location.value.addressDetail = response.addressDetail;
				location.value.displayName = response.displayName;
				currentLocation.value.latitude = location.value.latitude;
				currentLocation.value.longitude = location.value.longitude;
				DialogUtil.closeLoading();
			});

		mapData.value.addListener("click", async (mapsMouseEvent: any) => {
			location.value.latitude = mapsMouseEvent?.latLng?.lat();
			location.value.longitude = mapsMouseEvent?.latLng?.lng();
			DialogUtil.showLoading();
			googleService.getAddressDetail({
				latitude: location.value.latitude,
				longitude: location.value.longitude
			}).then( async (response: any) => {
				location.value.addressDetail = response.addressDetail;
				location.value.displayName = response.displayName;
				BizCheckMobileLogger.log("location", location.value);
				if (marker && typeof (marker as any).setMap === "function") {
					(marker as any).setMap(null);
				}
				marker = await googleService.addMarker(mapData.value, location.value.latitude, location.value.longitude, { name: "Selected Location" });
				mapData.value.setOptions({ center: { lat: location.value.latitude, lng: location.value.longitude }, zoom: 16, });
				DialogUtil.closeLoading();
			});

		});
	}
};

const onSubmit = () => {
    DialogUtil.closeModal({data: location.value, role: "apply"});
};

</script>

<style scoped lang="scss">
#map {
  height: 100%;
}
ion-content { --padding-top: 0 !important; --padding-end: 0 !important; --padding-start: 0 !important;
	&::part(scroll) {height: 100% !important;  overflow: hidden !important;}
}
.wrap_map { position: relative; height: 100%; width: 100%;;}
.btn_my_location { position: absolute; bottom: 0; right: 16px; --background: transparent; background: #FFFFFF url("@/assets/images/ico_my_location.svg") no-repeat center; width: 48px; height: 48px; min-height: 48px; border-radius: var(--radius8); text-indent: -9999px;}
</style>
