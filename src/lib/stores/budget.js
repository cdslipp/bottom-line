import { writable, derived } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db } from '../db';

function createBudgetStore() {
	const { subscribe, set } = writable({
		currentBudgetId: null,
		incomeCategories: [],
		expenseCategories: []
	});

	return {
		subscribe,
		initializeBudget: async () => {
			let currentBudget = await db.budgets.orderBy('date').last();
			if (!currentBudget) {
				const id = await db.budgets.add({ date: new Date() });
				currentBudget = await db.budgets.get(id);
			}
			const categories = await db.categories.where('budgetId').equals(currentBudget.id).toArray();
			const incomeCategories = categories.filter((c) => c.type === 'income');
			const expenseCategories = categories.filter((c) => c.type === 'expense');

			set({ currentBudgetId: currentBudget.id, incomeCategories, expenseCategories });
		},
		addCategory: async (type, name, budgetedAmount) => {
			const { currentBudgetId } = await new Promise((resolve) => {
				subscribe((value) => resolve(value))();
			});

			const id = await db.categories.add({
				budgetId: currentBudgetId,
				type,
				name,
				budgetedAmount: parseFloat(budgetedAmount) || 0
			});

			return id;
		},
		updateCategory: (id, updates) => {
			return db.categories.update(id, updates);
		},
		addTransaction: (categoryId, transaction) => {
			return db.transactions.add({
				categoryId,
				date: transaction.date,
				description: transaction.description,
				amount: parseFloat(transaction.amount)
			});
		},
		createSnapshot: async () => {
			const newBudget = await db.budgets.add({ date: new Date() });
			const { incomeCategories, expenseCategories } = await new Promise((resolve) => {
				subscribe((value) => resolve(value))();
			});

			for (let category of [...incomeCategories, ...expenseCategories]) {
				const { id, ...categoryData } = category;
				await db.categories.add({
					...categoryData,
					budgetId: newBudget
				});
			}

			return newBudget;
		}
	};
}

export const budget = createBudgetStore();

// Live queries
export const incomeCategories = liveQuery(() =>
	db.categories.where({ type: 'income', budgetId: budget.currentBudgetId }).toArray()
);

export const expenseCategories = liveQuery(() =>
	db.categories.where({ type: 'expense', budgetId: budget.currentBudgetId }).toArray()
);

export const totalIncome = derived(incomeCategories, ($incomeCategories) =>
	$incomeCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0)
);

export const totalExpenses = derived(expenseCategories, ($expenseCategories) =>
	$expenseCategories.reduce((sum, cat) => sum + cat.budgetedAmount, 0)
);

export const netIncome = derived(
	[totalIncome, totalExpenses],
	([$totalIncome, $totalExpenses]) => $totalIncome - $totalExpenses
);
