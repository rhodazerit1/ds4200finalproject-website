const crime = d3.csv("tmpkd_w64k_.csv").then(function(crime) {

  // Filter out any rows where the district is missing
  crime = crime.filter(d => d.DISTRICT);

  // Calculate count for each district
  const districtCounts = crime.reduce((acc, curr) => {
    if (acc[curr.DISTRICT]) {
      acc[curr.DISTRICT]++;
    } else {
      acc[curr.DISTRICT] = 1;
    }
    return acc;
  }, {});

  // Convert the aggregated counts into an array of objects
  let aggregatedData = Object.keys(districtCounts).map(DISTRICT => ({
    DISTRICT: DISTRICT,
    count: districtCounts[DISTRICT]
  }));

  // Aggregate assault types
  aggregatedData.forEach(d => {
    if (d.DISTRICT === "ASSAULT - SIMPLE" || d.DISTRICT === "ASSAULT - AGGRAVATED") {
      d.DISTRICT = "ASSAULT (SIMPLE & AGGRAVATED)";
    }
  });

  // Sort
  aggregatedData.sort((a, b) => b.count - a.count);

  console.log(districtCounts);

  // Define neighborhood names
  const neighborhoods = {
    'B2': 'Roxbury',
    'A1': 'Downtown',
    'C6': 'South Boston',
    'C11': 'Dorchester',
    'D4': 'South End',
    'E13': 'Jamaica Plain',
    'B3': 'Mattapan',
    'A7': 'East Boston',
    'E18': 'Hyde Park',
    'A15': 'Charlestown',
    'E5': 'West Roxbury',
    'D14': 'Brighton',
    'External': 'Out of Boston'
  };

  // Create SVG
  let width = 800,
      height = 600;

  let margin = {
    top: 50,
    bottom: 50,
    left: 150,
    right: 50
  };

  let svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    ;


  // Add title
  svg.append('text')
    .attr('x', 300 + margin.left)
    .attr('y', margin.top / 2) // Position the title at the top
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .text('Count Plot of the Frequency of Crime in Each Boston District')
    .style('font-family', 'Arial')
    .style('font-weight', 'bold');


  // Define Scales
  let xScale = d3.scaleLinear()
    .domain([0, d3.max(aggregatedData, d => d.count)])
    .range([0, width - margin.left - margin.right]);

  let yScale = d3.scaleBand()
    .domain(aggregatedData.map(d => d.DISTRICT))
    .range([margin.top, height - margin.bottom])
    .padding(0.5);

  // Draw Axes with Grid
  let xAxis = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSize(-(height - margin.top - margin.bottom)).ticks(21))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-90)');

  let yAxis = svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).ticks(21))
    .selectAll('text')
    .text(d => neighborhoods[d]);

  // Add labels
  svg.append('text')
    .attr('x', 300 + margin.left)
    .attr('y', 25 + height)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Count')
    .style('font-family', 'Arial')
    .style('font-weight', 'bold');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', margin.left / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('District')
    .style('font-family', 'Arial')
    .style('font-weight', 'bold');

  // Draw bars
  let bars = svg.selectAll('rect')
    .data(aggregatedData)
    .enter()
    .append('rect')
    .attr('x', margin.left + 1) // Start from the left margin plus a small offset
    .attr('y', d => yScale(d.DISTRICT))
    .attr('width', d => xScale(d.count)) // Width based on the count of crimes
    .attr('height', yScale.bandwidth())
    .attr('fill', 'steelblue')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
      tooltip.style('display', 'block')
        .html(`${neighborhoods[d.DISTRICT]}: ${d.count} crimes`)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY}px`);
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('fill', 'steelblue')
        .attr('stroke', 'none');
      tooltip.style('display', 'none');
    });

  // Add tooltip
  let tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('padding', '20px')
    .style('background-color', 'white')
    .style('color', 'black')
    .style('border-radius', '5px')
    .style('display', 'none')
    .style('font-family', 'Arial');


  // Add selection interaction
  bars
    .on('click', function(d) {
      d3.select(this)
        .transition()
        .duration(1000)
        .attr('fill', 'red');
    });

});
