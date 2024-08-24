import Dexie from 'dexie';

export const db = new Dexie('BudgetDatabase');
db.version(1).stores({
	budgets: '++id, date',
	categories: '++id, budgetId, type, name',
	transactions: '++id, categoryId, date, description, amount'
});

// Define typed tables
db.budgets.mapToClass(
	class Budget {
		id;
		date;
	}
);

db.categories.mapToClass(
	class Category {
		id;
		budgetId;
		type;
		name;
		budgetedAmount;
	}
);

db.transactions.mapToClass(
	class Transaction {
		id;
		categoryId;
		date;
		description;
		amount;
	}
);
