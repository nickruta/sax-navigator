/* gridsearch feature */

gridsearch = function(_parentElement, _n,_size){
    this.parentElement = _parentElement;
    this.n = _n; // Number of letters in vocab
    this.size = _size; // Number of letters in word

    this.initVis();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

gridsearch.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top: 0, right: 40, bottom: 40, left: 0};

    vis.width = Math.min($("#" + vis.parentElement).width(),300) - vis.margin.left - vis.margin.right;
    vis.height = vis.width*(vis.n)/(vis.size)  - vis.margin.top - vis.margin.bottom;

    // draw SVG area
    vis.svg = d3v4.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");



    // Size of Grid
    vis.gridSize = (vis.width-20)/(vis.size+1) ; // size of each cell
    vis.gridWidth = vis.width;
    vis.gridHeight = vis.gridSize * (vis.n);


    // Initialize data to fill grid
    vis.data = new Array();

    for(var ii=0 ; ii<vis.n; ii++){
        vis.data.push(new Array());
        for(var jj=0 ; jj<vis.size ; jj++){
            vis.data[ii].push({
                width: vis.gridSize,
                height: vis.gridSize,
                x: vis.gridSize/2+vis.gridSize*(jj+1),
                y: vis.gridSize/2+vis.gridSize*ii,
                col: jj,
                row: ii,
                checked: false,
                fill: "#343a40"
            });
        }
    }

    //Initialize Text for grid labels
    vis.text = new Array();
    for(var ii=0 ; ii<vis.n; ii++) {
        vis.text.push({
            x: vis.gridSize  ,
            y: vis.gridSize + vis.gridSize * ii,
            text: alphabet_lower[vis.n-ii-1]
        });
    };


    vis.updateVis();

    // Add text labels to grid
    vis.text = vis.svg.selectAll("text")
        .data(vis.text)
        .enter().append("text")
        .attr("class","gridLabel")
        .attr("text-anchor","middle")
        .attr("alignment-baseline","middle")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .text(function(d) {return d.text;});


};



/*
 * Data wrangling
 */

gridsearch.prototype.wrangleData = function(d){
    var vis = this;

    vis.data.map(function(i){
        if(i[d.col].checked && i[d.col].row!=d.row){
            i[d.col].checked =false;
            i[d.col].fill="#343a40";
        }
    });

    if(vis.data[d.row][d.col].checked){
        vis.data[d.row][d.col].checked=false;
        vis.data[d.row][d.col].fill='#343a40';
    }else{
        vis.data[d.row][d.col].checked=true;
        vis.data[d.row][d.col].fill='#4682b4';
    }


    regex='';

    for(var jj=0 ; jj<vis.size; jj++){
        vis.add='[0-9]';
        for(var ii=0 ; ii<vis.n ; ii++){
            if(vis.data[ii][jj].checked){
                vis.add = vis.n-ii;
            };
        };
        regex+=vis.add;
    };


    vis.svg.selectAll("rect")
        .style('fill', function(d) {
            return d.fill
        });
    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

gridsearch.prototype.updateVis = function(){
    var vis = this;


    vis.row = vis.svg.selectAll(".row")
        .data(vis.data)
        .enter().append("g")
        .attr("class", "row");


    vis.col = vis.row.selectAll(".cell")
        .data(function (d) { return d; })
        .enter().append("rect")
        .merge(vis.row)
        .attr("class", "cell")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .style("stroke", '#f8f9fa')
        .style("fill", function(d){
            return(d.fill)
        })
        .on('mouseover', function() {
            d3v4.select(this)
                .style('fill', '#9abad6');
        })
        .on('mouseout', function(d) {
            d3v4.select(this)
                .style('fill', d.fill);
        })
        .on('click', function(d) {

            vis.wrangleData(d);
            });




};

gridsearch.prototype.buttonUpdate=function(){

    var pattern = new RegExp(regex + '+');
    console.log(pattern);

    searchID=[];
    for(ii=0 ; ii< saxWords.length ; ii++){
        if(pattern.test(saxWords[ii].sax)){
            if(saxWords[ii].id_tree<100){
                searchID.push(saxWords[ii].id_tree);
            }
        }
    };

    console.log(searchID);
    hightlightPath(searchID)
};
