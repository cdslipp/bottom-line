/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	const user = locals.user;
	const instantToken = locals.instantToken;

	if (user) {
		return { user, instantToken };
	}

	// No authenticated user
	return { user: null };
}
