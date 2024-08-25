<script>
	let { data } = $props();
	import BudgetManager from '$lib/components/budget/BudgetManager.svelte';

	let budgetId = data.budgetId;
</script>

<BudgetManager {budgetId} />
