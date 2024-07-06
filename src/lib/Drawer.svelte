<script>
	export let selectedCategory = null;
	export let addTransaction;
	export let isOpen = false;

	const closeDrawer = () => {
		isOpen = false;
		selectedCategory = null;
	};
</script>

{#if isOpen}
	<nav class="drawer">
		<div class="drawer-header">
			<h2>Edit Category: {selectedCategory?.name}</h2>
			<button on:click={closeDrawer}>Close</button>
		</div>
		{#if selectedCategory}
			<input type="text" bind:value={selectedCategory.name} class="category-name-input" />
			<button on:click={addTransaction} class="add-transaction">+</button>
			<h3>Transactions:</h3>
			<ul class="transaction-list">
				{#each selectedCategory.transactions as transaction}
					<li class="transaction-item">
						<span>{transaction.description} - {transaction.date}</span>
						<span>{transaction.subtotal} (?)</span>
					</li>
				{/each}
			</ul>
		{/if}
		<slot></slot>
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
		overflow-y: scroll;
		padding: 20px;
		color: #333;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
		z-index: 2;
		display: flex;
		flex-direction: column; /* Ensure drawer content is in a column */
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.category-name-input {
		width: calc(100% - 20px);
		margin-bottom: 10px;
		padding: 10px;
	}

	.add-transaction {
		background: #007bff;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-bottom: 20px;
	}

	.transaction-list {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-direction: column; /* Ensure transactions are in a column */
		gap: 10px; /* Add some space between transactions */
	}

	.transaction-item {
		display: flex;
		justify-content: space-between;
		background: #fff;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}
</style>
