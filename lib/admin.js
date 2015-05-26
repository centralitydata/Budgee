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
    for (var i = 0; i < csv.data.length; i++) {
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
  }
});
