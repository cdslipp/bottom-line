<script>
	// Import necessary functions from Svelte and InstantDB
	import { getContext } from 'svelte';
	import { tx, id } from '@instantdb/core';
	import { browser } from '$app/environment';

	// Get the InstantDB instance from the global context
	const db = getContext('db');

	let selectedFile = null;
	let receipts = $state([]);
	let isLoading = $state(false);

	if (browser) {
		//Subscribe to data changes in the `transactions` collection
		db.subscribeQuery({ transactions: {} }, (resp) => {
			if (resp.error) {
				console.error('Error fetching receipts:', resp.error.message);
				return;
			}
			if (resp.data) {
				receipts = Object.values(resp.data.transactions).map((transaction) => ({
					vendor: transaction.storeInfo.name,
					total: transaction.totals.total,
					details: transaction,
					showDetails: false
				}));
			}
		});
	}

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
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ imageBase64: base64Image, mediaType: selectedFile.type })
				});

				const result = await response.json();
				let analysisResult = result.analysisResult;

				if (analysisResult.includes('Invalid. This is not a receipt.')) {
					isLoading = false;
					throw new Error('The uploaded image is not a valid receipt.');
				}

				// Convert to JSON
				const jsonResult = await convertToJSON(analysisResult);

				// Save to InstantDB
				db.transact(tx.transactions[id()].update(jsonResult));

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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});

			const result = await response.json();
			return JSON.parse(result.jsonResult); // Parse the JSON result before returning
		} catch (error) {
			console.error('Error converting to JSON:', error);
			throw new Error('Failed to convert receipt text to JSON');
		}
	};

	const toggleDetails = (index) => {
		receipts[index].showDetails = !receipts[index].showDetails;
	};

	const deleteReceipt = (receiptId) => {
		db.transact(tx.transactions[receiptId].delete());
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

	<h2>Uploaded Receipts</h2>
	<ul>
		{#each receipts as receipt, index}
			<li>
				<div class="receipt-summary" on:click={() => toggleDetails(index)}>
					<span>{receipt.vendor}</span> - <span>${receipt.total}</span>
					<button
						class="delete-button"
						on:click={(event) => {
							event.stopPropagation();
							deleteReceipt(receipt.details.id);
						}}>Delete</button
					>
				</div>
				{#if receipt.showDetails}
					<pre>{JSON.stringify(receipt.details, null, 2)}</pre>
				{/if}
			</li>
		{/each}
	</ul>
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
	.analyzer-container h2 {
		margin-top: 30px;
		text-align: left;
	}
	.analyzer-container ul {
		list-style-type: none;
		padding: 0;
	}
	.analyzer-container li {
		margin: 10px 0;
		position: relative;
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
	.analyzer-container pre {
		background: #f4f4f4;
		padding: 10px;
		border: 1px solid #ddd;
		text-align: left;
	}
</style>
