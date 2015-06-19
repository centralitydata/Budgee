Meteor.a4a_functions = Meteor.a4a_functions || {};

Meteor.a4a_functions.draw_creator_graph = function (selector) {
  var nodes = [{name: 'Adam'}, {name:'Paul'}, {name:'Michael'}];
  var links = [{source:0,target:1},{source:1,target:2},{source:2,target:0}];

  var width = $(selector).width() - 15;
  var height = $(selector).height();

  var svg = d3.select(selector).append('svg')
      .attr('width', width)
      .attr('height', height);

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .friction(0.9)
      .linkDistance(300)
      .charge(-100)
      .on('tick', tick)
      .start();

  var link = svg.selectAll('.link')
      .data(force.links())
      .enter().append('line')
      .attr('class', 'link');

  var node = svg.selectAll('.node')
      .data(force.nodes())
      .enter().append('g')
      .attr('class', 'node')
      .call(force.drag);

  node.append('image')
      .attr('xlink:href', function(d) { return 'img/' + d.name + '.png'; })
      .attr('x', -36)
      .attr('y', -36)
      .attr('width', 72)
      .attr('height', 72);

  node.append('text')
      .attr('dx', 30)
      .attr('dy', 35)
      .attr('width', 100)
      .attr('class', 'devname')
      .text(function(d) { return d.name; });

  function tick () {
    node.attr('transform', function(d) {
      d.x = Math.max(70, Math.min(width - 102, d.x));
      d.y = Math.max(70, Math.min(height - 73, d.y));
      return 'translate(' + d.x + ',' + d.y + ')';
    });
    link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
  }
};
