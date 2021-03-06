let columns = ['ID/Name', 'Graph'], metaList;
let metadata, table_line, table, head, tbody, tbody_line;

// set multi line view
let multiLines = d3v4.select('#superposition')
                    .append('svg');

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";
let individualWidth = $('#individual-view').width();
let margin_ML = {top: 20, right: 10, bottom: 30, left: 10},
    width_ML = individualWidth - margin_ML.left - margin_ML.right,
    height_ML = 150 - margin_ML.top - margin_ML.bottom;

multiLines
    .attr('width', width_ML + margin_ML.left + margin_ML.right)
    .attr('height', height_ML + margin_ML.top + margin_ML.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin_ML.left + ',' + margin_ML.top + ')');

let xScale_ML = d3v4.scaleLinear()
        .range([0, width_ML]);
let yScale_ML = d3v4.scaleLinear()
        .range([height_ML, 0]);

let line_ML = d3v4.line()
    .curve(d3v4.curveBasis)
    .x(function(d) { return xScale_ML(d.x) })
    .y(function(d) { return yScale_ML(d.y) });

d3v4.selection.prototype.moveToFront =
    function() {
        return this.each(function(){this.parentNode.appendChild(this);});
    };

d3v4.csv("static/resources/data/metadata/ts_astronomy_metadata2.csv", function(data) {
    let mdata = {};
    data.forEach(function(d) {
        let id = d.id;
        // let tmp = {};
        // for (let key in d) {
        //     tmp[key] = d[key];
        //     if (key.indexOf('id') === -1) {
        //         tmp[key] = d[key];
        //     }
        // }
        mdata[id] = d;//tmp;
    });
    metadata = mdata;
    metaList = data.columns.filter(function(e) {
        return e.indexOf('id') === -1;
    });
});

function setTables() {
    let individualWidth = $('#individual-view').width();
    let individualHeight = $('#tree-container').height() - $('#superposition').height() - $('#collapse-navigation').height() - $('#set-max-cluster-size').height() + 'px';
    // let individualWidth = $('#individual-view').width();
    // let individualHeight = window.innerHeight - $('.nav-collapse').height() - height_ML;
    let sparklineArea = document.getElementById('sparklines');
    let scrollWidth = sparklineArea.offsetWidth - sparklineArea.clientWidth;
    d3v4.select('#sparklines')
        .style('overflow-y', 'scroll')
        .style('overflow-x', 'hidden')
        .style('white-space', 'nowrap')
        .style('width', individualWidth + 'px')
        .style('height', individualHeight);

    let div_table_line = d3v4.select('#sparklines')
        .append('div')
        .attr('class', 'sparkTableLock')
        .style('float', 'left')
        .style('width', 'auto');
    table_line = div_table_line
        .append('table');

    let div_table = d3v4.select('#sparklines')
        .append('div')
        .attr('class', 'sparkTableScroll')
        .style('float', 'left')
        .style('overflow-y', 'hidden')
        .style('overflow-x', 'scroll')
        .style('width', (250 - scrollWidth) + 'px');
    table = div_table
        .append('table');
    let thead_line = table_line.append('thead')
        .append('tr');
    thead_line.selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function(d) {
            return d;
        })
        .attr('text-align', 'center');
    tbody_line = table_line.append('tbody');
    thead = table.append('thead')
        .append('tr');
    thead.selectAll('th')
        .data(metaList)
        .enter()
        .append('th')
        .text(function(d) {
            return d;
        })
        .attr('text-align', 'center');
    tbody = table.append('tbody');
}

function resizeTable() {
    let individualWidth = $('#individual-view').width();
    let individualHeight = $('#tree-container').height() - $('#superposition').height() - $('#collapse-navigation').height() - $('#set-max-cluster-size').height() + 'px';

    d3v4.select('#sparklines')
        .style('width', individualWidth + 'px')
        .style('height', individualHeight);
}

