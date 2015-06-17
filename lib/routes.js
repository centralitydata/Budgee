Router.route('/', {
  /*
  subscriptions: function () {
    return Meteor.subscribe('finance_trees');
  },
*/
  action: function () {
    if (this.ready()) {
      this.render('home');
    } else {
      this.render('loading');
    }
  }
});

Router.route('/admin', function () {
  this.render('admin');
});

// Before subscription params, 2.9 MB transferred
Router.route('/expenses/:municipality_id/:year', {
  subscriptions: function () {
    return Meteor.subscribe(
      'finance_tree', this.params.municipality_id, this.params.year
    );
  },

  action: function () {
    var query = {
      year: +this.params.year,
      municipality_id: +this.params.municipality_id
    };

    if (this.ready()) {
      this.state.set('active_id', query.municipality_id);
      this.state.set('active_year', query.year);
      // tree_data_states: -1 = looking, 0 = data doesn't exist, 1 = found data
      this.state.set('tree_data_state', -1);
      this.render('expenses', { data: query });
    } else {
      this.render('loading');
    }
  },

  name: 'expenses'
});
