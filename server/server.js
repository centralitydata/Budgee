BudgetCodes._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('name', {unique: 1});

Meteor.publish('budget_codes', function () {
  return BudgetCodes.find({});
});

Meteor.publish('budget_categories', function () {
  return BudgetCategories.find({});
});

Meteor.publish('finance_tree', function (municipality_id, year) {
  var query = {
    year: +year,
    municipality_id: +municipality_id
  };

  return FinanceTrees.find(query);
});
