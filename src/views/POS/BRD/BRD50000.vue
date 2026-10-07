<template>
    <ModuleDetailScreen :config="config" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModuleDetailScreen from "@/core/components/module/ModuleDetailScreen.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

export default defineComponent({
    name: "BRD50000",
    components: { ModuleDetailScreen },
    data() {
        return { config: MODULE_CONFIGS.BRD };
    }
});
</script>
