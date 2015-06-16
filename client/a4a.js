/***************************************************************************
 * Client-only collections
 */
Municipalities = new Mongo.Collection('municipalities');
Years = new Mongo.Collection('years');

/***************************************************************************
 * Subscriptions
 */

Meteor.subscribe('budget_codes');
Meteor.subscribe('budget_categories');
Meteor.subscribe('municipalities');
Meteor.subscribe('years');


/***************************************************************************
 * Data from subscriptions
 */

Template.registerHelper('budget_codes', function () {
  return BudgetCodes.find({});
});

Template.registerHelper('budget_categories', function () {
  return BudgetCategories.find({});
});

/*
Template.registerHelper('finance_trees', function () {
  return FinanceTrees.find({});
});
*/

Template.registerHelper('municipalities', function () {
  return Municipalities.find({}, {sort: {municipality: 1}});
});

Template.registerHelper('years', function () {
  return Years.find({});
});


/***************************************************************************
 * Additional template helpers
 */

Template.registerHelper('isNegative', function (num) {
  return num < 0;
});


Template.nav.events({
  'submit #vis-params': function (e) {
    e.preventDefault();

    var municipality_id = e.target['vis-municipality'].value;
    var year = e.target['vis-year'].value;

    Router.go('expenses', {municipality_id: municipality_id, year: year});
  }
});


/***************************************************************************
 * D3
 */

Template.expenses.rendered = function () {
  // Set the height of the target div
  var chart = $('#chart');
  chart.height(chart.width()/1.618);

  var query_params = this.data;
  var tree_data = FinanceTrees.findOne(query_params);
  Meteor.a4a_functions.draw_treemap(tree_data, '#chart');
};
