BudgetCodes._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('name', {unique: 1});
FinanceTrees._ensureIndex('municipality_id');
FinanceTrees._ensureIndex('year');

Accounts.validateLoginAttempt(function (attempt) {
  // Co-opted from https://gentlenode.com/journal/meteor-20-verify-an-email-with-meteor-accounts/42
  if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified) {
    console.log('email not verified');

    return false; // login aborted
  }

  return true;
});


Meteor.publish('about', function () {
  return About.find({});
});

Meteor.publish('about_videos', function () {
  return AboutVideos.find({}, { sort: { seq_num: 1 } });
});



Meteor.publish('budget_codes', function () {
  return BudgetCodes.find({});
});

Meteor.publish('budget_categories', function () {
  return BudgetCategories.find({});
});

/**** Still learning about the uses and limitations of Mongo and Meteor.
 **   It is taking roughly 10 seconds to return the 'year' and 'municipality'
 **   lists by extracting them from the data as I would expect to do in an
 **   RDBMS. So for now we'll speed things along by storing a list of years
 **   and a list of municipalities separately.
 ****/
Meteor.publish('municipalities', function () {
  return Municipalities.find({}, { sort: { name: 1 } });
  /*
  // Select only the required fields for a municipality & year list.
  // See http://stackoverflow.com/a/23255779/607408
  var municipalities = _.uniq(FinanceTrees.find({},
    {
      sort: {
        municipality: 1,
        municipality_id: 1
      },
      fields: {
        municipality: 1,
        municipality_id: 1
      }
    }).fetch(),
    true
  );

  // Build the publication by adding each entry to it manually. In this way,
  // it can be added to a new MiniMongo collection in the client that doesn't
  // actually exist as a separate collection on the server.
  // See http://meteorcapture.com/publishing-anything/
  var self = this;

  municipalities.forEach(function (m) {
    // Add the municipality to the publication
    self.added('municipalities', m.municipality_id, {
      name: m.municipality,
      year: m.year
    });
  });

  self.ready();
  */
});

Meteor.publish('years', function () {
  return Years.find({}, { sort: { year: 1 } });
  /*
  var years = _.uniq(FinanceTrees.find({},
    {
      sort: { year: 1 },
      fields: { year: 1 }
    }).fetch(),
    true
  );

  var self = this;

  years.forEach(function (y) {
    self.added('years', y.year, { year: y.year} );
  });

  self.ready();
  */
});

Meteor.publish('finance_tree', function (municipality_id, year) {
  var query = {
    year: +year,
    municipality_id: +municipality_id
  };

  return FinanceTrees.find(query);
});

Meteor.publish('finance_trees', function () {
  return FinanceTrees.find({});
});
