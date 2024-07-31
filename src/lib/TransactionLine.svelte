<script>
	export let transaction;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	};
</script>

<div class="transaction-line">
	<span class="date">{formatDate(transaction.date)}</span>
	<span class="description">{transaction.description}</span>
	<span class="amount">{formatCurrency(parseFloat(transaction.total))}</span>
</div>

<style>
	.transaction-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.date {
		flex: 0 0 80px;
	}

	.description {
		flex: 1;
		margin: 0 1rem;
	}

	.amount {
		flex: 0 0 80px;
		text-align: right;
	}
</style>
