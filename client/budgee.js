/***************************************************************************
 * Subscriptions
 */

Meteor.subscribe('municipalities');
Meteor.subscribe('years');
Meteor.subscribe('budget_codes');
Meteor.subscribe('budget_categories');
Meteor.subscribe('about');
Meteor.subscribe('about_videos');
Meteor.subscribe('finance_trees');


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
 * 'about' template
 */

Template.about.helpers({
  about: function () {
    return About.findOne({});
  },

  about_videos: function () {
    return AboutVideos.find({});
  }
});


/***************************************************************************
 * 'contact' template
 */

Template.contact.rendered = function () {
  var height = $('#who-we-are').height();
  var graph = $('#creator-graph');
  graph.height(height);
  Meteor.a4a_functions.draw_creator_graph('#creator-graph');
};


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
  Session.set('municipal_query_params', query_params);

  if (tree_data) {
    if (tree_data.value === 0) {
      Iron.controller().state.set('tree_data_state', 'zero-dollars');
    } else {
      Iron.controller().state.set('tree_data_state', 'data-good');
      Meteor.a4a_functions.draw_treemap(tree_data, '#chart');
    }
  } else {
    Iron.controller().state.set('tree_data_state', 'data-missing');
  }
};

Template.expenses.helpers({
  whichExpenseTemplate: function () {
    var template = 'empty';
    var state = Iron.controller().state.get('tree_data_state');

    if (state === 'data-good') {
      template = 'expenses_chart';
    } else if (state === 'zero-dollars') {
      template = 'expenses_zero';
    } else if (state === 'data-missing') {
      template = 'expenses_missing';
    }

    return template;
  }
});

Template.expenses_zero.helpers({
  municipality: function () {
    return name_plus_year(Session.get('municipal_query_params'));
  }
});

Template.expenses_missing.helpers({
  municipality: function () {
    return name_plus_year(Session.get('municipal_query_params'));
  }
})


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


/**** Accepts an object with .municipality_id and .year properties, and
 **   returns on with .name and .year properties.
 **/
name_plus_year = function (query) {
  var municipality = {
    name: 'that municipality',
    year: 'that year'
  };

  var muni = Municipalities.findOne({municipality_id: query.municipality_id});
  if (muni && muni.name) {
    municipality.name = muni.name;
  }
  if (query.year) {
    municipality.year = query.year;
  }

  return municipality;
}
