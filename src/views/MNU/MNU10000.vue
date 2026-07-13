<template>
	<ion-page>
		<bm-header title="Menu" :back-button="false" />
		<bm-content>
			<div class="wrap_content">
				<bm-empty-state title="Menu" message="More features are coming soon." />
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
defineOptions({
	name: "MNU10000",
	description: "Menu (placeholder)"
});
</script>
