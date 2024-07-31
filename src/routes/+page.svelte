<script>
	import CurrencyInput from '$lib/CurrencyInput.svelte';
	import Drawer from '$lib/Drawer.svelte';

	// Income and Expense Categories
	let incomeCategories = $state([]);
	let expenseCategories = $state([]);

	let newIncomeCategory = $state('');
	let newIncomeAmount = $state('');
	let newExpenseCategory = $state('');
	let newExpenseAmount = $state('');

	let selectedCategory = $state(null);
	let drawerOpen = $state(false);

	const addIncomeCategory = () => {
		if (newIncomeCategory.trim()) {
			incomeCategories = [
				...incomeCategories,
				{
					id: Date.now(),
					name: newIncomeCategory,
					budgetedAmount: parseFloat(newIncomeAmount) || 0,
					transactions: []
				}
			];
			newIncomeCategory = '';
			newIncomeAmount = '';
		}
	};

	const addExpenseCategory = () => {
		if (newExpenseCategory.trim()) {
			expenseCategories = [
				...expenseCategories,
				{
					id: Date.now(),
					name: newExpenseCategory,
					budgetedAmount: parseFloat(newExpenseAmount) || 0,
					transactions: []
				}
			];
			newExpenseCategory = '';
			newExpenseAmount = '';
		}
	};

	const updateCategoryAmount = (category, type, amount) => {
		if (type === 'income') {
			incomeCategories = incomeCategories.map((cat) =>
				cat.id === category.id ? { ...cat, budgetedAmount: parseFloat(amount) || 0 } : cat
			);
		} else {
			expenseCategories = expenseCategories.map((cat) =>
				cat.id === category.id ? { ...cat, budgetedAmount: parseFloat(amount) || 0 } : cat
			);
		}
	};

	const clearCategories = () => {
		incomeCategories = [];
		expenseCategories = [];
	};

	const totalIncome = $derived(
		incomeCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);
	const totalExpenses = $derived(
		expenseCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);
	const netIncome = $derived((parseFloat(totalIncome) - parseFloat(totalExpenses)).toFixed(2));

	const openCategoryDrawer = (category) => {
		selectedCategory = category;
		drawerOpen = true;
	};

	const handleAddTransaction = (event) => {
		const { categoryId, transaction } = event.detail;
		const categoryType = incomeCategories.find((cat) => cat.id === categoryId)
			? 'income'
			: 'expense';
		const categories = categoryType === 'income' ? incomeCategories : expenseCategories;

		const updatedCategories = categories.map((cat) => {
			if (cat.id === categoryId) {
				return {
					...cat,
					transactions: [...cat.transactions, transaction]
				};
			}
			return cat;
		});

		if (categoryType === 'income') {
			incomeCategories = updatedCategories;
		} else {
			expenseCategories = updatedCategories;
		}
	};

	const handleCloseDrawer = () => {
		drawerOpen = false;
		selectedCategory = null;
	};
</script>

<main class="budget-container">
	<Drawer
		{selectedCategory}
		isOpen={drawerOpen}
		on:addTransaction={handleAddTransaction}
		on:close={handleCloseDrawer}
	/>
	<header class="budget-header">
		<h1>Bottom Line</h1>
	</header>

	<div id="page-content">
		<section>
			<button on:click={clearCategories} class="secondary">Clear Categories</button>
		</section>

		<div class="container">
			<!-- Income Categories -->
			<div class="column">
				<h2>Income Categories</h2>
				<div class="categories">
					{#each incomeCategories as category (category.id)}
						<div class="category-item" on:click={() => openCategoryDrawer(category)}>
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

			<!-- Expense Categories -->
			<div class="column">
				<h2>Expense Categories</h2>
				<div class="categories">
					{#each expenseCategories as category (category.id)}
						<div class="category-item" on:click={() => openCategoryDrawer(category)}>
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
				<p>${totalIncome}</p>
				<p class="label">revenue</p>
			</div>
			<div class="section">
				<p>${totalExpenses}</p>
				<p class="label">expenses</p>
			</div>
			<div
				class="section net-income"
				class:positive={parseFloat(netIncome) >= 0}
				class:negative={parseFloat(netIncome) < 0}
			>
				<p>${netIncome}</p>
				<p class="label">net income</p>
			</div>
		</section>
	</div>
</main>

<style>
	/* Styles remain the same */
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
		display: flex;
		flex-direction: column;
	}

	.categories {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.category-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		align-items: center;
		cursor: pointer;
	}

	.add-category fieldset {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
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
