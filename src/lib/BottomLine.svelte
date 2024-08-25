<script>
	import FormatCurrency from './FormatCurrency.svelte';

	let { totalIncome = $bindable(), totalExpenses = $bindable(), netIncome } = $props();
</script>

<section class="bottom-line">
	<div class="section">
		<FormatCurrency bind:value={totalIncome} />
		<p class="label">revenue</p>
	</div>
	<div class="section operator">
		<p class="operator-box">-</p>
	</div>
	<div class="section">
		<FormatCurrency bind:value={totalExpenses} />
		<p class="label">expenses</p>
	</div>
	<div class="section operator">
		<p class="operator-box">=</p>
	</div>
	<div
		class="section net-income"
		class:positive={parseFloat(netIncome) >= 0}
		class:negative={parseFloat(netIncome) < 0}
	>
		<FormatCurrency bind:value={netIncome} />
		<p class="label">net income</p>
	</div>
</section>

<style>
	.bottom-line {
		margin-top: 2rem;
		position: sticky;
		bottom: 0;
		background-color: #fff;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
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

	.operator {
		display: flex;
		align-items: center; /* Vertically centers the operator within the .bottom-line container */
	}

	.operator-box {
		font-size: 2.5rem;
		font-weight: bold;
		background-color: #f0f0f0;
		padding: 0.5rem 1rem;
		border-radius: 8px;
	}
</style>
