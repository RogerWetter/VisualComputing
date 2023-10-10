d3.json('playerstats.json').then(function(data) {

  data.Spieler.sort(function(a, b) {
    return d3.ascending(a.Name, b.Name);
  });

  // Umwandlung der Werte in Minuten und Berechnung der Gesamtstrafenzeit
  data.Spieler.forEach(function(d) {
    d['2er'] = d['2er'] * 2;   // "2er" wird zu 2 Minuten
    d['2+2'] = d['2+2'] * 4; // "2+2" wird zu 4 Minuten
    d['10er'] = d['10er'] * 10; // "10er" wird zu 10 Minuten
    d['Gesamtstrafenzeit'] = d['2er'] + d['2+2'] + d['10er'];
  });

  // Erstellen der Farbskala
  var colorScale = d3.scaleLinear()
    .domain([0, d3.max(data.Spieler, function(d) { return d['Gesamtstrafenzeit']; })])
    .range(['green', 'red']);

  // Erstellen der Bar Chart
  var margin = { top: 20, right: 20, bottom: 70, left: 40 };
  var fullWidth = window.innerWidth - margin.left - margin.right;
  var fullHeight = window.innerHeight - margin.top - margin.bottom;

  var svg = d3.select('body').append('svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var width = fullWidth - margin.left - margin.right;
  var height = fullHeight - margin.top - margin.bottom;

  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

  var y = d3.scaleLinear()
    .range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).ticks(5);

  x.domain(data.Spieler.map(function(d) { return d.Name; }));
  y.domain([0, d3.max(data.Spieler, function(d) { return d['Gesamtstrafenzeit']; })]);

  // Achsenbeschriftungen anpassen
  yAxis.tickFormat(function(d) { return d + ' min'; });

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-45)');

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  svg.selectAll('.bar')
    .data(data.Spieler)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x(d.Name); })
    .attr('y', function(d) { return y(d['Gesamtstrafenzeit']); })
    .attr('width', x.bandwidth())
    .attr('height', function(d) { return height - y(d['Gesamtstrafenzeit']); })
    .style('fill', function(d) { return colorScale(d['Gesamtstrafenzeit']); });
});
