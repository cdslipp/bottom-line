<script>
	import BudgetList from '$lib/components/budget/BudgetList.svelte';

	import { getContext } from 'svelte';

	let user = $state(getContext('user'));

	console.log(user);
</script>

{#if user}
	<h1>Welcome to your budget, {user.email}</h1>
{/if}
<BudgetList />
