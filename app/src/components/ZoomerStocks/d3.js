const d3 = require("d3");

const margin = {top: 20, right: 20, bottom: 20, left: 50};
const width = 300;
const height = 300;

// append the container for the graph to the page
const svg = d3
  .select('body')
// *** append svg to correct spot on page ***
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

const xScale = d3.scale.linear()
  .range([0, width - margin.left - margin.right])

const yScale = d3.scale.linear()
  .range([height - margin.top - margin.bottom,0])

const lineFunction = d3.svg.line()
    .x(function(d) { return xScale(d.x); })
    .y(function(d) { return yScale(d.y); })
    .interpolate('linear');

// Get the stock data
const stockData = '';
container.append('h1').text(stockData.name); // *** Name info of stock ***

let stockData = []
let xVal = 0;
// *** call this on socket output ***
socket.on("data", function(data) {
    xVal += 1;
    if (xVal > 50) {
        stockData.splice(0, 1);
    }
    stockData = stockData.concat([{
        "x": xVal,
        "y": data.value
    }]);
    renderLine(stockData);
})

function renderLine(lineData) {
    // obtain absolute min and max
    const yMin = lineData.reduce(function(pv,cv){
        const currentMin = cv.reduce(function(pv,cv){
        return Math.min(pv,cv.y);
        },100)
        return Math.min(pv,currentMin);
    },100);
    const yMax = lineData.reduce(function(pv,cv){
        const currentMax = cv.reduce(function(pv,cv){
        return Math.max(pv,cv.y);
        },0)
        return Math.max(pv,currentMax);
    },0);
    // set as domain for axis
    yScale.domain([yMin,yMax]);

    // create axis
    const yAxis = d3.svg.axis().scale(yScale).orient("left");
    // remove any previously drawn axis
    svg.selectAll(".y.axis").remove();
    // draw the new axis
    svg.append("g").attr("class","y axis").call(yAxis);
    
    // remove old line
    svg.selectAll(".line").remove();
    // create new line
    const line = svg.selectAll(".line").data(lineData).attr("class", "line");
    // append line
    line.enter().append("path")
        .attr("class", "line")
        .attr("d", lineFunction)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
}