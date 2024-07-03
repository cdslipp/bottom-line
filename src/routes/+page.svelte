<script>
	import { writable, derived } from 'svelte/store';
	import CurrencyInput from '$lib/CurrencyInput.svelte';

	// Categories for income and expenses
	let incomeCategories = writable([]);
	let expenseCategories = writable([]);

	let newIncomeCategory = '';
	let newIncomeAmount = '';
	let newExpenseCategory = '';
	let newExpenseAmount = '';

	const addIncomeCategory = () => {
		if (newIncomeCategory.trim()) {
			incomeCategories.update((categories) => [
				...categories,
				{ name: newIncomeCategory, budgetedAmount: parseFloat(newIncomeAmount) || 0 }
			]);
			newIncomeCategory = '';
			newIncomeAmount = '';
		}
	};

	const addExpenseCategory = () => {
		if (newExpenseCategory.trim()) {
			expenseCategories.update((categories) => [
				...categories,
				{ name: newExpenseCategory, budgetedAmount: parseFloat(newExpenseAmount) || 0 }
			]);
			newExpenseCategory = '';
			newExpenseAmount = '';
		}
	};

	const updateCategoryAmount = (category, type, amount) => {
		const updateFn = type === 'income' ? incomeCategories : expenseCategories;
		updateFn.update((categories) =>
			categories.map((cat) =>
				cat === category ? { ...cat, budgetedAmount: parseFloat(amount) || 0 } : cat
			)
		);
	};

	const clearCategories = () => {
		incomeCategories.set([]);
		expenseCategories.set([]);
	};

	const totalIncome = derived(incomeCategories, ($incomeCategories) =>
		$incomeCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);

	const totalExpenses = derived(expenseCategories, ($expenseCategories) =>
		$expenseCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);

	const netIncome = derived([totalIncome, totalExpenses], ([$totalIncome, $totalExpenses]) =>
		($totalIncome - $totalExpenses).toFixed(2)
	);
</script>

<main class="budget-container">
	<header class="budget-header">
		<h1>Bottom Line</h1>
	</header>

	<section>
		<button on:click={clearCategories} class="secondary">Clear Categories</button>
	</section>

	<div class="container">
		<div class="column">
			<h2>Income Categories</h2>
			<div>
				{#each $incomeCategories as category}
					<div class="category-item">
						<span>{category.name}</span>
						<CurrencyInput
							bind:value={category.budgetedAmount}
							on:input={(e) => updateCategoryAmount(category, 'income', e.target.value)}
						/>
					</div>
				{/each}
				<div class="add-category">
					<form on:submit|preventDefault={addIncomeCategory}>
						<fieldset role="group">
							<input type="text" bind:value={newIncomeCategory} placeholder="Category Name" />
							<CurrencyInput bind:value={newIncomeAmount} />
							<button type="submit">Add</button>
						</fieldset>
					</form>
				</div>
			</div>
		</div>

		<div class="column">
			<h2>Expense Categories</h2>
			<div>
				{#each $expenseCategories as category}
					<div class="category-item">
						<span>{category.name}</span>
						<CurrencyInput
							bind:value={category.budgetedAmount}
							on:input={(e) => updateCategoryAmount(category, 'expense', e.target.value)}
						/>
					</div>
				{/each}
				<div class="add-category">
					<form on:submit|preventDefault={addExpenseCategory}>
						<fieldset role="group">
							<input type="text" bind:value={newExpenseCategory} placeholder="Category Name" />
							<CurrencyInput bind:value={newExpenseAmount} />
							<button type="submit">Add</button>
						</fieldset>
					</form>
				</div>
			</div>
		</div>
	</div>

	<section class="bottom-line">
		<div class="section">
			<p>${$totalIncome}</p>
			<p class="label">revenue</p>
		</div>
		<div class="section">
			<p>${$totalExpenses}</p>
			<p class="label">expenses</p>
		</div>
		<div
			class="section net-income"
			class:positive={$netIncome >= 0}
			class:negative={$netIncome < 0}
		>
			<p>${$netIncome}</p>
			<p class="label">net income</p>
		</div>
	</section>
</main>

<style>
	@import 'https://unpkg.com/@picocss/pico@1.*/css/pico.min.css';

	.budget-container {
		max-width: 1200px;
		margin: auto;
		padding: 2rem;
	}

	.budget-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.container {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.column {
		flex: 1;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
	}

	.category-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		align-items: center;
	}

	.add-category fieldset {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.category-item input {
		width: 100px;
		text-align: right;
	}

	.bottom-line {
		margin-top: 2rem;
		position: sticky;
		bottom: 0;
		background-color: #fff;
		box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
		padding: 1rem;
		display: flex;
		justify-content: space-around;
		text-align: center;
		font-weight: bold;
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.section p {
		margin: 0;
		font-size: 1.5rem;
	}

	.label {
		font-size: 1rem;
		color: #666;
	}

	.net-income {
		padding: 0.5rem;
		border-radius: 8px;
	}

	.net-income.positive {
		background-color: #d4edda;
		color: #155724;
	}

	.net-income.negative {
		background-color: #f8d7da;
		color: #721c24;
	}
</style>
