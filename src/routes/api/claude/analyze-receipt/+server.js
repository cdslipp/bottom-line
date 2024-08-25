import { json } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
	const { imageBase64, mediaType } = await request.json();
	const apiKey = ANTHROPIC_API_KEY;

	if (!apiKey) {
		return json({ error: 'API key is missing' }, { status: 500 });
	}

	const anthropic = new Anthropic({ apiKey });

	try {
		const msg = await anthropic.messages.create({
			model: 'claude-3-5-sonnet-20240620',
			max_tokens: 1000,
			temperature: 0,
			system:
				'Tell me as many details as you can glean from this receipt. Please carefully interpret the date and time and when interpreting a confusing date, always assume the receipt uses ISO date format with the year first - ie yyyy/mm/dd OR yy/mm/dd. When you are finished, also please infer the timezone the purchase was made in, and format it like this example: America/Toronto. If the image does not appear to be a receipt, you must respond by simply saying: Invalid. This is not a receipt. One more time, please carefully check the date on the receipt, and if you are uncertain, assume that the YEAR comes first, ie yy/mm/dd',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'image',
							source: {
								type: 'base64',
								media_type: mediaType,
								data: imageBase64
							}
						}
					]
				}
			]
		});

		const analysisResult = msg.content[0].text;
		return json({ analysisResult });
	} catch (error) {
		console.error('Error analyzing receipt with Claude:', error);
		return json({ error: 'Error analyzing receipt' }, { status: 500 });
	}
}
