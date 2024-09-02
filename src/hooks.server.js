import Passage from '@passageidentity/passage-node';
import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';
import { PASSAGE_API_KEY } from '$env/static/private';

import { init, tx, id } from '@instantdb/admin';
import { PUBLIC_INSTANT_DB_APP_ID } from '$env/static/public';
import { INSTANT_ADMIN_TOKEN } from '$env/static/private';

const db = init({
	appId: PUBLIC_INSTANT_DB_APP_ID,
	adminToken: INSTANT_ADMIN_TOKEN
});

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
				const instantToken = await db.auth.createToken(userInfo.email);
				console.log('Instant token created dude', instantToken);

				if (userInfo.email) {
					// const instantUser = await db.auth.getUser({ email: userInfo.email });
					console.log('instantUser', instantUser);
				}

				event.locals.user = userInfo;
				event.locals.instantToken = instantToken;
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
