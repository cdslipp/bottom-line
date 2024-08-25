<script>
	import { getContext } from 'svelte';
	import { browser } from '$app/environment';
	import { analyzeReceiptFile } from '$lib/helpers/receipts/receiptHelpers';
	import ReceiptList from './ReceiptList.svelte';

	const db = getContext('db');

	let selectedFile = null;
	let receipts = $state([]);
	let categories = $state([]);
	let isLoading = $state(false);

	if (browser) {
		db.subscribeQuery({ transactions: {}, categories: {} }, (resp) => {
			if (resp.error) {
				console.error('Error fetching data:', resp.error.message);
				return;
			}
			if (resp.data) {
				receipts = Object.values(resp.data.transactions).map((transaction) => ({
					...transaction,
					showDetails: false
				}));
				categories = Object.values(resp.data.categories).map((category) => ({
					...category
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
			const jsonResult = await analyzeReceiptFile(selectedFile, categories, db);
			isLoading = false;
		} catch (error) {
			console.error('Error analyzing receipt:', error);
			alert(error.message);
			isLoading = false;
		}
	};

	$effect(() => {
		console.log('Receipts:', receipts);
		console.log('Categories:', categories);
	});
</script>

<div class="analyzer-container">
	<article>
		<h1>Receipt Analyzer</h1>
		<input type="file" accept="image/*" on:change={handleFileChange} />
		<button on:click={analyzeReceiptClaude} aria-busy={isLoading}>
			{#if isLoading}
				analyzing...
			{:else}
				Analyze Receipt
			{/if}
		</button>
	</article>
	<ReceiptList {receipts} {categories} />
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
</style>
