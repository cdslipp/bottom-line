import Passage from '@passageidentity/passage-node';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { PASSAGE_API_KEY } from '$env/static/private';

const passageConfig = {
	appID: PUBLIC_PASSAGE_APP_ID,
	apiKey: PASSAGE_API_KEY
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const authToken = event.cookies.get('psg_auth_token');

	if (authToken) {
		const passage = new Passage(passageConfig);
		try {
			const userID = await passage.authenticateRequest(event.request);

			if (userID) {
				const userInfo = await passage.user.get(userID);
				event.locals.user = userInfo;
			} else {
				event.locals.user = null;
			}
		} catch (error) {
			console.error('Authentication error in handle:', error);
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return await resolve(event);
}
