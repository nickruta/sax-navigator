// get the file names for our raw time series
astronomy_ts_fnames_list = []
$.ajax({url: "https://sax-navigator.herokuapp.com/get_ts_fnames", success: function(result){
  astronomy_ts_fnames_list = result;
}});

function addTSNode(d, filename) {

  // set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 150 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

// set the ranges
var x = d3v4.scaleLinear().range([0, width]);
var y = d3v4.scaleLinear().range([height, 0]);

// define the line
var valueline = d3v4.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3v4.select("#cluster-display").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3v4.csv("static/resources/data/ts_astronomy_lightcurves_processed/" + filename, function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
    });

    // Scale the range of the data
    x.domain(d3v4.extent(data, function(d) { return d.x; }));
    y.domain(d3v4.extent(data, function(d) { return d.y; }));

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3v4.axisBottom(x).ticks(4));

    // Add the Y Axis
    svg.append("g")
        .call(d3v4.axisLeft(y).ticks(4));

  });

}

function updateTSNodes(d) {

  d3v4.selectAll("#cluster-display svg").remove();
  d3v4.selectAll('#superposition path').transition().duration(50).remove();
  d3v4.selectAll("#sparklines svg").transition().duration(50).remove();
  d3v4.selectAll("#sparklines div").transition().duration(50).remove();

  setTables();

    astronomy_ts_fnames_list.fnames_astronomy.sort(function(a,b){
        if(a < b){
            return -1;
        }else{
            return 1;
        }
    });
    console.log(astronomy_ts_fnames_list);

  ts_ids = d.name.split('-');

  ts_ids.forEach(function(element) {
    filename = astronomy_ts_fnames_list.fnames_astronomy[element];
    let id = filename.split('.')[0];
    showIndividualView(element, filename, id);
  });

}