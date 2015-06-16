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
      this.render('expenses', { data: query });
    } else {
      this.render('loading');
    }
  }
});
