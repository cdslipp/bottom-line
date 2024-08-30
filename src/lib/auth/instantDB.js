import { init, tx, id } from '@instantdb/core';
import { PUBLIC_INSTANT_DB_APP_ID } from '$env/static/public';

const db = init({ appId: PUBLIC_INSTANT_DB_APP_ID });

export function getDB() {
	return db;
}

export function validateUser(passageUser) {
	return new Promise((resolve, reject) => {
		let unsubscribe;
		const handleResponse = (resp) => {
			if (unsubscribe) unsubscribe();

			if (resp.error) {
				console.error('Error fetching user:', resp.error);
				reject(resp.error);
			} else if (resp.data && resp.data.users && resp.data.users.length > 0) {
				// User exists, update with latest Passage data
				const existingUser = resp.data.users[0];
				const updatedUser = {
					...existingUser,
					email: passageUser.email,
					emailVerified: passageUser.email_verified,
					loginCount: passageUser.login_count,
					lastLoginAt: passageUser.last_login_at,
					updatedAt: passageUser.updated_at
				};
				db.transact(tx.users[existingUser.id].update(updatedUser))
					.then(() => resolve(updatedUser))
					.catch((error) => reject(error));
			} else {
				// User doesn't exist, create a new one
				const newUser = {
					id: id(),
					passageId: passageUser.id,
					email: passageUser.email,
					emailVerified: passageUser.email_verified,
					loginCount: passageUser.login_count,
					lastLoginAt: passageUser.last_login_at,
					createdAt: passageUser.created_at,
					updatedAt: passageUser.updated_at
				};
				db.transact(tx.users[newUser.id].update(newUser))
					.then(() => resolve(newUser))
					.catch((error) => reject(error));
			}
		};

		unsubscribe = db.subscribeQuery(
			{ users: { $: { where: { passageId: passageUser.id } } } },
			handleResponse
		);
	});
}

export function updateUser(userId, updateData) {
	return new Promise((resolve, reject) => {
		db.transact(tx.users[userId].update(updateData))
			.then(() => {
				let unsubscribe;
				const handleResponse = (resp) => {
					if (unsubscribe) unsubscribe();

					if (resp.error) {
						console.error('Error fetching updated user:', resp.error);
						reject(resp.error);
					} else if (resp.data && resp.data.users && resp.data.users.length > 0) {
						resolve(resp.data.users[0]);
					} else {
						reject(new Error('User not found after update'));
					}
				};

				unsubscribe = db.subscribeQuery(
					{ users: { $: { where: { id: userId } } } },
					handleResponse
				);
			})
			.catch((error) => reject(error));
	});
}

export function deleteUser(userId) {
	return db.transact(tx.users[userId].delete());
}
