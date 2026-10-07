<template>
	<ion-header>
		<ion-toolbar>
			<ion-title>{{ title }}</ion-title>
			<ion-buttons slot="end">
				<ion-button v-if="closable" @click="onCancel()">
					<ion-icon slot="icon-only" :icon="close" />
				</ion-button>
			</ion-buttons>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding">
		<component :is="body" v-bind="bodyProps" @ok="onOk" @cancel="onCancel" />
	</ion-content>
</template>

<script setup lang="ts">
/** Sheet chrome for POP.showPopup: a title bar + the content-only body, which emits ok / cancel. */
import { close } from "ionicons/icons";
import type { Component } from "vue";

const props = defineProps<{
	title?: string;
	closable?: boolean;
	body: Component;
	bodyProps?: Record<string, unknown>;
	onDone: (button: "ok" | "cancel", data?: unknown) => void;
}>();

function onOk(data?: unknown) { props.onDone("ok", data); }
function onCancel(data?: unknown) { props.onDone("cancel", data); }
</script>
