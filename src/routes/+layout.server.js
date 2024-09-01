/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	const user = locals.user;

	if (user) {
		console.log('User:', user);
		return { user };
	}

	// No authenticated user
	return { user: null };
}
