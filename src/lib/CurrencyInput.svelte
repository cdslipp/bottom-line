<script>
	let { value = $bindable('') } = $props();

	const formatValue = (val) => {
		let numericValue = String(val).replace(/\D/g, '');
		if (numericValue === '') {
			return '';
		}
		numericValue = (parseFloat(numericValue) / 100).toFixed(2);
		return numericValue;
	};

	$effect(() => {
		value = formatValue(value);
	});

	const handleInput = (e) => {
		value = e.target.value;
	};
</script>

<input type="text" bind:value on:input={handleInput} placeholder="0.00" />

<style>
	input[type='text'] {
		-moz-appearance: textfield;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input {
		width: 100px;
		text-align: right;
	}
</style>
