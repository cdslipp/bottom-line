<script>
	import { PUBLIC_PASSAGE_APP_ID } from '$env/static/public';

	let passageWrapper;
</script>

<div class="wrapper column center">
	<h1>Log In</h1>
	<div id="back-sheet">
		<div id="passage-auth" class="hide" bind:this={passageWrapper}>
			<passage-login app-id={PUBLIC_PASSAGE_APP_ID}></passage-login>
		</div>
	</div>
	<div id="info">
		<p>Don't have an account? <a class="link" href="register">Register here.</a></p>

		<p class="small">
			We don't use passwords. Log in with a passkey or send yourself a code via email. Never heard
			of passkeys? <a class="link" href="/passkeys">Learn more here.</a>
		</p>
	</div>
</div>

<style>
	.wrapper {
		width: 300px;
		justify-items: center;
	}

	#back-sheet {
		width: 300px;
		height: 200px;
		background: var(--gradient-background);
		background-size: 400% 400%;
		animation: pulse 2s ease infinite;
		z-index: 1; /* Ensure it's behind the passage-wrapper */
		border-radius: 5px;
	}

	#passage-wrapper.hide {
		display: none;
		opacity: 0;
		transition:
			opacity 0.2s ease,
			transform 0.1s ease;
	}

	#passage-wrapper:not(.hide) {
		display: block;
		opacity: 1;
		z-index: 2;
	}

	#info {
		text-align: center;
	}

	@keyframes pulse {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
