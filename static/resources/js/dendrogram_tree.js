var width = 700,
    height = 450;
var cluster = d3v3.layout.cluster()
    .size([height, width - 160]);
var diagonal = d3v3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });
var svg = d3v3.select("#dendrogram-display").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(40,0)");
d3v3.json("static/resources/data/ts_atp_sax/atp_n6_size1.json", function(error, root) {
  var nodes = cluster.nodes(root),
      links = cluster.links(nodes);
  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);
  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
  node.append("circle")
      .attr("r", 4.5);
  node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; });

  node.each(function(d, i) {
    addTSNode(d);
  });

  node.on("click", function(d){
    console.log(d.name)
    if(d.name == "Root") {
      d3v3.selectAll("#cluster-display svg").remove();
    } else {
      updateTSNodes(d)
    }
  });
});
d3v3.select(self.frameElement).style("height", height + "px");