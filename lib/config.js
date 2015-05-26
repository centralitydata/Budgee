// Define a new collection in the global namespace (so no 'var')
BudgetCodes = new Mongo.Collection('budget_codes');

Accounts.config({
	sendVerificationEmail: true,
	restrictCreationByEmailDomain: 'centrality.ca'
});
