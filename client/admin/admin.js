Template.csv_upload.events({
  'submit .csv_form': function (e) {
    // jQuery always returns an array of matched elements, so get the first one.
    // Then we're only allowing a single file, so get the "first" of those.
    var file = $(e.currentTarget).find('input:file')[0].files[0];
    //var file = $('#csv_file')[0].files[0];
    var locn = e.currentTarget.id;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        Meteor.call('handle_' + locn, results);
      }
    });
  }
});
