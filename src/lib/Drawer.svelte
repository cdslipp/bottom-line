<script>
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { analyzeReceiptFile, deleteReceipt } from '$lib/helpers/receipts/receiptHelpers';
	import ReceiptList from '$lib/components/receipts/ReceiptList.svelte';
	import { browser } from '$app/environment';

	let { selectedCategory = null, isOpen = false } = $props();

	const dispatch = createEventDispatcher();
	let db = null;
	let receipts = $state([]);
	let isLoading = $state(false);
	let selectedFile = null;

	if (browser) {
		db = getContext('db');
		db.subscribeQuery({ transactions: {} }, (resp) => {
			if (resp.error) {
				console.error('Error fetching receipts:', resp.error.message);
				return;
			}
			if (resp.data) {
				receipts = Object.values(resp.data.transactions)
					.filter((transaction) => transaction.category === selectedCategory.id) // Filter transactions by selected category
					.map((transaction) => ({
						...transaction,
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
			const jsonResult = await analyzeReceiptFile(selectedFile, [], db, selectedCategory.id); // Pass selectedCategory.id
			isLoading = false;
		} catch (error) {
			console.error('Error analyzing receipt:', error);
			alert(error.message);
			isLoading = false;
		}
	};

	const handleDeleteReceipt = (id) => {
		deleteReceipt(id, db);
	};

	const closeDrawer = () => {
		dispatch('close');
	};
</script>

{#if isOpen}
	<nav class="drawer">
		<div class="drawer-header">
			<h2>Manage {selectedCategory?.name}</h2>
			<button onclick={closeDrawer}>Close</button>
		</div>
		{#if selectedCategory}
			<article>
				<h3>Upload Receipt</h3>
				<input type="file" accept="image/*" onchange={handleFileChange} />
				<button onclick={analyzeReceiptClaude} aria-busy={isLoading}>
					{#if isLoading}
						analyzing...
					{:else}
						Analyze Receipt
					{/if}
				</button>
			</article>
			<h3>Receipts for {selectedCategory.name}</h3>
			<ReceiptList {receipts} categories={[selectedCategory]} on:delete={handleDeleteReceipt} />
		{/if}
	</nav>
{/if}

<style>
	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: 40dvw;
		background: #f7f7f7;
		overflow-y: auto;
		padding: 20px;
		color: #333;
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
		z-index: 2;
		display: flex;
		flex-direction: column;
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h3 {
		margin-bottom: 10px;
	}

	.upload-receipt {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.drawer button {
		background: #007bff;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-top: 10px;
	}
</style>
