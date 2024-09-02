<script>
	import '@picocss/pico';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { getDB } from '$lib/auth/instantDB';
	import { goto } from '$app/navigation';
	import { tx, id } from '@instantdb/core';

	/** @type {import('./$types').LayoutData} */
	let { data } = $props();

	let passageUser = $state(data.user);
	let instantDBUser = $state(null);
	const db = getDB();

	setContext('db', db);
	setContext('passageUser', passageUser);

	if (browser && passageUser) {
		db.subscribeQuery({ users: { $: { where: { passage_id: passageUser.id } } } }, (resp) => {
			if (resp.error) {
				console.error('Error fetching user data:', resp.error.message);
				return;
			}
			if (resp.data && resp.data.users && resp.data.users.length > 0) {
				instantDBUser = resp.data.users[0];
				console.log('passage user', passageUser);
				console.log('User data:', instantDBUser);
			} else {
				// User doesn't exist in InstantDB, create a new one
				console.log('Creating new user in InstantDB');
				console.log('Passage user:', passageUser);
				const newUser = {
					passage_id: passageUser.id,
					email: passageUser.email,
					first_name: passageUser.name,
					last_name: passageUser.name,
					last_login_at: passageUser.last_login_at,
					login_count: passageUser.login_count,
					updated_at: passageUser.updated_at
				};
				db.transact([tx.users[id()].update(newUser)]);
			}
		});
	}

	function handleLogout() {
		// Clear Passage auth token
		document.cookie = 'psg_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

		// Clear InstantDB user
		instantDBUser = null;

		// Redirect to home page or login page
		goto('/');
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
			{#if passageUser && instantDBUser}
				<li><button on:click={handleLogout}>Logout</button></li>
			{/if}
		</ul>
	</nav>
	{#if passageUser && !instantDBUser}
		<p>Loading user data...</p>
	{:else if !passageUser}
		<p>Please log in</p>
	{:else}{/if}
	<slot />
</main>
