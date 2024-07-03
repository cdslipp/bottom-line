<script>
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import CategoryLine from '$lib/CategoryLine.svelte';

	// Categories for budget
	let categories = [
		{ id: 1, name: 'Company', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 2, name: 'Designers', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 3, name: 'Production Staff', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 4, name: 'Set Construction Materials', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 5, name: 'Set Construction Labour', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 6, name: 'Lighting', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 7, name: 'Video', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 8, name: 'Costumes', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 9, name: 'Hair and Makeup', budget: 0, subtotal: 0, subcategories: [] },
		{ id: 10, name: 'Contingency', budget: 0, subtotal: 0, subcategories: [] }
	];

	let transactions = writable([]);

	let description = writable('');
	let amount = writable('');
	let category = writable('');
	let date = writable('');
	let includeHST = writable(true);

	const today = new Date().toISOString().substr(0, 10);
	date.set(today);

	const addTransaction = () => {
		const subtotal = parseFloat($amount);
		const salesTax = $includeHST ? subtotal * 0.13 : 0;
		const total = subtotal + salesTax;

		const transaction = {
			description: $description,
			subtotal: subtotal.toFixed(2),
			salesTax: salesTax.toFixed(2),
			total: total.toFixed(2),
			date: $date,
			categoryId: categories.find((c) => c.name === $category).id,
			type: $category === 'Income' ? 'income' : 'expense'
		};

		transactions.update((current) => [...current, transaction]);

		// Reset form fields
		description.set('');
		amount.set('');
		category.set('');
		date.set(today);
		closeDialog();
	};

	const clearTransactions = () => {
		transactions.set([]);
		categories.forEach((category) => (category.subtotal = 0));
	};

	const toggleHST = () => {
		includeHST.set(!$includeHST);
	};

	let dialog;
	const openDialog = () => {
		dialog.showModal();
	};
	const closeDialog = () => {
		dialog.close();
	};

	const totalIncome = derived(transactions, ($transactions) =>
		$transactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + parseFloat(t.total), 0)
			.toFixed(2)
	);

	const totalExpenses = derived(transactions, ($transactions) =>
		$transactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + parseFloat(t.total), 0)
			.toFixed(2)
	);

	const netIncome = derived([totalIncome, totalExpenses], ([$totalIncome, $totalExpenses]) =>
		($totalIncome - $totalExpenses).toFixed(2)
	);
</script>

<main class="budget-container">
	<header class="budget-header">
		<h1>Bottom Line</h1>
	</header>

	<section class="hst-toggle">
		<label>
			Show HST
			<input type="checkbox" role="switch" bind:checked={$includeHST} on:click={toggleHST} />
		</label>
	</section>

	<section>
		<button on:click={openDialog} class="contrast">Add Transaction</button>
		<button on:click={clearTransactions} class="secondary">Clear Transactions</button>
	</section>

	<dialog bind:this={dialog}>
		<article>
			<header>
				<button aria-label="Close" on:click={closeDialog} rel="prev">X</button>
				<h2>Add Transaction</h2>
			</header>
			<form on:submit|preventDefault={addTransaction}>
				<div class="grid">
					<label for="date">
						Date
						<input type="date" id="date" bind:value={$date} required />
					</label>
					<label for="description">
						Description
						<input type="text" id="description" bind:value={$description} required />
					</label>
					<label for="amount">
						Amount
						<input type="text" id="amount" bind:value={$amount} placeholder="0.00" required />
					</label>
					<label for="category">
						Category
						<select id="category" bind:value={$category} required>
							<option value="" disabled selected>Select Category</option>
							{#each categories as category}
								<option value={category.name}>{category.name}</option>
							{/each}
						</select>
					</label>
				</div>
				<footer>
					<button type="button" class="secondary" on:click={closeDialog}>Cancel</button>
					<button type="submit" class="contrast">Add Transaction</button>
				</footer>
			</form>
		</article>
	</dialog>

	<div class="container">
		<div class="column">
			<h2>Income</h2>
			<div>
				{#each $transactions.filter((t) => t.type === 'income') as transaction, index}
					<TransactionLine {transaction} />
				{/each}
			</div>
		</div>

		<div class="column">
			<h2>Expenses</h2>
			<div>
				{#each $transactions.filter((t) => t.type === 'expense') as transaction, index}
					<TransactionLine {transaction} />
				{/each}
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
	}

	.transaction-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.transaction-item:nth-child(odd) {
		background-color: #f5f5f5;
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

	.grid label {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
