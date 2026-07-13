
<template>
    <ion-page>
        <bm-header :title="$t('COM8000000.TITLE')" />
        <bm-content class="bg_white">
			<div class="wrap_content">
				<div class="banner_text ico_lock">
					<p class="banner_desc txt_center">{{ $t('COM8000000.TEXT.BANNER_DESC') }}</p>
				</div>
			</div>
        </bm-content>

        <bm-footer>
            <bm-button class="btn01" @click="back">{{ $t('COM8000000.BUTTON.OKAY') }}</bm-button>
        </bm-footer>
    </ion-page>
</template>

<script setup lang="ts">
import RouterServices from "@/services/router-services";
import { func } from "@/utilities/func";

/**
 * Author: Monivoth
 * Component: COM8000000
 * Create on: 12/15/2025
 * Description: Detail About Your Component
 * */

 const router: RouterServices = new RouterServices();

defineOptions({
    name: "COM8000000",
    description: "Change Password"
});

const back = func(() => {
    router.back();
});
</script>