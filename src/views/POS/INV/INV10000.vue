<template>
    <ModuleListScreen :config="config" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModuleListScreen from "@/core/components/module/ModuleListScreen.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

export default defineComponent({
    name: "INV10000",
    components: { ModuleListScreen },
    data() {
        return { config: MODULE_CONFIGS.INV };
    }
});
</script>
