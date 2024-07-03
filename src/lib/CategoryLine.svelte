<script>
	export let transaction;
</script>

<div class="transaction-item">
	<span>{transaction.date}</span>
	<span>{transaction.description}</span>
	<span>${transaction.subtotal}</span>
	<span>${transaction.salesTax}</span>
	<span>${transaction.total}</span>
</div>

<style>
	.transaction-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.transaction-item:nth-child(odd) {
		background-color: #f5f5f5;
	}
</style>
