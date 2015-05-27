Router.route('/', function () {
  this.render('home');
});

Router.route('/admin', function () {
  this.render('admin');
});

Router.route('/finances/:municipality/:year', {
  subscriptions: function () {
    return Meteor.subscribe('finances');
  },

  action: function () {
    var query = {
      year: +this.params.year
    };
    if ($.isNumeric(this.params.municipality)) {
      query.code = +this.params.municipality;
    } else {
      query.municipality = this.params.municipality.toTitleCase();
    }

    if (this.ready()) {
      this.render('finances', { data: query });
    } else {
      this.render('Loading');
    }
  }
});
