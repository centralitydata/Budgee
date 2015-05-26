Template.csv_upload.events({
  'submit #csv_form': function (e) {
    // jQuery always returns an array of matched elements, so get the first one
    var file = $('#csv_file')[0].files[0];

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Finished: ", results);
      }
    });
  }
});
