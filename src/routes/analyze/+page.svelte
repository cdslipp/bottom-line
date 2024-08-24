<script>
	let selectedFile = null;
	let analysisResult = $state('');
	let jsonResult = '';
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
				console.log(analysisResult);
				isLoading = false;

				// // Now call the second API to convert the result to JSON
				// await convertToJSON(analysisResult);
			};
			reader.readAsDataURL(selectedFile);
		} catch (error) {
			console.error('Error analyzing receipt with Claude:', error);
		}
	};

	const convertToJSON = async (text) => {
		try {
			const response = await fetch('/api/claude/analyze-receipt/convert-to-json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text })
			});

			const result = await response.json();
			jsonResult = result.jsonResult;
		} catch (error) {
			console.error('Error converting to JSON:', error);
		}
	};
</script>

<div class="analyzer-container">
	<h1>OCR Receipt Analyzer</h1>
	{isLoading}
	<input type="file" accept="image/*" on:change={handleFileChange} />
	<button on:click={analyzeReceiptClaude} aria-busy={isLoading}>
		{#if isLoading}
			analyzing...
		{:else}
			Analyze Receipt
		{/if}</button
	>

	{#if analysisResult}
		<h2>Analysis Result:</h2>
		<pre>{analysisResult}</pre>
	{/if}

	{#if jsonResult}
		<h2>JSON Result:</h2>
		<pre>{jsonResult}</pre>
	{/if}
</div>

<style>
	.analyzer-container {
		max-width: 600px;
		margin: auto;
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
