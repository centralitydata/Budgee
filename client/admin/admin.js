Template.admin_about.helpers({
  about: function () {
    return About.findOne();
  }
});

Template.admin_about_videos.helpers({
  about_videos: function () {
    return AboutVideos.find({}, {sort: {seq_num: 1}});
  }
});


Template.admin_about.events({
  'submit #edit-about-content': function (e) {
    e.preventDefault();

    var about = {
			title: e.target['about-title'].value,
			lead: e.target['about-lead'].value,
			body: e.target['about-body'].value,
			videos_title: e.target['about-videos-title'].value,
			videos_lead: e.target['about-videos-lead'].value,
			videos_body: e.target['about-videos-body'].value
		};

		Meteor.call('edit_about', about);
  }
});


Template.admin_about_videos.events({
  'submit #new-video': function (e) {
    e.preventDefault();

    var video = {
      seq_num: e.target['ins-video-order'].value,
      youtube_id: e.target['ins-video-youtube-id'].value,
      title: e.target['ins-video-title'].value
    };

    Meteor.call('insert_video', video);
  },

  'click .delete-video': function (e) {
    e.preventDefault();

    Meteor.call('delete_video', $(e.currentTarget)[0].dataset.youtubeId);
  }
});


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
