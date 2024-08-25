<script>
	import '@picocss/pico';
	import '../app.css';

	import { setContext } from 'svelte';
	import { init } from '@instantdb/core';

	// ID for app: bottom line
	const APP_ID = '7d8d7c86-857f-4a32-bf4b-c713660c54af';

	// Initialize the database
	const db = init({ appId: APP_ID });

	// ...and add it to the context for child components to access
	setContext('db', db);
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
