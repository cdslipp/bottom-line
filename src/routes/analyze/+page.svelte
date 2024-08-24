<script>
	let selectedFile = null;
	let analysisResult = $state('');
	let jsonResult = $state('');
	let isLoading = $state(false);

	const handleFileChange = (event) => {
		selectedFile = event.target.files[0];
	};

	const analyzeReceiptClaude = async () => {
		if (!selectedFile) {
			alert('Please select a file first.');
			return;
		}

		isLoading = true;

		try {
			const reader = new FileReader();
			reader.onload = async (e) => {
				const base64Image = e.target.result.split(',')[1];

				const response = await fetch('/api/claude/analyze-receipt', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ imageBase64: base64Image, mediaType: selectedFile.type })
				});

				const result = await response.json();
				analysisResult = result.analysisResult;

				if (analysisResult.includes('Invalid. This is not a receipt.')) {
					isLoading = false;
					throw new Error('The uploaded image is not a valid receipt.');
				}

				// Now call the second API to convert the result to JSON
				console.log('About to call JSON api');
				await convertToJSON(analysisResult);
				isLoading = false;
			};
			reader.readAsDataURL(selectedFile);
		} catch (error) {
			console.error('Error analyzing receipt with Claude:', error);
			alert(error.message);
			isLoading = false;
		}
	};

	const convertToJSON = async (text) => {
		try {
			const response = await fetch('/api/openai/convert-receipt-to-json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text })
			});

			const result = await response.json();
			jsonResult = result.jsonResult;
			console.log('JSON Result:', jsonResult);
		} catch (error) {
			console.error('Error converting to JSON:', error);
		}
	};
</script>

<div class="analyzer-container">
	<h1>OCR Receipt Analyzer</h1>
	<input type="file" accept="image/*" on:change={handleFileChange} />
	<button on:click={analyzeReceiptClaude} aria-busy={isLoading}>
		{#if isLoading}
			analyzing...
		{:else}
			Analyze Receipt
		{/if}
	</button>

	<!-- {#if analysisResult}
		<h2>Analysis Result:</h2>
		<pre>{analysisResult}</pre>
	{/if} -->

	{#if jsonResult}
		<h2>JSON Result:</h2>
		<pre>{jsonResult}</pre>
	{/if}
</div>

<style>
	.analyzer-container {
		max-width: 600px;
		text-align: center;
	}
	.analyzer-container input[type='file'] {
		margin: 20px 0;
	}
	.analyzer-container button {
		margin: 10px;
	}
	.analyzer-container pre {
		background: #f4f4f4;
		padding: 10px;
		border: 1px solid #ddd;
		text-align: left;
	}
</style>
