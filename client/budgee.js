/***************************************************************************
 * Subscriptions
 */

Meteor.subscribe('budget_codes');
Meteor.subscribe('budget_categories');
Meteor.subscribe('finance_trees');
Meteor.subscribe('municipalities');
Meteor.subscribe('years');


/***************************************************************************
 * Initialization
 */

// On some templates we want to be able to temporarily disable reactivity,
// e.g. during massive database updates
Session.setDefault('reactive', true);


/***************************************************************************
 * Data from subscriptions
 */

Template.registerHelper('budget_codes', function () {
  return BudgetCodes.find({});
});

Template.registerHelper('budget_categories', function () {
  return BudgetCategories.find({});
});

Template.registerHelper('municipalities', function () {
  return Municipalities.find({}, {sort: {municipality: 1}});
});

Template.registerHelper('years', function () {
  return Years.find({}, {sort: {year: 1}});
});


/***************************************************************************
 * Additional template helpers
 */

Template.registerHelper('isNegative', function (num) {
  return num < 0;
});

Template.registerHelper('selected', function (prop, val) {
  return prop == val ? 'selected' : '';
});


/***************************************************************************
 * 'nav' template
 */

Template.nav.events({
  'submit #vis-params': function (e) {
    handle_municipality_form(e);
  }
});

Template.nav.helpers({
  active_id: function () {
    return Iron.controller().state.get('active_id');
  },
  active_year: function () {
    return Iron.controller().state.get('active_year');
  }
});


/***************************************************************************
 * 'home' template
 */

Template.home.events({
  'submit #main-inputs': function (e) {
    handle_municipality_form(e);
  }
});


/***************************************************************************
 * 'expenses' templates
 */

Template.expenses.rendered = function () {
  // Set the height of the target div
  var chart = $('#chart');
  chart.height(chart.width()/1.618);

  var query_params = this.data;
  var tree_data = FinanceTrees.findOne(query_params);

  if (tree_data) {
    Iron.controller().state.set('tree_data_state', 1);
    Meteor.a4a_functions.draw_treemap(tree_data, '#chart');
  } else {
    Iron.controller().state.set('tree_data_state', 0);
  }
};

Template.expenses.helpers({
  errorIfMissing: function () {
    var noData = (Iron.controller().state.get('tree_data_state') === 0);

    if (noData) {
      $('#chart').css('display', 'none');
    }

    return noData ? 'expenses_missing' : 'empty';
  }
});


/***************************************************************************
 * Additional functions
 */

handle_municipality_form = function (e) {
  e.preventDefault();

  var municipality_id = e.target['vis-municipality'].value;
  var year = e.target['vis-year'].value;

  if (municipality_id < 0) {
    alert('Please select a municipality!');
    return;
  }

  if (year < 0) {
    alert('Please select a year!');
    return;
  }

  Router.go('expenses', {municipality_id: municipality_id, year: year});
};
