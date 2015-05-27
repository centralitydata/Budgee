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

Template.registerHelper('finances', function () {
  return Finances.find({});
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

Template.finances.rendered = function () {
  console.log('Rendered, have data:',this.data);

  var data = Meteor.a4a_functions.load_treemap_data(this.data);
  Meteor.a4a_functions.draw_treemap(data, '#vis');
};
