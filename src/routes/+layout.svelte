<script>
	import '@picocss/pico';
	import '../app.css';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { authenticatePassageUser } from '$lib/auth/passage';
	import { getDB, validateUser } from '$lib/auth/instantDB';

	let passageUser = $state(null);
	let isLoading = $state(true);
	let error = $state(null);

	const db = getDB();
	setContext('db', db);

	$effect(async () => {
		console.log('effect looping');
		if (browser) {
			console.log('user', user);
			console.log('effect looping');
			if (passageUser == null) {
				passageUser = await authenticatePassageUser();
			}
			if (passageUser && passageUser.id) {
				console.log('Passage user authenticated and no instant user:', passageUser);
				const user = await validateUser(passageUser);
				console.log('InstantDB user:', user);
				if (user) {
					setContext('user', user);
				} else {
					throw new Error('Failed to get or create user in InstantDB');
				}
			} else {
				console.log('No authenticated Passage user');
			}
		}
	});
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

	<slot />
</main>
