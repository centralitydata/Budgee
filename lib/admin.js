Meteor.support_functions = Meteor.support_functions || {};

Meteor.support_functions.empty_finances_data = function (budget) {
  var data = [];
  var category_indices = {};
  var categories = BudgetCategories.find();

  categories.forEach(function (category) {
    var category_code = +category.code;
    // The index of the first code is 0, so equal to data.length *before* the
    // element is added to the array
    category_indices[category_code] = data.length;
    data.push({
      name: category.name,
      code: category_code,
      value: 0,
      data: []
    });
  });

  if (!budget.municipality) {
    console.log('WHAT IS THE DEAL');
    console.log(budget);
  }
  var municipality = budget.municipality.toTitleCase();
  var year = +budget.year;

  return {
    year: year,
    municipality_id: +budget.code, // In the CSV this is municipality code
    municipality: municipality,
    municipality_type: budget.status.toTitleCase(),
    category_indices: category_indices,
    name: municipality + ' (' + year + ')',
    value: 0,
    data: data
  };

};

/***************************************************************************
 * Meteor Methods
 */

Meteor.methods({
  edit_about: function (about) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}

    About.upsert(
      { _id: 1 }, // Always keep only one record, so just id it '1'
      { $set: about }
    );
  },


  insert_video: function (video) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    AboutVideos.insert(video);
  },


  delete_video: function (ytid) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    AboutVideos.remove({ youtube_id: ytid });
  },


  handle_csv_upload_budget_categories: function (csv) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}
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
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}
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
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}
    //TODO: Verify valid fields exist
    // Required format:
    //   year, status, code, municipality, <codes>
    //   2013, City, 0003, Airdrie, <values>
    //   2013, City, 0043, Brooks, <values>

    csv.data.forEach(function (budget, i) {
      var base_doc = Meteor.support_functions.empty_finances_data(budget);

      csv.meta.fields.forEach(function (field) {
        // We use the numerical value (e.g. 700 instead of '00700') in the
        // Mongo collections, but the CSV data uses the string version as its
        // field name / object property identifier.
        var code = +field;
        var category, expense, idx;
        // Search for whether this field corresponds to an expense to be used
        var budget_code = BudgetCodes.findOne({
          code: code,
          sign: -1, // Expenses have negative sign
          use: true // Some fields, notably totals, shouldn't be included
        });

        if (budget_code) {
          category = +budget_code.category_code;
          expense = +budget[field] || 0;
          idx = base_doc.category_indices[category];

          // Add this expense to the grand total...
          base_doc.value += expense;
          // ...and to the category total
          base_doc.data[idx].value += expense;
          // Create a sub-entry for the category
          base_doc.data[idx].data.push({
            name: budget_code.name.toTitleCase(),
            value: expense
          });
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
  },

  handle_csv_upload_municipalities: function (csv) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}
    //TODO: Verify valid fields exist
    // Desired format:
    //   code, municipality
    //   0003, Airdrie
    csv.data.forEach(function (m, i) {
      var id = +m.code || -1;
      var name = m.municipality.toTitleCase();

      Municipalities.upsert(
        { municipality_id: id },
        { $set: { name: name } }
      );
    });
  },

  add_year_to_dropdown: function (year) {
    if (year > 0) {
      Years.upsert({ year: year }, { year: year });
    }
  },

  delete_year_from_dropdown: function (year) {
    if (year > 0) {
      Years.remove({ year: year });
    }
  }

  /**** Gives no error, but deletes 0 records, for the same query that
   **   returns 345 in a .find() instead...
   **
  delete_entire_year: function (year) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}
    //if (!Meteor.userId()) {
		//	throw new Meteor.Error('not-authorized');
		//}

    console.log('About to delete!!');
    console.log('Before:', FinanceTrees.find({year: year}).count());
    console.log(FinanceTrees.remove({year: year}));
    console.log('After:', FinanceTrees.find({year: year}).count());
    console.log('Deleted!!!');
  }
  */
});
