BudgetCodes._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('name', {unique: 1});

Accounts.validateLoginAttempt(function (attempt) {
  // Co-opted from https://gentlenode.com/journal/meteor-20-verify-an-email-with-meteor-accounts/42
  if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified) {
    console.log('email not verified');

    return false; // login aborted
  }

  return true;
});

Meteor.publish('budget_codes', function () {
  return BudgetCodes.find({});
});

Meteor.publish('budget_categories', function () {
  return BudgetCategories.find({});
});

Meteor.publish('municipalities', function () {
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
});

Meteor.publish('years', function () {
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
