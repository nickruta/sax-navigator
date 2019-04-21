

// drop down menu
dropdown = function(_parentElement, _data, ) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.createMenu();
};

// initialize visualization (static content, e.g. SVG area or axes)
dropdown.prototype.createMenu = function() {
    var vis = this;

    // vis.dropMenu = d3v4.select("#" + this.parentElement);
    vis.dropMenu = d3v4.select("#" + this.parentElement);

    // Add items to dropdown menu
    vis.dropMenu
        .selectAll(".dropdown-item")
        .data(vis.data)
        .enter().append("a")
        .attr("class","dropdown-item")
        .attr("href","#")
        .attr("data-key", function(d){
            return d.id_tree;
        })
        .html(function(d){
            return d.id;
        })
        .text(function(d){
            return d.name;
        });

    // on click export tree ID to global variable
    $('.dropdown-menu a').click(function(e){
        //prevent default link behavior
        $('#dropdownMenuButton').text($(this).text());
        e.preventDefault();

        searchID=[]
        searchID.push(''+(this.dataset.key));

        hightlightPath(searchID)
    })


};

function hightlightPath(searchID) {

    console.log("highlighting paths...")
    console.log(searchID)

    // remove colors from paths before adding new ones
    d3v4.selectAll(".node").style("stroke", "#ccc")

    searchID.forEach(function(id) {


        nodes = d3v4.selectAll(".node")
        nodes._groups[0].forEach(function(node){



            node_ids_list = node.id.split('-')

            if(node_ids_list.includes(id)) {
                console.log("FOUND IT")
                console.log(id)
                console.log(node.id)
                path = d3v4.selectAll("#ids" + node.id)
                path.style('stroke', '#DAA520')
            }
        })
    })
}