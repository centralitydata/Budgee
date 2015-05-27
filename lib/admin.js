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
            name: csv.data[i].description,
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
            name: budget_code.name,
            value: expense
          };
        }
      });

      if (base_doc.municipality_id === 3) {
        console.log(base_doc);
      }
    });
  },
  /*
  handle_csv_upload_schedule_c: function (csv) {
    //TODO: Verify logged in
    //TODO: Verify valid fields exist
    // Required format:
    //   year, status, code, municipality, <codes>
    //   2013, City, 0003, Airdrie, <values>
    //   2013, City, 0043, Brooks, <values>
    var non_pivot_fields = ['year', 'status', 'code', 'municipality'];
    var base_doc, new_doc;
    var i, j, field;
    for (i = 0; i < csv.data.length; i++) {
      // We will be creating one row for every budget code, with the
      // "non-pivot" properties repeated each time.
      base_doc = {
        year: +csv.data[i].year,
        municipality_type: csv.data[i].status.toTitleCase(),
        municipality_id: +csv.data[i].code,
        municipality: csv.data[i].municipality.toTitleCase(),
        value: 0,
        data: Meteor.support_functions.empty_finances_data()
      };

      // Loop over all fields, looking for ones that are revenues to be used
      csv.meta.fields.forEach(function (field) {
        var category;
        var budget_code = BudgetCodes.findOne({
          code: field
          ,sign: 1 // Revenues have positive sign
          ,use: true // Some fields, notably totals, shouldn't be included
        });
        // If this code is one that should be used...
        if (budget_code) {
          category = budget_code.category_code;
          base_doc.data[category].value += csv.data[field]
        }

      });




      // Loop over all fields, looking for the non-pivot ones
      for (j = 0; j < csv.meta.fields.length; j++) {
        field = csv.meta.fields[j];
        // If this is not one of the "non-pivot" fields required on each row...
        if ($.inArray(field, non_pivot_fields) < 0) {
          // If this is an expense field we should use...
          if (csv.data[i])

          // ...then create a new document to contain the value
          new_doc = $.clone(base_doc);
          new_doc.budget_code = +csv.data[i][field];
          //
          Finances.upsert(
            {
              year: new_doc.year,
              municipality_id: new_doc.municipality_id,
              budget_code: new_doc.budget_code
            },
            {
              $set: new_doc
            }
          );
        }
      }
      csv.data[i].status = csv.data[i].status.toTitleCase();
      csv.data[i].municipality = csv.data[i].municipality.toTitleCase();
      Finances.upsert(
        {
          year: csv.data[i].year,
          code: csv.data[i].code
        },
        {
          $set: csv.data[i]
        }
      );
    }
  },
*/
  build_finance_tree: function (year, municipality) {
    var categories = BudgetCategories.find();
    var category;
    var codes;
    while (categories.hasNext()) {
      category = categories.next();
      codes = BudgetCodes.find({category_code: category.code});
    }
  }
});
