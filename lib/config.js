// Define a new collection in the global namespace (so no 'var')
BudgetCodes = new Mongo.Collection('budget_codes');
BudgetCategories = new Mongo.Collection('budget_categories');
FinanceTrees = new Mongo.Collection('finance_trees');
Municipalities = new Mongo.Collection('municipalities');
Years = new Mongo.Collection('years');
About = new Mongo.Collection('about');
AboutVideos = new Mongo.Collection('about_videos');


Accounts.config({
	sendVerificationEmail: true,
	restrictCreationByEmailDomain: 'centrality.ca'
});


/***************************************************************************
 * Additional routines
 */

/*
 * Title-case addition to String prototype, based on
 *   http://stackoverflow.com/a/6475125/607408
 */
String.prototype.toTitleCase = function() {
  var i, str, lowers, uppers, midcaps;
  str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = lowers.length - 1; i >= 0; i--) {
    str = str.replace(
			new RegExp('\\b' + lowers[i] + '\\b', 'g'),
      function(txt) {
        return txt.toLowerCase();
      }
		);
	}

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = ['Id', 'Tv'];
  for (i = 0, j = uppers.length; i < j; i++) {
    str = str.replace(
			new RegExp('\\b' + uppers[i] + '\\b', 'g'),
      uppers[i].toUpperCase()
		);
	}

	// Preserve specific terms and names with interior capitals
	midcaps = [
    // Don't include the final '.' in e.g. 'I.D.' because a space after a period
    // does not count as a word boundary (\b), since the period does not count
    // as part of a word.
    {from: 'I\.d', to: 'I.D'},
    {from: 'M\.d', to: 'M.D'},
		{from: 'Mclennan', to:'McLennan'}
	];
	for (i = 0, j = midcaps.length; i < j; i++) {
		str = str.replace(
			new RegExp('\\b' + midcaps[i].from + '\\b', 'g'),
			midcaps[i].to
		);
	}

  return str;
};
