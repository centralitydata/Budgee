Meteor.a4a_functions = Meteor.a4a_functions || {};

Meteor.a4a_functions.load_treemap_data = function (query) {
  return FinanceTrees.findOne(query);
};

Meteor.a4a_functions.draw_treemap = function (root, selector) {
  var margin = {top: 10, right: 10, bottom: 10, left: 10};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var colour = d3.scale.category20c();

  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    //.value(function (d) { return d.data ? undefined : d.value; })
    .value(function (d) { return d.value; })
    .children(function (d) { return d.data; });

  var div = d3.select(selector)
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

  function position () {
    this.style("left", function (d) { return d.x + "px"; })
        .style("top", function (d) { return d.y + "px"; })
        .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; });
  }

  console.log("Root",root);
  var node = div.datum(root)
    .selectAll('.node')
      .data(treemap.nodes)
    .enter().append('div')
      .attr('class', 'node')
      .call(position)
      .style('background', function (d) {
        return d.data ? colour(d.name) : null;
      })
      .text(function (d) {
        return d.data ? null : d.name;
      });
};
