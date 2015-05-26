BudgetCodes._ensureIndex('code', {unique: 1});

Meteor.publish('budget_codes', function () {
  return BudgetCodes.find({});
});
