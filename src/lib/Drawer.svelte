<script>
	import TransactionLine from './TransactionLine.svelte';
	import { createEventDispatcher } from 'svelte';

	export let selectedCategory = null;
	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let newTransactionDate = new Date().toISOString().split('T')[0];
	let newTransactionName = '';
	let newTransactionAmount = '';

	const closeDrawer = () => {
		dispatch('close');
	};

	const handleAddTransaction = (event) => {
		event.preventDefault();
		if (newTransactionName && newTransactionAmount) {
			const newTransaction = {
				id: Date.now(),
				date: newTransactionDate,
				description: newTransactionName,
				total: parseFloat(newTransactionAmount).toFixed(2)
			};
			dispatch('addTransaction', {
				categoryId: selectedCategory.id,
				transaction: newTransaction
			});

			// Reset form fields
			newTransactionName = '';
			newTransactionAmount = '';
			// Keep the date as is for quick entry of multiple transactions on the same date
		}
	};
</script>

{#if isOpen}
	<nav class="drawer">
		<div class="drawer-header">
			<h2>Edit {selectedCategory?.name}</h2>
			<button on:click={closeDrawer}>Close</button>
		</div>
		{#if selectedCategory}
			<input type="text" bind:value={selectedCategory.name} class="category-name-input" />

			<form on:submit={handleAddTransaction} class="add-transaction-form">
				<input type="date" bind:value={newTransactionDate} required />
				<input
					type="text"
					bind:value={newTransactionName}
					placeholder="Transaction name"
					required
				/>
				<input
					type="number"
					bind:value={newTransactionAmount}
					placeholder="Amount"
					step="0.01"
					required
				/>
				<button type="submit">Add Transaction</button>
			</form>

			<h3>Transactions:</h3>
			<div class="transaction-list">
				{#each selectedCategory.transactions as transaction (transaction.id)}
					<TransactionLine {transaction} />
				{/each}
			</div>
		{/if}
	</nav>
{/if}

<style>
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: 40dvw;
		background: #f7f7f7;
		overflow-y: auto;
		padding: 20px;
		color: #333;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
		z-index: 2;
		display: flex;
		flex-direction: column;
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.category-name-input {
		width: 100%;
		margin-bottom: 10px;
		padding: 10px;
	}

	.add-transaction-form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.add-transaction-form input {
		padding: 5px;
	}

	.add-transaction-form button {
		background: #007bff;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.transaction-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
