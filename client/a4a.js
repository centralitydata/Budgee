Meteor.subscribe('budget_codes');

Template.registerHelper('budget_codes', function () {
  return BudgetCodes.find({});
});
