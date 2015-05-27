Router.route('/', function () {
  this.render('home');
});

Router.route('/admin', function () {
  this.render('admin');
});

Router.route('/expenses/:municipality/:year', {
  subscriptions: function () {
    return Meteor.subscribe('finance_trees');
  },

  action: function () {
    var query = {
      year: +this.params.year
    };
    if ($.isNumeric(this.params.municipality)) {
      query.municipality_id = +this.params.municipality;
    } else {
      query.municipality = this.params.municipality.toTitleCase();
    }

    if (this.ready()) {
      this.render('expenses', { data: query });
    } else {
      this.render('Loading');
    }
  }
});
