<script>
	import { budget, incomeCategories, expenseCategories } from './stores/budget';
	import CategoryList from './CategoryList.svelte';
	import BudgetSummary from './BudgetSummary.svelte';
	import TransactionDrawer from './TransactionDrawer.svelte';

	let selectedCategory = null;
	let drawerOpen = false;

	function openDrawer(category) {
		selectedCategory = category;
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
		selectedCategory = null;
	}

	function createSnapshot() {
		budget.createSnapshot();
	}
</script>

<div class="budget-container">
	<button on:click={createSnapshot}>Create Snapshot</button>

	<div class="categories-container">
		<CategoryList
			type="income"
			categories={$incomeCategories}
			on:selectCategory={(e) => openDrawer(e.detail)}
		/>
		<CategoryList
			type="expense"
			categories={$expenseCategories}
			on:selectCategory={(e) => openDrawer(e.detail)}
		/>
	</div>

	<BudgetSummary />

	<TransactionDrawer bind:isOpen={drawerOpen} category={selectedCategory} on:close={closeDrawer} />
</div>

<style>
	.budget-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.categories-container {
		display: flex;
		gap: 2rem;
	}
</style>
