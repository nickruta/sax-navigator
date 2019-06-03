/* main JS file */


// Will be used to the save the loaded csv data
var nameID = [];
var searchID =[];   //globally define result of query
var saxWords = []; 
var regex='';   //intialize regex search for grid
var n_letters=0; // number of letters in vocab
var collapse=false; //initialize collapsing condition (navbar shown at first)
var alphabet_upper=['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var alphabet_lower=['a','b','c','d','e','f','g','h','i','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
var selectedHeatmapData = [];

// Load metadata
queue()
    .defer(d3v4.csv,"static/resources/data/metadata/ts_astronomy_metadata2.csv")
    .await(loadData);

function loadData(error,names) {
    // console.log(error);
    nameID = names;

    // Sort Names /IDS in alphabetical order
    nameID.sort(function(a,b){
        if(a.name.toLowerCase() < b.name.toLowerCase()){
            return -1;
        }else{
            return 1;
        }
    });

    nameID.unshift({
        name: "Select",
        id:''
    });

    var n=0;
    var id_tree;


    // Create string of letters for each observation, match with tree ID
    for(ii=0 ; ii<saxArray.length ; ii++) {
        var saxregex= '';
        for(jj=0; jj<(Object.keys(saxArray[ii]).length-1); jj++){
            saxregex+=Object.values(saxArray[ii])[jj+1];
            if (Object.values(saxArray[ii])[jj+1] > n){
                n = Object.values(saxArray[ii])[jj+1];
                if(!isNaN(n)){
                    n_letters=n;
                }else{
                    n=n_letters;
                }
            }
        }
        for(kk=0; kk<nameID.length ; kk++){
            if(saxArray[ii].id==nameID[kk].id){
                id_tree = nameID[kk].id_tree;
                break;
            }
        }
            saxWords.push({
                id : saxArray[ii].id,
                sax : saxregex,
                id_tree: ''+id_tree
            });

    }

    createVis();

};


// Create Grid Search and Drop Dow query tools
function createVis() {
    //  Create event handler
    var gridSearch = new gridsearch("grid-search",n_letters,8);

    var dropSearch = new dropdown("drop-search",nameID);

    legendDraw();


}

// Collapse the navigation bar actions
function navAction(){
    $('#topbar').slideToggle('normal', resizeTable);
    if(collapse){
        // from collapsed to not-collapsed (get bigger)
        let beforeH = $('#tree-container').height();
        var x = document.getElementById("tree-container");
        x.style.height = '60vh';
        let afterH = $('#tree-container').height();

        var y = document.getElementById("viewerSVG");
        y.style.height = '60vh';
        y.style.transition = '0.5s';

        d3v3.select('.treeGroup')
            .transition()
            .duration(duration)
            .attr('transform', function(d) {
                // return 'translate(' + 96 + ',' + $('#tree-container').height() / 2 +') scale(' + currentScale + ')';
                return "translate(" + currentPos.x + ',' + (currentPos.y + (afterH - beforeH) / 2) + ") scale(" + currentScale + ")";
            });

        collapse=false;
    } else {
        // from not-collapsed to collapsed (get smaller)
        let beforeH = $('#tree-container').height();
        var x = document.getElementById("tree-container");
        x.style.height = '90vh';
        let afterH = $('#tree-container').height();

        var y = document.getElementById("viewerSVG");
        y.style.height = '90vh';
        y.style.transition = '0.5s';

        d3v3.select('.treeGroup')
            .transition()
            .duration(duration)
            .attr('transform', function(d) {
                // return 'translate(' + 96 + ',' + $('#tree-container').height() / 2 +') scale(' + currentScale + ')';
                return "translate(" + currentPos.x + ',' + (currentPos.y + (afterH - beforeH) / 2) + ") scale(" + currentScale + ")";
            });

        collapse=true;
    }
}


// Draw the legend for the heatmap and the cluster size
function legendDraw(){

    let legWidth = Math.min($("#heat-legend").width(),300);
    let gridSize = legWidth/10;


    //// Heatmap legend
    var x = [0,20,40,60,80,100];

    // set colormap (color varies from white to steelblue)
    let color_heat = d3v5.scaleSequential(
        d3v5.interpolateBlues//function(t) { return d3v5.interpolate("white", "steelblue")(t); }
    )
        .domain([0, 1]);

    // Collect legend characteristics
    heat_legend =  new Array();
    for(ii=0 ; ii<x.length; ii++){
        heat_legend.push({
            x: (gridSize+5)*(ii+1) ,
            y: 0,
            width: gridSize,
            height: gridSize,
            fill:color_heat(x[ii]/100),
            label: x[ii]+"%"
        })
    }

    // Draw legend svg
    let legend = d3v4.select("#heat-legend").append("svg")
            .attr("width",legWidth )
            .attr("height", legWidth/5)
            .append("g");

    // Colors
    legend.selectAll('rect')
        .data(heat_legend)
        .enter().append('rect')
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; })
        .attr('fill',function(d){return d.fill});

    // Values
    legend.selectAll('text')
        .data(heat_legend)
        .enter().append('text')
        .attr("x", function(d) { return (d.x+gridSize/2); })
        .attr("y", function(d) { return (d.y+gridSize*3/2); })
        .attr("text-anchor","middle")
        .attr("alignment-baseline","middle")
        .attr("font-size","10")
        .text(function(d) {return d.label;});

    //// Cluster Number Legend
    //// Cluster legend
    let radWidth = Math.min($("#cluster-legend").width(),50);
    let circleEx = d3v4.select("#cluster-legend").append("svg")
        .attr("width",legWidth )
        .attr("height", radWidth);

    circleEx.append("circle")
        .attr("cx", gridSize*1.5)
        .attr("cy", radWidth/2)
        .attr("r", radWidth/3)
        .attr('fill',"#343a40");

    circleEx.append("text")
        .attr("x", gridSize*1.5)
        .attr("y", radWidth/2)
        .attr("fill","#F0F8FF")
        .attr("alignment-baseline","middle")
        .attr("text-anchor","middle")
        .attr("font-size","12")
        .text("38");
}

