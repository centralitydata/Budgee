Meteor.a4a_functions = Meteor.a4a_functions || {};

Meteor.a4a_functions.draw_treemap = function (root, selector) {
  // Workaround for apparent conflict between d3 and jQuery click handlers,
  // that prevents click events from propagating properly.
  // Based on http://stackoverflow.com/a/11180172
  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

      e.dispatchEvent(evt);
    });
  };

  // Initial basis of this routine is http://bost.ocks.org/mike/treemap/
  var margin = {top: 25, right: 0, bottom: 0, left: 0},
    width = $(selector).width(),
    height = $(selector).height() - margin.top - margin.bottom,
    formatNumber = d3.format('$,d'),
    formatPercent = d3.format('0.1f'),
    transitioning;

  var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);

  var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);

  var colour = d3.scale.category10()
      .domain([
        'Protective Services', // blue
        'unused', // orange -- we have one to spare and the title bar is orange
        'Environmental Use and Protection', // green
        'Public Health and Welfare', // red
        'Recreation and Culture', // purple
        'Other', // brown
        'General Government', // pink
        'Transportation', // grey
        'Planning and Development', // yellow
        'Utilities' // cyan
      ]);


  // Blends an RGB-A foreground colour over an opauqe greyscale layer
  // INPUTS:
  //   * gs is a greyscale level, an integer in the range [0, 255]
  //   * rgb is the foreground colour, that must be parsable by d3.rgb()
  //   * a is an alpha / opacity level, a real value in the range [0, 1]
  //
  // Based on http://stackoverflow.com/a/727339/607408, simplified according to:
  //   fg.{R, G, B, A} --> rgb.{r, g, b}, a
  //   bg.{R, G, B, A} --> {gs, gs, gs, 1}
  //
  function blend_gs_rgba (gs, rgb, a) {
    rgb = d3.rgb(rgb);
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;
    gs = gs / 255;

    r = r * a + gs * (1 - a);
    g = g * a + gs * (1 - a);
    b = b * a + gs * (1 - a);

    return d3.rgb(255 * r, 255 * g, 255 * b);
  }


  var treemap = d3.layout.treemap()
      .children(function(d, depth) {
        return depth ? null : d.data;
      })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(1) //height / width * 0.5 * (1 + Math.sqrt(5)))
      .mode('squarify')
      .round(false);
  var svg = d3.select(selector).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top)
      .style('margin-left', -margin.left + 'px')
      .style('margin.right', -margin.right + 'px')
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .style('shape-rendering', 'crispEdges');

  var grandparent = svg.append('g')
      .attr('class', 'grandparent');

  grandparent.append('rect')
      .attr('y', -margin.top)
      .attr('width', width)
      .attr('height', margin.top);

  grandparent.append('text')
      .attr('x', 6)
      .attr('y', 6 - margin.top)
      .attr('dy', '.75em');

  initialise(root);
  layout(root);
  display(root);


  function initialise (root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  function layout (d) {
    if (d.data) {
      treemap.nodes({data: d.data});
      d.data.forEach(function (c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function colloquial_number (n, d) {
    d = d || 0;

    var size,
        size_label,
        for_decimals,
        num;

    if (n >= 8*Math.pow(10, 8)) { // 0.8 billion
      size = Math.pow(10, 9);
      size_label = 'billion';
    } else if (n >= 8*Math.pow(10, 5)) { // 0.8 million
      size = Math.pow(10, 6);
      size_label = 'million';
    } else if (n >= 1000) { // 0.8 thousand just sounds weird
      size = 1000;
      size_label = 'thousand';
    } else {
      size = 1;
      size_label = '';
    }

    for_decimals = Math.pow(10, d);

    num = Math.round(n * for_decimals / size) / for_decimals;

    return num + ' ' + size_label;
  }

  function area_percentage (d) {
    var p = d;
    while (p.parent) {
      p = p.parent;
    }
    return 100 * d.value / p.value;
  }

  function area_title (d) {
    var lbl = d.name + ':\n' + formatNumber(d.value);
    var p = d;
    while (p.parent) {
      p = p.parent;
      lbl = p.name + ', ' + lbl;
    }
    var pct = Math.floor(1000 * d.value / p.value) / 10;
    lbl += ' (' + formatPercent(pct) + '%)';
    return lbl;
  }

  function clip_id (d) {
    return 'clip-' + d.name.replace(/[^A-Za-z0-9]/g, '');
  }

  function display (d) {
    grandparent
        .datum(d.parent)
        .on('click', transition)
      .select('text')
        .text(name(d));

    var g1 = svg.insert('g', '.grandparent')
        .datum(d)
        .attr('class', 'depth');


/*
    var table = d3.select('#datalist').append('table')
        .attr('class', 'table'); // For bootstrap
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    ['Category', 'Percentage'].forEach(function (d) {
      thead.append('th').text(d);
    });

    var tr = tbody.selectAll('tr')
        .data(d.data)
      .enter().append('tr')
        .style('background', function (d) {
          return blend_gs_rgba(127, colour(d.name), 0.5);
        });

    var td = tr.selectAll('td')
        .data(function (d) { return [d.name, d.value]; })
      .enter().append('td')
        .text(function (d) { return d; });
*/


    var g = g1.selectAll('g')
        .data(d.data)
      .enter().append('g');

    // Add a <defs> element to store the clipPath for each top-level element
    g.append('defs')
      .append('clipPath') // containing a <clipPath> element
        .attr('id', clip_id) // with a generated id to be referenced by url()
      .append('rect') // Add a rectangle to the path
        .call(tmrect); // with the dimensions derived from each data point

    g.filter(function(d) { return d.data; })
        .classed('children', true)
        .on('click', transition);

    g.filter(function (d) { return !d.data; })
        .on('click', function () {
          $('.grandparent').d3Click();
        });

    g.selectAll('.child')
        .data(function(d) { return d.data || [d]; })
      .enter().append('rect')
        .attr('class', 'child')
        .style('fill', function (d) {
          var f = 0;
          if (d.parent.value > 0) {
            // If there is a non-zero value to divide by,
            // then our half-transparent covering will be somewhere between
            // mid-grey (if this is 100% of its parent) and white (if 0%)
            f = Math.floor(128 * d.value / d.parent.value);
          }
          f = 255 - f;
          return 'rgb(' + f + ',' + f + ',' + f + ')';
        })
        .call(tmrect);

    g.append('rect')
        .attr('class', 'parent')
        .style('fill', function (d) {
          return d.data ? colour(d.name) : colour(d.parent.name);
        })
        .style('fill-opacity', 0.5)
        .call(tmrect)
      .append('title')
        .text(function(d) { return area_title(d); });

    g.append('text')
        .attr('dy', '.75em')
        .text(function (d) { return d.name; })
        .call(tmtext);
    g.append('text')
        .attr('dy', '1.75em')
        .text(function (d) { return '$' + colloquial_number(d.value, 1); })
        .call(tmtext);
    g.append('text')
        .attr('dy', '2.75em')
        .text(function (d) {
          var pct = area_percentage(d);
          if (pct < 0.5) {
            pct = pct.toFixed(1);
          } else {
            pct = Math.round(pct);
          }
          return '(' + pct + '% of municipal budget)';
        })
        .call(tmtext);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      // Generate the SVG elements based on this new tree node, d
      var g2 = display(d);

      // Create a transition on the current display (g1) and the new one (g2)
      var t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain based on the size of the tree node d
      // (Must do this after entering new elements)
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition
      svg.style('shape-rendering', null);

      // Draw child nodes on top of parent nodes
      svg.selectAll('.depth').sort(function(a, b) {
        return a.depth - b.depth;
      });

      // Entering text initially transparent
      g2.selectAll('text').style('fill-opacity', 0);

      // Transition to the new views
      // Old text fades to transparent
      t1.selectAll('text').call(tmtext).style('fill-opacity', 0);
      // New text fades to opaque
      t2.selectAll('text').call(tmtext).style('fill-opacity', 1);
      // Old and new rectangles transition to the new values that are
      // calculated by tmrect now that x and y have been redefined for the
      // new view
      t1.selectAll('rect').call(tmrect);
      t2.selectAll('rect').call(tmrect);


      // Remove the old node when the transition is finished
      t1.remove().each('end', function() {
        svg.style('shape-rendering', 'crispEdges');
        transitioning = false;
      });
    }

    return g;
  }

  function tmtext(text) {
    text.attr('x', function(d) { return x(d.x) + 6; })
        .attr('y', function(d) { return y(d.y) + 6; })
        .attr('width', function (d) { return x(d.x + d.dx) - x(d.x); })
        .attr('clip-path', function (d) { return 'url(#' + clip_id(d) + ')'; });
  }

  function tmrect(rect) {
    rect.attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y); })
        .attr('width', function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr('height', function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent ?
      name(d.parent) + ': ' + d.name
      : d.name;
  }

};
