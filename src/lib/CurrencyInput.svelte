<script>
	export let value = 0;

	const formatValue = (val) => {
		console.log('Raw input value:', val);
		let numericValue = String(val).replace(/\D/g, '');
		console.log('Formatted numeric value:', numericValue);
		if (numericValue === '') return '0';
		numericValue = parseInt(numericValue, 10);
		console.log('Parsed integer value:', numericValue);
		return numericValue;
	};

	$: value = formatValue(value);

	const handleInput = (e) => {
		console.log('Handling input...', e.target.value);
		value = formatValue(e.target.value);
		console.log('Updated value:', value);
	};
</script>

<input type="text" class="moneyInput" bind:value on:input={handleInput} placeholder="0" />
