import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
	const { text } = await request.json();
	const apiKey = OPENAI_API_KEY;

	console.log('Starting OpenAI call');

	if (!apiKey) {
		return json({ error: 'API key is missing' }, { status: 500 });
	}

	const openai = new OpenAI({ apiKey });

	async function createAssistant() {
		const assistant = await openai.beta.assistants.create({
			name: 'Receipt Analyzer',
			instructions:
				'You are a receipt analyzer. You will be given a text block and you need to take all of the information and create a JSON object with THIS EXACT STRUCTURE: { "storeInfo": { "name": "Green Earth Market", "address": "150 Queen Street West, Toronto, ON M5H 2N1", "phone": "416-123-4567", "taxNumber": "987654321" }, "transactionInfo": { "datetime": "2024-08-24T14:30:00", "timezone": "America/Toronto", "receiptNumber": "784512", "paymentMethod": "Credit Card" }, "items": [ { "description": "Organic Apples", "quantity": 4, "unitPrice": 1.50, "totalPrice": 6.00 }, { "description": "Almond Milk - Unsweetened", "quantity": 2, "unitPrice": 3.75, "totalPrice": 7.50 }, { "description": "Whole Grain Bread", "quantity": 1, "unitPrice": 4.00, "totalPrice": 4.00 }, { "description": "Free Range Eggs", "quantity": 1, "unitPrice": 5.50, "totalPrice": 5.50 } ], "totals": { "subtotal": 23.00, "taxType": "HST", "taxAmount": 2.99, "total": 25.99 } }',
			tools: [],
			model: 'gpt-4o-mini',
			response_format: { type: 'json_object' }
		});
		return assistant.id; // Return the Assistant ID after creation
	}

	try {
		// Step 0: Create assistant and get its ID
		const assistantId = await createAssistant();

		// Step 1: Create a Thread
		const thread = await openai.beta.threads.create();
		console.log('Thread created:', thread.id);

		// Step 2: Add a Message to the Thread
		const messageResponse = await openai.beta.threads.messages.create(thread.id, {
			role: 'user',
			content: [
				{
					type: 'text',
					text: text
				}
			]
		});
		console.log('Message added to thread:', messageResponse.id);

		// Step 4: Create a Run and Poll
		const runResponse = await openai.beta.threads.runs.createAndPoll(thread.id, {
			assistant_id: assistantId,
			instructions:
				'You are a receipt analyzer. You will be given a text block and you need to take all of the information and create a JSON object with THIS EXACT STRUCTURE: { "storeInfo": { "name": "Green Earth Market", "address": "150 Queen Street West, Toronto, ON M5H 2N1", "phone": "416-123-4567", "taxNumber": "987654321" }, "transactionInfo": { "datetime": "2024-08-24T14:30:00", "timezone": "America/Toronto", "receiptNumber": "784512", "paymentMethod": "Credit Card" }, "items": [ { "description": "Organic Apples", "quantity": 4, "unitPrice": 1.50, "totalPrice": 6.00 }, { "description": "Almond Milk - Unsweetened", "quantity": 2, "unitPrice": 3.75, "totalPrice": 7.50 }, { "description": "Whole Grain Bread", "quantity": 1, "unitPrice": 4.00, "totalPrice": 4.00 }, { "description": "Free Range Eggs", "quantity": 1, "unitPrice": 5.50, "totalPrice": 5.50 } ], "totals": { "subtotal": 23.00, "taxType": "HST", "taxAmount": 2.99, "total": 25.99 } }'
		});

		if (runResponse.status === 'completed') {
			const messages = await openai.beta.threads.messages.list(runResponse.thread_id);

			const jsonResult = messages.data.reverse().find((message) => message.role === 'assistant')
				?.content[0].text.value;

			// console.log('Run completed:', jsonResult);
			return json({ jsonResult });
		} else {
			console.log(runResponse.status);
		}
	} catch (error) {
		console.error('Error converting to JSON:', error);
		return json({ error: 'Error converting to JSON' }, { status: 500 });
	}
}
