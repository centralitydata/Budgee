Meteor.support_functions = Meteor.support_functions || {};

Meteor.support_functions.empty_finances_data = function () {
  var doc = {};
  var categories = BudgetCategories.find();

  categories.forEach(function (category) {
    doc[category.code] = {
      name: category.name,
      value: 0,
      data: {}
    };
  });

  return doc;
};

Meteor.methods({
  handle_csv_upload_budget_categories: function (csv) {
    //TODO: Verify logged in
    //TODO: Verify valid fields exist
    // Desired format:
    //   category, name
    //   1, something
    //   2, something else
    //   ...
    for (var i = 0; i < csv.data.length; i++) {
      BudgetCategories.upsert(
        { code: csv.data[i].category },
        { $set: { name: csv.data[i].name } }
      );
    }
  },

  handle_csv_upload_budget_codes: function (csv) {
    //TODO: Verify logged in
    //TODO: Verify valid fields exist
    // Desired format:
    //   code, description, direction, pair, include, category_code
    //   00700, Total General, 1, , true, 1
    //   00730, Council etc, 1, 01170, true, 1
    //   ...
    for (var i = 0; i < csv.data.length; i++) {
      BudgetCodes.upsert(
        {
          code: csv.data[i].code
        },
        {
          $set: {
            name: csv.data[i].description.toTitleCase(),
            sign: csv.data[i].direction,
            pair_code: csv.data[i].pair,
            use: csv.data[i].include,
            category_code: csv.data[i].category_code
          }
        }
      );
    }
  },

  handle_csv_upload_schedule_c: function (csv) {
    //TODO: Verify logged in
    //TODO: Verify valid fields exist
    // Required format:
    //   year, status, code, municipality, <codes>
    //   2013, City, 0003, Airdrie, <values>
    //   2013, City, 0043, Brooks, <values>
    csv.data.forEach(function (budget) {
      base_doc = {
        year: budget.year,
        municipality_type: budget.status.toTitleCase(),
        municipality_id: +budget.code, // In the CSV this is municipality code
        municipality: budget.municipality.toTitleCase(),
        value: 0,
        data: Meteor.support_functions.empty_finances_data()
      };

      csv.meta.fields.forEach(function (field) {
        // We use the numerical value (e.g. 700 instead of '00700') in the
        // Mongo collections, but the CSV data uses the string version as its
        // field name / object property identifier.
        var code = +field;
        var category, expense;
        // Search for whether this field corresponds to an expense to be used
        var budget_code = BudgetCodes.findOne({
          code: code,
          sign: -1, // Expenses have negative sign
          use: true // Some fields, notably totals, shouldn't be included
        });

        if (budget_code) {
          category = budget_code.category_code;
          expense = +budget[field];

          // Add this expense to the grand total...
          base_doc.value += expense;
          // ...and to the category total
          base_doc.data[category].value += expense;
          // Create a sub-entry for the category
          base_doc.data[category].data[code] = {
            name: budget_code.name.toTitleCase(),
            value: expense
          };
        }
      });

      FinanceTrees.upsert(
        {
          year: base_doc.year,
          municipality_id: base_doc.municipality_id
        },
        {
          $set: base_doc
        }
      );
    });
  }
});
