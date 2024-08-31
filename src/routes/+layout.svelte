<script>
	import '@picocss/pico';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { authenticatePassageUser } from '$lib/auth/passage';
	import { getDB, validateUser } from '$lib/auth/instantDB';

	let user = $state(null);
	let isLoading = $state(true);
	let error = $state(null);

	const db = getDB();
	setContext('db', db);

	$effect(() => {
		console.log('User:', user);
		if (user) {
			setContext('user', user);
		}
	});

	if (browser) {
		initializeUser();
	}

	async function initializeUser() {
		try {
			const passageUser = await authenticatePassageUser();
			if (passageUser && passageUser.id) {
				console.log('Passage user authenticated:', passageUser);
				db.subscribeQuery({ users: { $: { where: { passageId: passageUser.id } } } }, (resp) => {
					if (resp.error) {
						console.error('Error fetching user:', resp.error);
						error = resp.error.message;
					} else if (resp.data && resp.data.users && resp.data.users.length > 0) {
						user = resp.data.users[0];
					} else {
						// User doesn't exist, create a new one
						createNewUser(passageUser);
					}
					isLoading = false;
				});
			} else {
				console.log('No authenticated Passage user');
				isLoading = false;
			}
		} catch (e) {
			console.error('Error:', e);
			error = e.message;
			isLoading = false;
		}
	}

	async function createNewUser(passageUser) {
		const newUser = {
			id: db.id(),
			passageId: passageUser.id,
			email: passageUser.email,
			emailVerified: passageUser.email_verified,
			loginCount: passageUser.login_count,
			lastLoginAt: passageUser.last_login_at,
			createdAt: passageUser.created_at,
			updatedAt: passageUser.updated_at
		};
		try {
			await db.transact(db.tx.users[newUser.id].update(newUser));
			user = newUser;
			setContext('user', user);
		} catch (error) {
			console.error('Error creating user:', error);
			error = 'Failed to create new user';
		}
	}
</script>

<main class="container-fluid">
	<nav>
		<ul>
			<li><strong>Bottom Line</strong></li>
		</ul>
		<ul>
			<li><a href="/">Budgets</a></li>
			<li><a href="/analyze">Upload Receipts</a></li>
		</ul>
	</nav>

	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>Error: {error}</p>
	{:else if user}{:else}
		<p>Please log in</p>
		<!-- Add login component here if needed -->
	{/if}
	<slot />
</main>
