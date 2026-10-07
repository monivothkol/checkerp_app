<template>
    <ModuleConfirmScreen :config="config" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ModuleConfirmScreen from "@/core/components/module/ModuleConfirmScreen.vue";
import { MODULE_CONFIGS } from "@/core/modules/module-screen-config";

export default defineComponent({
    name: "EXP32000",
    components: { ModuleConfirmScreen },
    data() {
        return { config: MODULE_CONFIGS.EXPC };
    }
});
</script>
