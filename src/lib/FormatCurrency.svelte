<script>
	let { value = $bindable() } = $props();

	// Function to format number as currency with two decimal places and commas
	function formatCurrency(num) {
		return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	// Use $derived to ensure formattedValue updates reactively
	let formattedValue = $derived(formatCurrency(parseFloat(value || 0)));
</script>

<div>${formattedValue}</div>
