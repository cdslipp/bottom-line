/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	const user = locals.user;
	console.log('load function user', user);
	const instantToken = locals.instantToken;

	if (user) {
		return { user, instantToken };
	}

	// No authenticated user
	return { user: null };
}
