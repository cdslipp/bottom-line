<script>
	import { getContext } from 'svelte';
	import { tx, id } from '@instantdb/core';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const db = getContext('db');

	let budgets = $state([]);
	let newBudgetName = $state('');
	let isLoading = $state(false);

	if (browser) {
		db.subscribeQuery({ budgets: {} }, (resp) => {
			if (resp.error) {
				console.error('Error fetching budgets:', resp.error.message);
				return;
			}
			if (resp.data) {
				budgets = Object.values(resp.data.budgets).map((budget) => ({
					...budget
				}));
			}
		});
	}

	const addBudget = async (event) => {
		event.preventDefault();

		if (newBudgetName.trim()) {
			isLoading = true;
			const budgetId = id();
			const dateNow = new Date().toISOString();
			await db.transact(
				tx.budgets[budgetId].update({
					id: budgetId,
					name: newBudgetName,
					netIncome: 0,
					lastModified: dateNow,
					createdAt: dateNow
				})
			);

			newBudgetName = '';
			isLoading = false;
		}
	};

	function openBudget(budgetId) {
		// Redirect to the budget manager page for the selected budget
		window.location.href = `/budget/${budgetId}`; // Adjust the URL as per your routing configuration
	}
</script>

<div class="budget-list-container">
	<header class="budget-header">
		<h1>Budgets</h1>
		<form on:submit={addBudget} class="add-budget-form">
			<input type="text" bind:value={newBudgetName} placeholder="New Budget Name" required />
			<button type="submit" disabled={isLoading}>+</button>
		</form>
	</header>

	<ul class="budget-list">
		{#each budgets as budget}
			<li class="budget-item" on:click={() => openBudget(budget.id)}>
				<div class="budget-info">
					<h2 class="budget-name">{budget.name}</h2>
					<p class="budget-detail">Net Income: ${budget.netIncome.toFixed(2)}</p>
					<p class="budget-detail">
						Last Modified: {new Date(budget.lastModified).toLocaleString()}
					</p>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.budget-list-container {
		max-width: 1200px;
		margin: auto;
		padding: 2rem;
	}

	.budget-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.add-budget-form {
		display: flex;
		gap: 10px;
	}

	.add-budget-form input {
		padding: 0.5rem;
		font-size: 1rem;
	}

	.add-budget-form button {
		padding: 0.5rem 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		cursor: pointer;
		font-size: 1rem;
	}

	.budget-list {
		list-style-type: none;
		padding: 0;
	}

	.budget-item {
		background: #f7f7f7;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 5px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: background 0.3s;
	}

	.budget-item:hover {
		background: #e7e7e7;
	}

	.budget-info {
		display: flex;
		flex-direction: column;
	}

	.budget-name {
		margin: 0;
		font-size: 1.5rem;
	}

	.budget-detail {
		margin: 0;
		font-size: 1rem;
		color: #666;
	}
</style>
