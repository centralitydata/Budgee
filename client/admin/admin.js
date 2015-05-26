Template.csv_upload.events({
  // Thanks to https://github.com/RohitRox/js_csv/blob/master/index.html
  'submit #csv_form': function (e) {
    // jQuery always returns an array of matched elements, so need the first
    var file = $('#csv_file')[0].files[0];
    var reader = new FileReader();
    reader.onload = function (file) {
      var content = file.target.result;
      var rows = content.split(/[\r\n|\n]+/);
      for (var i = 0; i < rows.length; i++) {
        console.log('Got a row: ' + rows[i]);
      }
    };
    reader.readAsText(file);
  }
});
