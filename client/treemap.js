Meteor.a4a_functions = Meteor.a4a_functions || {};

Meteor.a4a_functions.load_treemap_data = function (query) {
  return Finances.findOne(query);
};

Meteor.a4a_functions.draw_treemap = function (data, sel) {
  var margin = {top: 10, right: 10, bottom: 10, left: 10};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var colour = d3.scale.category20c();

  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.size; });
  console.log('draw_treemap over, data:',data);
};
