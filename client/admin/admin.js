Template.csv_upload.events({
  'submit .csv-form': function (e) {
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
        Session.set('reactive', false);
        Meteor.call('handle_' + locn, results);
        Session.set('reactive', true);
      }
    });
  }
});

Template.admin_finance_data.events({
  'submit .delete-year-form': function (e) {
    var year = $(e.currentTarget).find('#dele-year').val();
    console.log('found ', year);
    if (year > 0) {
      console.log('deleting!');
      Session.set('reactive', false);
      Meteor.call('delete_entire_year', year);
      Session.set('reactive', true);
    }
  }
});

/**** Reactive templates on the upload page are causing massive performance hits
 **   ==> Hopefully can find another way to provide feedback
Template.csv_upload.helpers({
  progressing: function () {
    return true; //Session.get('csv_upload_pct') >= 0;
  },

  progress: function () {
    return Session.get('csv_upload_pct');
  }
});
*/

Template.admin_finance_data.helpers({
  municipality_count: function () {
    if (Session.get('reactive')) {
      return Municipalities.find().count();
    }
  },

  years_list: function () {
    if (Session.get('reactive')) {
      var years = [];
      Years.find().forEach(function (y) {
        years.push(y.year);
      });

      return years.sort().join(', ');
    }
  }
});

Template.admin_years.events({
  'click .insert-year': function (e) {
    var year = +$('#year-to-insert').val();
    if (year) {
      Meteor.call('add_year_to_dropdown', year);
    }
  },

  'click .delete-year': function (e) {
    var year = +$(e.currentTarget)[0].dataset.year;
    if (year) {
      Meteor.call('delete_year_from_dropdown', year);
    }
  }
});
