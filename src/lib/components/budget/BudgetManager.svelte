<script>
	import CurrencyInput from '$lib/CurrencyInput.svelte';
	import Drawer from '$lib/Drawer.svelte';
	import BottomLine from '$lib/BottomLine.svelte';
	import { getContext } from 'svelte';
	import { tx, id } from '@instantdb/core';
	import { browser } from '$app/environment';

	const db = getContext('db');

	let incomeCategories = $state([]);
	let expenseCategories = $state([]);
	let categories = $state([]);
	let budgets = $state([]);
	let selectedCategory = $state(null);
	let drawerOpen = $state(false);
	let isLoading = $state(false);

	let newIncomeCategory = $state('');
	let newIncomeAmount = $state('');
	let newExpenseCategory = $state('');
	let newExpenseAmount = $state('');

	if (browser) {
		db.subscribeQuery({ categories: {}, budgets: {} }, (resp) => {
			if (resp.error) {
				console.error('Error fetching data:', resp.error.message);
				return;
			}
			if (resp.data) {
				const allCategories = Object.values(resp.data.categories).map((category) => ({
					...category,
					showDetails: false
				}));
				categories = allCategories;

				// Separate income and expense categories
				incomeCategories = allCategories.filter((cat) => cat.type === 'income');
				expenseCategories = allCategories.filter((cat) => cat.type === 'expense');

				budgets = Object.values(resp.data.budgets).map((budget) => ({
					...budget
				}));
			}
		});
	}

	// Function to add income category
	const addIncomeCategory = async (event) => {
		event.preventDefault();

		if (newIncomeCategory.trim()) {
			const categoryId = id();
			await db.transact([
				tx.categories[categoryId].update({
					name: newIncomeCategory,
					type: 'income',
					budgetedAmount: parseFloat(newIncomeAmount) || 0
				}),
				tx.budgets[categoryId].update({
					category: categoryId,
					budgetedAmount: parseFloat(newIncomeAmount) || 0
				})
			]);

			newIncomeCategory = '';
			newIncomeAmount = '';
		}
	};

	// Function to add expense category
	const addExpenseCategory = async (event) => {
		event.preventDefault();

		if (newExpenseCategory.trim()) {
			const categoryId = id();
			await db.transact([
				tx.categories[categoryId].update({
					name: newExpenseCategory,
					type: 'expense',
					budgetedAmount: parseFloat(newExpenseAmount) || 0
				}),
				tx.budgets[categoryId].update({
					category: categoryId,
					budgetedAmount: parseFloat(newExpenseAmount) || 0
				})
			]);

			newExpenseCategory = '';
			newExpenseAmount = '';
		}
	};

	const updateCategoryAmount = async (category, type, amount) => {
		const newAmount = parseFloat(amount) || 0;
		if (type === 'income') {
			await db.transact([
				tx.categories[category.id].update({ budgetedAmount: newAmount }),
				tx.budgets[category.id].update({ budgetedAmount: newAmount })
			]);
		} else {
			await db.transact([
				tx.categories[category.id].update({ budgetedAmount: newAmount }),
				tx.budgets[category.id].update({ budgetedAmount: newAmount })
			]);
		}
	};

	const clearCategories = async () => {
		await db.transact([
			...incomeCategories.map((cat) => tx.categories[cat.id].delete()),
			...expenseCategories.map((cat) => tx.categories[cat.id].delete()),
			...incomeCategories.map((cat) => tx.budgets[cat.id].delete()),
			...expenseCategories.map((cat) => tx.budgets[cat.id].delete())
		]);
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
		const allCategories = [...incomeCategories, ...expenseCategories];
		const categoryType = allCategories.find((cat) => cat.id === categoryId)?.type;

		db.transact(tx.transactions[transaction.id].update(transaction)).then(() => {
			if (categoryType === 'income') {
				incomeCategories = incomeCategories.map((cat) =>
					cat.id === categoryId ? { ...cat, transactions: [...cat.transactions, transaction] } : cat
				);
			} else {
				expenseCategories = expenseCategories.map((cat) =>
					cat.id === categoryId ? { ...cat, transactions: [...cat.transactions, transaction] } : cat
				);
			}
		});
	};

	const handleCloseDrawer = () => {
		drawerOpen = false;
		selectedCategory = null;
	};

	$effect(() => {
		console.log(totalIncome);
	});
</script>

<main class="budget-container">
	<Drawer
		{selectedCategory}
		isOpen={drawerOpen}
		on:addTransaction={handleAddTransaction}
		on:close={handleCloseDrawer}
	/>
	<header class="budget-header">
		<h1>Budget</h1>
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
						<form on:submit={addIncomeCategory}>
							<fieldset role="group">
								<input type="text" bind:value={newIncomeCategory} placeholder="Category Name" />
								<CurrencyInput bind:value={newIncomeAmount} />
								<!-- Hidden Add Button -->
								<button type="submit" class="hidden-button">Add</button>
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
						<form on:submit={addExpenseCategory}>
							<fieldset role="group">
								<input type="text" bind:value={newExpenseCategory} placeholder="Category Name" />
								<CurrencyInput bind:value={newExpenseAmount} />
								<!-- Hidden Add Button -->
								<button type="submit" class="hidden-button">Add</button>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</div>

		<BottomLine {totalIncome} {totalExpenses} {netIncome} />
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

	.hidden-button {
		display: none;
	}
</style>
