<template>
	<ion-page>
		<bm-header title="Invoice" :back-button="false" />
		<bm-content>
			<div class="wrap_content">
				<bm-empty-state title="Invoice" message="Invoice module is coming soon." />
			</div>
		</bm-content>
	</ion-page>
</template>

<script setup lang="ts">
defineOptions({
	name: "INV10000",
	description: "Invoice (placeholder)"
});
</script>
