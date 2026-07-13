<template>
    <ion-toggle v-bind="$attrs" label-placement="end">
        <slot></slot>
    </ion-toggle>
</template>

<script setup lang="ts">
import { IonToggle } from "@ionic/vue";
</script>