function showIndividualView(d, filename, id) {
    // get metadata (mean, sd, etc.) of the time series
    // first column should be empty to input a graph
    let features = [];
    for (let i = 0; i < metaList.length; i++) {
        if (metaList[i] in metadata[id]) {
            features.push(metadata[id][metaList[i]]);
        } else {
            if (metaList[i] === 'id') {
                features.push(id);
            } else if (metaList[i] === 'Graph') {
                features.push('');
            }
        }
    }
    // import individual time series data
    d3v4.csv("static/resources/data/ts_astronomy_lightcurves_processed/" + filename, function(error, data) {
        if (error) throw error;
//         format the data
        data.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
        });


        // add feature values to the table
        let featureData = tbody.selectAll('tr').data();
        featureData.push(features);

        let trows = tbody
            .selectAll('tr')
            .data(featureData)
            .enter()
            .append('tr')
            .attr('class', 'id' + id + ' metadataTable');  // class: id1001015004303 metadataTable

        trows.selectAll("td")
            .data(function(d, i) { return d; })
            .enter()
            .append("td")
            .style('height', '43px')
            .text(function(d, i) { return d; })
            .on("mouseover", mouseoverRow)
            .on('click', mouseclickRow);
            // .on('click', );

        // add a sparkline to the table
        let trows_line = tbody_line.append('tr')
            .attr('class', 'id' + id + ' metadataTable');
        // add ids to table
        trows_line.append('td')
            .style('height', '43px')
            .text(id)
            .on("mouseover", mouseoverRow)
            .on('click', mouseclickRow);
        // add sparklines to table
        trows_line.append('td')
            .attr('class', 'graph')
            .style('height', '43px')
            .on("mouseover", mouseoverRow)
            .on('click', mouseclickRow)
            .each(lines);
//        let GraphID = ['', 'ID/Name'];
//        let trows_line = tbody_line.append('tr')
//            .data(GraphID)
//            .enter()
//            .append('tr')
//            .attr('class', 'id' + id + ' metadataTable');
//        trows_line.selectAll("td.graph")
//        //use a class so you don't re-select the existing <td> elements
//            .data(function(d, i) { return [d[i]]; })
//            .enter()
//            .append("td")
//            .attr("class", "graph")
//            .each(lines);

        function mouseclickRow() {
            let selectedID = this.parentNode.getAttribute('class').split(' ')[0].slice(2);
            hightlightPath([metadata[selectedID].id_tree]);
            d3v4.selectAll('tr.metadataTable')
                .style('border', '1px solid #ddd');
            d3v4.selectAll('tr.metadataTable.' + 'id' + selectedID)
                .style('border', '2px solid #DAA520');

            // highlight the clicked row's time series on the line graph
            let selectedID_2 = this.parentNode.getAttribute('class').split(' ')[0];
            clickHightlightMultiLineChart(selectedID_2)
        }

        function mouseoverRow(d) {
            let selectedID = this.parentNode.getAttribute('class').split(' ')[0];
            d3v4.selectAll('tr.metadataTable')
                .style('background', '#fff');
            d3v4.selectAll('tr.metadataTable.' + selectedID)
                .style('background', '#eee');
            hightlightMultiLineChart(selectedID);
        }

        function lines() {
            let margin = {top: 5, right: 5, bottom: 5, left: 5},
                width = 200 - margin.left - margin.right,
                height = 40 - margin.top - margin.bottom;
            let x = d3v4.scaleLinear()
                .range([0, width])
                .domain(d3v4.extent(data, function(d) { return d.x; }));
            let y = d3v4.scaleLinear()
                .range([height, 0])
                .domain(d3v4.extent(data, function(d) { return d.y; }));

            let line = d3v4.line()
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); });

            d3v4.select(this).append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .attr('fill', 'none')
                .attr('stroke', '#888')
                .attr('stroke-width', 1)
                .append('path')
