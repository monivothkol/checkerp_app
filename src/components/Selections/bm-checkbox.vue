<template>
    <ion-checkbox v-bind="$attrs" label-placement="end">
        <slot name="label"></slot>
    </ion-checkbox>
</template>

<script setup lang="ts">
import { IonCheckbox } from "@ionic/vue";
</script>
<style lang="scss" scoped>
ion-checkbox {
	&::part(label) { margin-inline-start: 8px;}
}
</style>
