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


// Load metadata
queue()
    .defer(d3v4.csv,"static/resources/data/metadata/ts_astronomy_metadata2.csv")
    .await(loadData);

function loadData(error,names) {
    // console.log(error);
    nameID = names;

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

function navAction(){
    $('#topbar').slideToggle('normal', resizeTable);
    if(collapse){
        var x = document.getElementById("tree-container");
        x.style.height = '60vh';

        var y = document.getElementById("viewerSVG");
        y.style.height = '60vh';
        y.style.transition = '0.5s';


        collapse=false;
    }else{
        var x = document.getElementById("tree-container");
        x.style.height = '90vh';

        var y = document.getElementById("viewerSVG");
        y.style.height = '90vh';
        y.style.transition = '0.5s';

        collapse=true;
    }
}

function legendDraw(){

    let legWidth = Math.min($("#heat-legend").width(),300);
    let gridSize = legWidth/10;


    //// Heatmap legend
    var x = [0,20,40,60,80,100];

    // set colormap (color varies from white to steelblue)
    let color_heat = d3v5.scaleSequential(
        function(t) { return d3v5.interpolate("white", "steelblue")(t); }
    )
        .domain([0, 1]);

    // Collect legend characteristics
    heat_legend =  new Array();
    for(ii=0 ; ii<x.length; ii++){
        heat_legend.push({
            x: (gridSize+10)*(ii+1) ,
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
        .text(function(d) {return d.label;});

    //// Cluster Number Legend
    //// Cluster legend
    let radWidth = Math.min($("#cluster-legend").width(),50);
    let circleEx = d3v4.select("#cluster-legend").append("svg")
        .attr("width",legWidth )
        .attr("height", radWidth);

    circleEx.append("circle")
        .attr("cx", gridSize*2)
        .attr("cy", radWidth/2)
        .attr("r", radWidth/2)
        .attr('fill',"#343a40");

    circleEx.append("text")
        .attr("x", gridSize*2)
        .attr("y", radWidth/2)
        .attr("fill","#F0F8FF")
        .attr("alignment-baseline","middle")
        .attr("text-anchor","middle")
        .text("38");




}

