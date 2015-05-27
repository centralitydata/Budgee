BudgetCodes._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('code', {unique: 1});
BudgetCategories._ensureIndex('name', {unique: 1});

Meteor.publish('budget_codes', function () {
  return BudgetCodes.find({});
});

Meteor.publish('budget_categories', function () {
  return BudgetCategories.find({});
});

Meteor.publish('finances', function () {
  return Finances.find({});
});

//Meteor.publish('')
// TODO NEXT: Based on https://stackoverflow.com/questions/19826804/understanding-meteor-publish-subscribe/21853298#21853298
// --> Create here a published record set containing all of the joined info etc
//     for a single municipality / year combo.
