// SVG wrapper dimensions are determined by the current width
// and height of the browser window.
const svgWidth = 920;
const svgHeight = 620;

// Define the chart's margins as an object 
const margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
};

// Define dimensions of the chart area
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then((stateData) => {
    // Step 1: Parse Data/Cast as numbers
    stateData.forEach((data) => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    const xScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d.poverty) * 0.85,
        d3.max(stateData, d => d.poverty) * 1.25])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d.healthcare) * 0.85,
        d3.max(stateData, d => d.healthcare) * 1.25])
        .range([height, 0]);

    // Step 3: Create axis functions
    const bottomAxis = d3.axisBottom(xScale);
    const leftAxis = d3.axisLeft(yScale);

    // Step 4: Append Axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create Circles
    const circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("class", "stateCircle")
        .attr("r", "15")
        .attr("opacity", ".8");

    // Create circle text
    const circlesText = chartGroup.selectAll(".stateText")
        .data(stateData)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => yScale(d.healthcare * .99))
        .text(d => d.abbr)
        .attr("class", "stateText")
        .attr("font-size", "12px");

    // Step 6: Initialize tool tip
    const toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([85, 85])
        .html((d) => {
            return (`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
        });

    // Step 7: Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseenter", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    circlesText.on("mouseenter", function (data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Lacks Healthcare(%)");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("In Poverty (%)");
})
    .catch((error) => {
        console.log(error);
    });