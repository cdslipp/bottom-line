<script>
	import BudgetList from '$lib/components/budget/BudgetList.svelte';

	import { getContext } from 'svelte';

	let user = $state(getContext('user'));

	console.log(user);
</script>

<h1>Welcome to your budget, {user}</h1>
<BudgetList />
