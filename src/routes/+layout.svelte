<script>
	import '@picocss/pico';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { onMount } from 'svelte';
	import { getDB } from '$lib/auth/instantDB';
	import { Passage } from '@passageidentity/passage-js';

	/** @type {import('./$types').LayoutData} */
	let { data } = $props();

	let user = $state(data.user);
	let isLoading = $state(!user);
	let error = $state(null);

	const db = getDB();
	setContext('db', db);
	setContext('user', user);

	onMount(async () => {
		if (browser && !user) {
			try {
				const passage = new Passage(import.meta.env.VITE_PUBLIC_PASSAGE_APP_ID);
				const passageUser = passage.getCurrentUser();
				if (passageUser) {
					const userInfo = await passageUser.userInfo();
					if (userInfo) {
						user = userInfo;
						setContext('user', user);
						syncUserWithInstantDB(user);
					}
				}
			} catch (e) {
				console.error('Error fetching client-side user info:', e);
				error = e.message;
			} finally {
				isLoading = false;
			}
		}
	});

	async function syncUserWithInstantDB(passageUser) {
		db.subscribeQuery({ users: { $: { where: { passageId: passageUser.id } } } }, (resp) => {
			if (resp.error) {
				console.error('Error fetching user from InstantDB:', resp.error);
			} else if (resp.data && resp.data.users && resp.data.users.length > 0) {
				// User exists in InstantDB, update if necessary
				const dbUser = resp.data.users[0];
				if (needsUpdate(dbUser, passageUser)) {
					updateUser(dbUser.id, passageUser);
				}
			} else {
				// User doesn't exist in InstantDB, create new user
				createNewUser(passageUser);
			}
		});
	}

	function needsUpdate(dbUser, passageUser) {
		// Compare relevant fields and return true if an update is needed
		return (
			dbUser.email !== passageUser.email ||
			dbUser.emailVerified !== passageUser.email_verified ||
			dbUser.lastLoginAt !== passageUser.last_login_at
		);
	}

	async function updateUser(userId, passageUser) {
		await db.transact(
			db.tx.users[userId].update({
				email: passageUser.email,
				emailVerified: passageUser.email_verified,
				lastLoginAt: passageUser.last_login_at,
				updatedAt: new Date().toISOString()
			})
		);
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
		await db.transact(db.tx.users[newUser.id].update(newUser));
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
		<!-- Add Passage login component here -->
	{/if}
	<slot />
</main>
