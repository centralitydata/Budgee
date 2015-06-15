Meteor.a4a_functions = Meteor.a4a_functions || {};

Meteor.a4a_functions.load_treemap_data = function (query) {
  return FinanceTrees.findOne(query);
};

Meteor.a4a_functions.draw_treemap_new = function (root, selector) {
  var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format("$,d"),
    transitioning;

  var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

  var svg = d3.select(selector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

  var grandparent = svg.append("g")
    .attr("class", "grandparent");

  grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

  grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");


};

Meteor.a4a_functions.draw_treemap = function (root, selector) {
  var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format("$,d"),
    transitioning;

  var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);

  var colour = d3.scale.category10();

  var treemap = d3.layout.treemap()
      .children(function(d, depth) {
        console.log('children called with:');
        console.log('  depth: ',depth, ', and d:', d);
        return depth ? null : d.data;
      })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(1) //height / width * 0.5 * (1 + Math.sqrt(5)))
      .mode('squarify')
      .round(false);

  var svg = d3.select(selector).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");

  var grandparent = svg.append("g")
      .attr("class", "grandparent");

  grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);

  grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");

  initialise(root);
  layout(root);
  display(root);


  function initialise (root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  function layout(d) {
    if (d.data) {
      treemap.nodes({data: d.data});
      d.data.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d.data)
      .enter().append("g");

    g.filter(function(d) { return d.data; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d.data || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .style('fill', function (d) {
          return 'rgba(128,128,128,' + Math.floor(255*Math.random()) + ')';
        })
        .call(tmrect);

    g.append("rect")
        .attr("class", "parent")
        .style('fill', function (d) {
          return d.data ? colour(d.name) : null;
        })
        .call(tmrect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(tmtext);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(tmtext).style("fill-opacity", 0);
      t2.selectAll("text").call(tmtext).style("fill-opacity", 1);
      t1.selectAll("rect").call(tmrect);
      t2.selectAll("rect").call(tmrect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function tmtext(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function tmrect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent ?
      name(d.parent) + ": " + d.name
      : d.name;
  }
};

Meteor.a4a_functions.draw_treemap_v1 = function (root, selector) {
  var margin = {top: 10, right: 10, bottom: 10, left: 10};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var colour = d3.scale.category10();

  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    //.value(function (d) { return d.data ? undefined : d.value; })
    .value(function (d) { return d.value; })
    .children(function (d, depth) { return depth < 2 ? d.data : undefined; });

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

  var node = div.datum(root)
    .selectAll('.node')
      .data(treemap.nodes)
    .enter().append('div')
      .attr('class', 'node')
      .call(position)
      .style('background', function (d) {
        return d.data ? colour(d.name) : null;
      })
      .text(function (d, depth) {
        return d.data ? null : d.name + '-' + depth + '-';
      });
};