//                .attr('class','line')
                .datum(data)
                .attr('d', line)
                .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');
            setMultiLines();
            //let svg = d3v4.select('#sparklines')
            //    .append('svg')
            //    .attr('width', width + margin.left + margin.right)
            //    .attr('height', height + margin.top + margin.bottom)
            //    .append('g')
            //    .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');



            // Add the valueline path.
            //svg.append("path")
            //    .data([data])
            //   .attr('fill', 'none')
            //    .attr('stroke', '#aaa')
            //    .attr('stroke-width', 1)
            //    //.attr("class", "line")
            //    .attr("d", line);

        }

        function setMultiLines() {
            xScale_ML.domain(d3v4.extent(data, function(d) { return d.x; }));
            yScale_ML.domain(d3v4.extent(data, function(d) { return d.y; }));

            multiLines.append('path')
                .datum(data)
                .attr('d', line_ML)
                .style('fill', 'none')
                .style('stroke', '#888')
                .style('opacity', '0.5')
                .style("stroke-width", lineStroke)
                .attr('class', 'id' + id + ' multiLineChart')  // class: id1001015004303 superposition
                .attr('transform', 'translate(' + margin_ML.left + ',' + margin_ML.right + ')')
                .on("mouseover", function(d) {
                    let selectedID = this.getAttribute('class').split(' ')[0];
                    highlightTable(selectedID);
                    d3v4.selectAll('.multiLineChart')
                        .style('opacity', '0.3')
                        .style("stroke-width", lineStroke)
                        .style('stroke', '#888');
                    d3v4.select(this)
                        .style('opacity', '1')
                        .style("stroke-width", lineStrokeHover)
                        .style("cursor", "pointer")
                        .style('stroke', 'steelblue');
                  })
                .on("mouseout", function(d) {
                    d3v4.selectAll(".multiLineChart")
                        .style('opacity', '0.5')
                        .style("stroke-width", lineStroke)
                        .style('stroke', '#888');
                    d3v4.selectAll('tr')
                        .style('background', '#fff');
                    d3v4.select(this)
                        .style("stroke-width", lineStroke)
                        .style("cursor", "none");
                });
        }
        function highlightTable(id) {
            d3v4.selectAll('tr')
                .style('background', '#fff');
            d3v4.selectAll('tr.' + id)
                .style('background', '#eee');
        }
        function hightlightMultiLineChart(id) {
            d3v4.selectAll('path.multiLineChart')
                .style('opacity', '0.3')
                .style("stroke-width", lineStroke)
                .style('stroke', '#888');
            d3v4.select('path.' + id)
                .moveToFront()
                .style('opacity', '1')
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer")
                .style('stroke', 'steelblue');
        }
        function clickHightlightMultiLineChart(id) {
            d3v4.selectAll('.clickHighlighted')
                .style('opacity', '0.3')
                .style("stroke-width", lineStroke)
                .style('stroke', '#888')
                .classed("clickHighlighted", false);
            d3v4.select('path.' + id)
                .moveToFront()
                .attr("class", "clickHighlighted")
                .style('opacity', '1')
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer")
                .style('stroke', '#fcb315');
        }
    });
}


//function drawMultiSeriesLineChart(ts_ids) {
//    let margin = {top: 20, right: 10, bottom: 30, left: 50},
//        width = 500 - margin.left - margin.right,
//        height = 150 - margin.top - margin.bottom;
//
//    multiLines
//        .attr('width', width + margin.left + margin.right)
//        .attr('height', height + margin.top + margin.bottom)
//        .append('g')
//        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//
//    let x = d3v4.scaleLinear()
//            .range([0, width]);
//    let y = d3v4.scaleLinear()
//            .range([height, 0]);
//
//    let line = d3v4.line()
//            .curve(d3v4.curveBasis)
//            .x(function(d) { return x(d.x) })
//            .y(function(d) { return y(d.y) });
//
//    ts_ids.forEach(function(e) {
//        let filename = astronomy_ts_fnames_list.fnames_astronomy[e];
//        // Load original time-series data
//        d3v4.csv("static/resources/data/ts_astronomy_lightcurves_processed/" + filename, function(error, data) {
//            // format data
//            data.forEach(function(d) {
//                d.x = +d.x;
//                d.y = +d.y;
//            });
//
//            x.domain(d3v4.extent(data, function(d) { return d.x; }));
//            y.domain(d3v4.extent(data, function(d) { return d.y; }));
//            multiLines.append('path')
//                .datum(data)
//                .attr('d', line)
//                .style('fill', 'none')
//                .style('stroke', '#888')
//                .style('opacity', '0.5')
//                .attr('class', 'superposition')
//                .on("mouseover", function(d) {
//                    d3v4.selectAll('.superposition')
//                        .style('opacity', '0.3')
//                        .style('stroke', '#888');
//                    d3v4.select(this)
//                        .style('opacity', '1')
//                        .style("stroke-width", 2.5)
//                        .style("cursor", "pointer")
//                        .style('stroke', 'steelblue');
//                  })
//                .on("mouseout", function(d) {
//                    d3v4.selectAll(".superposition")
//                        .style('opacity', '0.5')
//                        .style('stroke', '#888');
//                    d3v4.select(this)
//                        .style("stroke-width", 2)
//                        .style("cursor", "none");
//                });
//        })
//    })
//}