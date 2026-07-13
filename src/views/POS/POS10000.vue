<template>
	<ion-page>
		<bm-header title="POS" :back-button="false" />
		<bm-content>
			<div class="wrap_content">
				<bm-empty-state title="POS" message="Point of sale is coming soon." />
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
defineOptions({
	name: "POS10000",
	description: "POS (placeholder)"
});
</script>
