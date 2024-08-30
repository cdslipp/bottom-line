import { browser } from '$app/environment';
import { PassageUser } from '@passageidentity/passage-elements/passage-user';

export async function getPassageUser() {
	if (!browser) {
		return null;
	}
	try {
		const user = new PassageUser();
		const userInfo = await user.userInfo();
		return userInfo;
	} catch (error) {
		console.error('Error fetching Passage user info:', error);
		return null;
	}
}

export async function authenticatePassageUser() {
	if (!browser) {
		return null;
	}
	try {
		const passageUser = new PassageUser();
		const isAuthenticated = await passageUser.authGuard();
		console.log('Passage user authenticated:', isAuthenticated);
		if (isAuthenticated) {
			return passageUser.userInfo();
		} else {
			return null;
		}
	} catch (error) {
		console.error('Error during Passage authentication:', error);
		return null;
	}
}

export async function signOutPassageUser() {
	if (!browser) {
		return false;
	}
	try {
		const user = new PassageUser();
		const signedOut = await user.signOut();
		return signedOut;
	} catch (error) {
		console.error('Error signing out Passage user:', error);
		return false;
	}
}
