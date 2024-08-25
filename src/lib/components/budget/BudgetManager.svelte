<script>
	import CurrencyInput from '$lib/CurrencyInput.svelte';
	import Drawer from '$lib/Drawer.svelte';
	import BottomLine from '$lib/BottomLine.svelte';
	import { getContext } from 'svelte';
	import { tx, id } from '@instantdb/core';
	import { browser } from '$app/environment';

	let { budgetId } = $props();

	const db = getContext('db');

	let budget = $state(null);
	let incomeCategories = $state([]);
	let expenseCategories = $state([]);
	let categories = $state([]);
	let selectedCategory = $state(null);
	let drawerOpen = $state(false);
	let isLoading = $state(false);

	let newIncomeCategory = $state('');
	let newIncomeAmount = $state('');
	let newExpenseCategory = $state('');
	let newExpenseAmount = $state('');

	// New state variables for budget settings
	let settingsModalOpen = $state(false);
	let newBudgetName = $state('');
	let budgetStartDate = $state('');
	let budgetEndDate = $state('');

	if (browser) {
		db.subscribeQuery(
			{
				budgets: {
					$: {
						where: {
							id: budgetId
						}
					}
				},
				categories: {}
			},
			(resp) => {
				if (resp.error) {
					console.error('Error fetching data:', resp.error.message);
					return;
				}
				if (resp.data) {
					console.log('RESPONSE', resp.data.budgets);
					budget = resp.data.budgets[0];

					if (!budget) {
						console.error('Budget not found');
						return;
					}

					// Initialize settings form fields
					newBudgetName = budget.name || '';
					budgetStartDate = budget.startDate || '';
					budgetEndDate = budget.endDate || '';

					const allCategories = Object.values(resp.data.categories).map((category) => ({
						...category,
						showDetails: false
					}));

					categories = allCategories.filter((cat) => cat.budgetId === budgetId);

					// Separate income and expense categories
					incomeCategories = categories.filter((cat) => cat.type === 'income');
					expenseCategories = categories.filter((cat) => cat.type === 'expense');
				}
			}
		);
	}

	const addCategory = async (type) => {
		const newCategoryName = type === 'income' ? newIncomeCategory : newExpenseCategory;
		const newCategoryAmount = type === 'income' ? newIncomeAmount : newExpenseAmount;

		if (newCategoryName.trim()) {
			const categoryId = id();
			await db.transact([
				tx.categories[categoryId].update({
					name: newCategoryName,
					type,
					budgetedAmount: parseFloat(newCategoryAmount) || 0,
					budgetId
				})
			]);
			await db.transact([
				tx.budgets[budgetId].update({
					netIncome: parseFloat(netIncome)
				})
			]);

			if (type === 'income') {
				newIncomeCategory = '';
				newIncomeAmount = '';
			} else {
				newExpenseCategory = '';
				newExpenseAmount = '';
			}
		}
	};

	const updateCategoryAmount = async (category, amount) => {
		const newAmount = parseFloat(amount) || 0;
		await db.transact([tx.categories[category.id].update({ budgetedAmount: newAmount })]);
		await db.transact([
			tx.budgets[budgetId].update({
				netIncome: parseFloat(netIncome)
			})
		]);
	};

	const clearCategories = async () => {
		await db.transact([
			...incomeCategories.map((cat) => tx.categories[cat.id].delete()),
			...expenseCategories.map((cat) => tx.categories[cat.id].delete())
		]);

		incomeCategories = [];
		expenseCategories = [];
	};

	const openCategoryDrawer = (category) => {
		selectedCategory = category;
		drawerOpen = true;
	};

	const handleCloseDrawer = () => {
		drawerOpen = false;
		selectedCategory = null;
	};

	const totalIncome = $derived(
		incomeCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);
	const totalExpenses = $derived(
		expenseCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0).toFixed(2)
	);
	const netIncome = $derived((parseFloat(totalIncome) - parseFloat(totalExpenses)).toFixed(2));

	// New functions for budget settings
	const openSettingsModal = () => {
		settingsModalOpen = true;
	};

	const closeSettingsModal = () => {
		settingsModalOpen = false;
	};

	const updateBudgetSettings = async () => {
		await db.transact([
			tx.budgets[budgetId].update({
				name: newBudgetName,
				startDate: budgetStartDate,
				endDate: budgetEndDate
			})
		]);
		closeSettingsModal();
	};
</script>

<main class="budget-container">
	<Drawer {selectedCategory} isOpen={drawerOpen} on:close={handleCloseDrawer} />
	<header class="budget-header">
		<h1>{budget?.name || 'Budget'}</h1>
		<button on:click={openSettingsModal}>Settings</button>
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
						<div class="category-item">
							<div on:click={() => openCategoryDrawer(category)}>{category.name}</div>
							<CurrencyInput mode="thousands" bind:value={category.budgetedAmount} />
						</div>
					{/each}
					<div class="add-category">
						<form on:submit|preventDefault={() => addCategory('income')}>
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
								on:input={(e) => updateCategoryAmount(category, e.target.value)}
							/>
						</div>
					{/each}
					<div class="add-category">
						<form on:submit|preventDefault={() => addCategory('expense')}>
							<fieldset role="group">
								<input type="text" bind:value={newExpenseCategory} placeholder="Category Name" />
								<CurrencyInput mode="dollars" bind:value={newExpenseAmount} />
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

	<dialog open={settingsModalOpen}>
		<article>
			<header>
				<h3>Budget Settings</h3>
				<button aria-label="Close" class="close" on:click={closeSettingsModal}></button>
			</header>
			<form on:submit|preventDefault={updateBudgetSettings}>
				<label for="budgetName">
					Budget Name
					<input type="text" id="budgetName" bind:value={newBudgetName} required />
				</label>
				<fieldset role="group">
					<label for="startDate">
						Start Date
						<input type="date" id="startDate" bind:value={budgetStartDate} />
					</label>
					<label for="endDate">
						End Date
						<input type="date" id="endDate" bind:value={budgetEndDate} />
					</label>
				</fieldset>
				<footer>
					<button type="submit">Save Changes</button>
					<button type="button" class="secondary" on:click={closeSettingsModal}>Cancel</button>
				</footer>
			</form>
		</article>
	</dialog>
</main>

<style>
	.budget-container {
		max-width: 1200px;
		margin: auto;
		padding: 2rem;
	}

	.budget-header {
		text-align: center;
		margin-bottom: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	dialog {
		width: 100%;
		max-width: 500px;
	}

	dialog article {
		max-height: 80vh;
		overflow-y: auto;
	}
</style>
