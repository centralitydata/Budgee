/***************************************************************************
 * Subscriptions
 */

Meteor.subscribe('budget_codes');
Meteor.subscribe('budget_categories');


/***************************************************************************
 * Data from subscriptions
 */

Template.registerHelper('budget_codes', function () {
  return BudgetCodes.find({});
});

Template.registerHelper('budget_categories', function () {
  return BudgetCategories.find({});
});

Template.registerHelper('finance_trees', function () {
  return FinanceTrees.find({});
});


/***************************************************************************
 * Additional template helpers
 */

Template.registerHelper('isNegative', function (num) {
  return num < 0;
});


/***************************************************************************
 * D3
 */

Template.expenses.rendered = function () {
  var query_params = this.data;
  var tree_data = FinanceTrees.findOne(query_params);
  Meteor.a4a_functions.draw_treemap(tree_data, '#vis');
};
