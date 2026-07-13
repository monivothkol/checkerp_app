<template>
	<ion-content v-bind="$attrs" class="ion-padding" full-screen :scroll-events="scroll"
		:force-overscroll="false" @ion-scroll="onScroll($event)">

		<ion-refresher v-if="props.refresher" slot="fixed" mode="md" @ion-refresh="onRefresh($event)">
			<ion-refresher-content refreshing-spinner="crescent"></ion-refresher-content>
		</ion-refresher>
		<div v-if="!hideOfflineMsg && !hideOfflineMsg && onlineStatusClass !== ''" ref="onlineStatusRef" :class="`online_status showing ${!hideOfflineMsg ? onlineStatusClass : ''}`" :data-height="onlineStatusHeight || null">
			<div class="wrap_content dflex">
				<div>
					<h5 v-if="onlineStatus === 'offline' && !hideOfflineMsg">{{ $t('COMMON.BM_CONTENT.OFFLINE_TITLE') }}</h5>
					<p v-if="onlineStatus === 'offline' && !hideOfflineMsg">{{ $t('COMMON.BM_CONTENT.OFFLINE_MESSAGE') }}</p>

					<h5 v-if="onlineStatus === 'connecting'">{{ $t('COMMON.BM_CONTENT.CONNECTING_TITLE') }}</h5>
					<p v-if="onlineStatus === 'connecting'">{{ $t('COMMON.BM_CONTENT.CONNECTING_MESSAGE') }}</p>

					<h5 v-if="onlineStatus === 'connected'">{{ $t('COMMON.BM_CONTENT.CONNECTED_TITLE') }}</h5>
					<p v-if="onlineStatus === 'connected'">{{ $t('COMMON.BM_CONTENT.CONNECTED_MESSAGE') }}</p>
				</div>
				<div v-if="onlineStatus === 'offline' && !hideOfflineMsg" class="option">
					<bm-button class="btn01 btn_sm" @click="onSwitchToOffline">{{ $t('COMMON.BM_CONTENT.SWITCH_TO_OFFLINE') }}</bm-button>
				</div>
			</div>
		</div>

		<slot></slot>

		<ion-infinite-scroll v-if="props.infinite && onlineStatus !== 'offline'" threshold="10px" @ion-infinite="ionInfinite">
			<ion-infinite-scroll-content loading-spinner="bubbles"></ion-infinite-scroll-content>
		</ion-infinite-scroll>
	</ion-content>
</template>

<script setup lang="ts">
import RouterServices from "@/services/router-services";
import { func } from "@/utilities/func";
import NetworkStatusUpdate from "@/utilities/network-status-update";
import OfflineModeUpdate from "@/utilities/offline-mode-update";
import { BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from "@ionic/vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
const emit = defineEmits(["refresh", "infinite", "scroll"]);

const props = defineProps({
	refresher: {
		type: Boolean,
		default: false
	},
	infinite: {
		type: Boolean,
		default: false
	},
	scroll: {
		type: Boolean,
		default: false
	},
	autoClosRefresher: {
		type: Boolean,
		default: true
	}
});

const onlineStatusHeight = ref<number>(0);
const onlineStatus = ref<string>("");
const hideOfflineMsg = ref<boolean>(false);

const onlineStatusClass = computed<string>(() => {
	return onlineStatus.value === "connected" ? "connected" : onlineStatus.value === "connecting" ? "connecting" : onlineStatus.value === "offline" ? "offline" : "";
});

const onlineStatusRef = ref<HTMLElement | null>(null);
const networkStatusUpdate: NetworkStatusUpdate = new NetworkStatusUpdate();

const onRefresh = (event: RefresherCustomEvent) => {
	emit("refresh", event);

	if (props.autoClosRefresher) {
		setTimeout(() => {
			event.target.complete();
		}, 500);
	}
};

const onSwitchToOffline = func( () => {
	hideOfflineMsg.value = true;
	new OfflineModeUpdate().notify(hideOfflineMsg.value);
	networkStatusUpdate.notify();
	new RouterServices().backToRoot();
});

const ionInfinite = (event: InfiniteScrollCustomEvent) => {
	emit("infinite", event);
};

const onScroll = func( async (event: any) => {
	emit("scroll", event);
});

watch(() => onlineStatus.value, (newVal) => {
	if (newVal === "connected") {
		setTimeout(() => {
			onlineStatus.value = "";
		}, 1000);
	}
});

onMounted(() => {
	nextTick(() => {
		if (onlineStatusRef.value) {
			onlineStatusHeight.value = Math.round(onlineStatusRef.value.getBoundingClientRect().height);
		}
	});
	networkStatusUpdate.subscribe({
		update: (status) => {

			const isAlreadyLogin = BizCheckMobileProperties.get("alreadyLogin");
			if (!isAlreadyLogin || !JSON.parse(isAlreadyLogin || "false")) {
				return;
			};

			if ( !status.status ) {
				onlineStatus.value = "offline";
			}

			if ( status.status && ["none", "low", "unknown"].includes(status.signal_strength)) {
				onlineStatus.value = "connecting";
			}

			if ( status.status && !["none", "low", "unknown"].includes(status.signal_strength) && ["offline", "connecting"].includes(onlineStatus.value)) {
				hideOfflineMsg.value = false;
				onlineStatus.value = "connecting";
				setTimeout(() => {
					onlineStatus.value = "connected";
					new OfflineModeUpdate().notify(hideOfflineMsg.value);
				}, 1000);
			}
		}
	});
});

</script>

<style lang="scss" scoped>
ion-content { --background: #ECECEC; --padding-top: 20px; --padding-bottom: 20px;
	&:first-child { --padding-top: calc(20px + var(--safeArea));}
	&.pdTop0 { --padding-top: 0px;}
	&.pdLR0 { --padding-start: 0px; --padding-end: 0px;}
	&.bg_white { --background: #FFFFFF;}
}

.online_status { position: sticky; top: 0; z-index: 999999; margin-left: 0; margin-right: 0; padding-bottom: 16px; border-radius: 8px; margin-bottom: 16px; margin-top: v-bind("`-${onlineStatusHeight}px`"); transition: margin-top 0.3s ease-in-out;
	&.showing { margin-top: 0 !important;}
	.wrap_content { padding: 16px; border-radius: var(--radius8); }
	&.offline { margin-top: v-bind("`-${onlineStatusHeight}px`"); transition: margin-top 0.3s ease-in-out;
		.wrap_content { background: #FF0000; transition: background 0.3s ease-in-out;}
	}
	&.connecting { margin-top: v-bind("`-${onlineStatusHeight}px`"); transition: margin-top 0.3s ease-in-out;
		.wrap_content { background: #FFD339; transition: background 0.3s ease-in-out;}
		h5, p { color: var(--fontColor01);}
	}
	&.connected { background: #5FD14C; margin-top: v-bind("`-${onlineStatusHeight}px`"); transition: margin-top 0.3s ease-in-out;
		.wrap_content { background: #5FD14C; transition: background 0.3s ease-in-out;}
	}
	h5 { font-size: var(--font14); font-weight: 700; line-height: 140%; color: #FFFFFF;}
	p { font-size: var(--font12); font-weight: 400; line-height: 140%; color: #FFFFFF;}
}

ion-content {
	&:has( > .inquiry_box) {
		.online_status { position: relative; background-color: #FFFFFF; margin: 0 -16px 0px; padding: 0 16px 16px;}
	}
}
</style>