$( document ).ready(function() {
    // enable the popover for the heatmap comparison panel
    // and then hide it on init
    $('#heatmap-comp-btn').popover().hide()
});

$('#heatmap-comp-btn').click(function () {
    let promise = Promise.resolve();
    promise
        .then(function (value) {
            // add the popover panel (append div element)
            $('#heatmap-comp-btn').popover().show();
        })
        .then(function (value) {
            if (selectedHeatmapData.length === 2) {
                d3v4.select('#compareHeatmaps')
                    .style('text-align', 'center')
                    .append('div')
                    .attr('id', 'selected-heatmaps')
                    .style('text-align', 'center');
                document.getElementById('selected-heatmaps').innerHTML += '<h6 style="text-align: left">Selected clusters</h6>';
                let selectedID1 = selectedHeatmapData[0].id,
                    selectedID2 = selectedHeatmapData[1].id;
                let data1 = d3v4
                    .select('#' + selectedID1)
                    .selectAll('.heatmapCell')
                    .data();
                let data2 = d3v4
                    .select('#' + selectedID2)
                    .selectAll('.heatmapCell')
                    .data();
                d3v4.select('#selected-heatmaps')
                    .append('div')
                    .attr('id', 'selected-heatmaps-' + selectedID1.split('-')[2])
                    .style('float', 'left')
                    .style('text-align', 'left')
                    .style('padding', '.5rem 1rem');
                document.getElementById('selected-heatmaps-' + selectedID1.split('-')[2]).innerHTML += '<label>Cluster A: ' + selectedHeatmapData[0].data.length + ' observations</label><br>';
                d3v4.select('#selected-heatmaps')
                    .append('div')
                    .attr('id', 'selected-heatmaps-' + selectedID2.split('-')[2])
                    .style('float', 'left')
                    .style('text-align', 'left')
                    .style('padding', '.5rem 1rem');
                document.getElementById('selected-heatmaps-' + selectedID2.split('-')[2]).innerHTML += '<label>Cluster B: ' + selectedHeatmapData[1].data.length + ' observations</label><br>';
                drawHeatmap('selected-heatmaps-' + selectedID1.split('-')[2], selectedHeatmapData[0].data, data1, 4);
                drawHeatmap('selected-heatmaps-' + selectedID2.split('-')[2], selectedHeatmapData[1].data, data2, 4);
                d3v4.selectAll('.compare')
                    .style('margin-left', '10px')
                    .style('margin-right', '10px');
                d3v4.select('#compareHeatmaps')
                    .append('div')
                    .attr('id', 'showDiff')
                    .style('clear', 'both')
                    .style('margin-top', '10px');
                document.getElementById('showDiff').innerHTML += '<h6 style="text-align: left">Differences between selected clusters (<span style="color: #276419">Cluster A</span> - <span style="color: #8E0152">Cluster B</span>)</h6>' +
                    '<div id="diffOptions">' +
                    '<form id="diffOptionsForm">' +
                    '<input type="radio" value="percentage" name="diffOption" checked><label>Percentage</label>' +
                    '<input type="radio" value="count" name="diffOption"><label style="margin-right: 10px">Count</label>' +
                    '</form></div>';
                drawDiffHeatmap('showDiff', data1, selectedHeatmapData[0].data.length,  data2, selectedHeatmapData[1].data.length, 4, 'percentage');
            }
        })
        .then(function (value) {
            $('#diffOptionsForm input').on('change', function() {
                d3v4.select('#diffHeatmap').remove();
                d3v4.select('#diffmapLegend').remove();
                let option = $('input[name=diffOption]:checked', '#diffOptionsForm').val();
                let selectedID1 = selectedHeatmapData[0].id,
                    selectedID2 = selectedHeatmapData[1].id;
                let data1 = d3v4
                    .select('#' + selectedID1)
                    .selectAll('.heatmapCell')
                    .data();
                let data2 = d3v4
                    .select('#' + selectedID2)
                    .selectAll('.heatmapCell')
                    .data();
                drawDiffHeatmap('showDiff', data1, selectedHeatmapData[0].data.length, data2, selectedHeatmapData[1].data.length, 4, option);
            });
        });
});
