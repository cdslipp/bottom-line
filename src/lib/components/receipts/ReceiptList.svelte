<script>
	import { getContext } from 'svelte';
	const db = getContext('db');
	import { deleteReceipt } from '$lib/helpers/receipts/receiptHelpers';

	let { receipts = [], categories = [] } = $props();

	const handleDeleteReceipt = (id) => {
		deleteReceipt(id, db);
	};

	const toggleDetails = (index) => {
		receipts[index].showDetails = !receipts[index].showDetails;
	};
</script>

{#snippet item(receipt, index)}
	<article>
		<div class="receipt-summary" on:click={() => toggleDetails(index)}>
			<div class="chip">
				{categories.find((cat) => cat.id === receipt.category)?.name || 'Uncategorized'}
			</div>
			<span>{receipt.storeInfo.name}</span> - <span>${receipt.totals.total}</span>
		</div>

		{#if receipt.showDetails}
			{@render details(receipt)}
		{/if}
	</article>
{/snippet}

{#snippet details(receipt)}
	<p><b>Date:</b> {receipt.transactionInfo.datetime}</p>
	<table class="striped">
		<thead>
			<tr>
				<th>Description</th>
				<th>Quantity</th>
				<th>Unit Price</th>
				<th>Total Price</th>
			</tr>
		</thead>
		<tbody>
			{#each receipt.items as item}
				<tr>
					<td>{item.description}</td>
					<td>{item.quantity}</td>
					<td>${item.unitPrice.toFixed(2)}</td>
					<td>${item.totalPrice.toFixed(2)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p><b>Subtotal:</b> ${receipt.totals.subtotal.toFixed(2)}</p>
	<p><b>Tax ({receipt.totals.taxType}):</b> ${receipt.totals.taxAmount.toFixed(2)}</p>
	<p><b>Total:</b> ${receipt.totals.total.toFixed(2)}</p>
	<button
		class="delete-button"
		on:click={(event) => {
			event.stopPropagation();
			handleDeleteReceipt(receipt.id);
		}}
	>
		Delete
	</button>
{/snippet}

<h2>Uploaded Receipts</h2>
<ul>
	{#each receipts as receipt, index}
		{@render item(receipt, index)}
	{/each}
</ul>

<style>
	ul {
		list-style-type: none;
		padding: 0;
	}

	.receipt-summary {
		cursor: pointer;
		user-select: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.delete-button {
		background: red;
		color: white;
		border: none;
		padding: 5px;
		cursor: pointer;
	}
	.chip {
		background-color: blue;
		color: white;
		padding: 5px;
		border-radius: 5px;
	}
	.striped {
		width: 100%;
	}
</style>
