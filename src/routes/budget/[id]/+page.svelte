<script>
	let { data } = $props();
	import BudgetManager from '$lib/components/budget/BudgetManager.svelte';

	let budgetId = data.budgetId;
</script>

{#if data}
	<h2>{data.budgetId}</h2>
{/if}
<BudgetManager {budgetId} />
