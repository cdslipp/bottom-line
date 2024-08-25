import { tx, id } from '@instantdb/core';

export function deleteReceipt(receiptId, db) {
	db.transact(tx.transactions[receiptId].delete());
}

export const analyzeReceiptFile = async (file, categories, db, categoryId) => {
	const reader = new FileReader();

	return new Promise((resolve, reject) => {
		reader.onload = async (e) => {
			try {
				const base64Image = e.target.result.split(',')[1];

				const response = await fetch('/api/claude/analyze-receipt', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ imageBase64: base64Image, mediaType: file.type })
				});

				const result = await response.json();
				let analysisResult = result.analysisResult;

				if (analysisResult.includes('Invalid. This is not a receipt.')) {
					reject(new Error('The uploaded image is not a valid receipt.'));
				}

				// Convert to JSON
				const jsonResult = await convertToJSON(analysisResult);

				// Save to InstantDB with category association
				db.transact(tx.transactions[id()].update({ ...jsonResult, category: categoryId }));

				resolve(jsonResult);
			} catch (error) {
				reject(error);
			}
		};

		reader.readAsDataURL(file);
	});
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
		throw new Error('Failed to convert receipt text to JSON');
	}
};
