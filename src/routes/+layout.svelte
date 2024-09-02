<script>
	import '@picocss/pico';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { getDB } from '$lib/auth/instantDB';
	import { goto } from '$app/navigation';
	import { init, tx, id } from '@instantdb/core';

	/** @type {import('./$types').LayoutData} */
	let { data } = $props();

	let passageUser = $state();
	let instantUser = $state();
	let user = $state();

	if (data.user) {
		passageUser = data.user.passage;
		instantUser = data.user.instant;
	}

	const db = getDB();

	setContext('db', db);
	setContext('passageUser', passageUser);
	setContext('instantUser', instantUser);

	if (data.instantToken && browser) {
		console.log('Client side instant token:', data.instantToken);
		db.auth.signInWithToken(data.instantToken);
	}

	if (browser && passageUser && instantUser) {
		db.subscribeQuery({ users: { $: { where: { passage_id: passageUser.id } } } }, (resp) => {
			if (resp.error) {
				console.error('Error fetching user data:', resp.error.message);
				return;
			}
			if (resp.data && resp.data.users && resp.data.users.length > 0) {
				user = resp.data.users[0];
				console.log('User data:', user);

				// Check if the instantID needs to be updated
				if (user.instantID !== instantUser.id) {
					updateUserInstantID(user.id, instantUser.id);
				}
			} else {
				// User doesn't exist in InstantDB, create a new one
				console.log('Creating new user in InstantDB');
				const newUser = {
					passage_id: passageUser.id,
					instantID: instantUser.id,
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

	function updateUserInstantID(userId, instantId) {
		db.transact([tx.users[userId].update({ instantID: instantId })]);
	}

	function handleLogout() {
		// Implement logout logic here
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
			{#if passageUser}
				<li><button on:click={handleLogout}>Logout</button></li>
			{/if}
		</ul>
	</nav>
	{#if passageUser}
		<p>Loading user data...</p>
	{:else if !passageUser}
		<p>Please log in</p>
	{:else}{/if}
	<slot />
</main>
