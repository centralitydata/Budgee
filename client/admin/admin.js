Template.csv_upload.events({
  // Thanks to https://github.com/RohitRox/js_csv/blob/master/index.html
  'submit #csv_form': function (e) {
    // jQuery always returns an array of matched elements, so get the first one
    var file = $('#csv_file')[0].files[0];

    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Finished: ", results);
      }
    });
  }
});
