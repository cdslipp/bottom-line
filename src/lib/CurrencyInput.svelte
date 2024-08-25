<script>
	let { value = $bindable(0), mode = 'precise' } = $props();

	console.log(mode);

	function formatCurrency(num, mode) {
		switch (mode) {
			case 'precise':
				return new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'CAD',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}).format(num);
			case 'dollars':
				return new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'CAD',
					minimumFractionDigits: 0,
					maximumFractionDigits: 0
				}).format(Math.round(num));
			case 'thousands':
				return (
					new Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'CAD',
						notation: 'compact',
						compactDisplay: 'short',
						minimumFractionDigits: 0,
						maximumFractionDigits: 1
					}).format(num / 1000) + 'K'
				);
		}
	}

	function parseCurrency(val, mode) {
		const numericString = val.replace(/[^\d.]/g, '');
		switch (mode) {
			case 'precise':
				return parseFloat(numericString) || 0;
			case 'dollars':
				return Math.round(parseFloat(numericString)) || 0;
			case 'thousands':
				return (parseFloat(numericString) || 0) * 1000;
		}
	}

	let displayValue = $derived(formatCurrency(value, mode));

	function handleInput(event) {
		const input = event.target;
		const cursorPosition = input.selectionStart;
		const rawValue = input.value.replace(/[^\d.]/g, '');

		let newValue;
		switch (mode) {
			case 'precise':
				const paddedValue = rawValue.padStart(3, '0');
				const formattedValue = paddedValue.slice(0, -2) + '.' + paddedValue.slice(-2);
				newValue = parseFloat(formattedValue);
				break;
			case 'dollars':
				newValue = parseInt(rawValue, 10);
				break;
			case 'thousands':
				newValue = parseFloat(rawValue) * 1000;
				break;
		}

		value = newValue;

		// Calculate new cursor position
		setTimeout(() => {
			const newPosition = cursorPosition - (input.value.length - rawValue.length);
			input.setSelectionRange(newPosition, newPosition);
		}, 0);
	}

	function handleFocus(event) {
		event.target.select();
	}
</script>

<input
	type="text"
	class="moneyInput"
	value={displayValue}
	on:input={handleInput}
	on:focus={handleFocus}
	placeholder={mode === 'thousands' ? '$0K' : '$0'}
/>

<style>
	.moneyInput {
		text-align: right;
		font-family: monospace;
	}
</style>
