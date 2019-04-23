const gridSize = 16; // size of each cell
// Function for converting a collection of time series represented by SAX into data for heatmap
function countSAX(data, SAXNum) {
  let size = 0;
  Object.keys(data[0]).forEach(function(e) {
      if (e !== 'id')
          size++;
  });
  let count = new Array(size);
  for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < size; j++) {
          if (count[j] === undefined) {
              count[j] = {};
              for (let k = 1; k <= SAXNum; k++) {
                  count[j][String(k)] = 0;
              }
          }
          if (data[i]['V' + (j + 1)] !== 'NA' && data[i]['V' + (j + 1)].length !== 0) {
              count[j][data[i]['V' + (j + 1)]] += 1;
          }
      }
  }
  let countResult = [];
  for (let i = 0; i < count.length; i++) {
      for (let key in count[i]) {
          countResult.push({'time': 'V' + (i + 1), 'variable': Number(key), 'value': count[i][key]});
      }
  }
  return countResult;
}

// Function for showing a heatmap
// id: id of HTML DOM
// data: collection of SAX values of time series in a cluster
//  e.g.) [[1, 1, 2, 3, 3, 4, 5, 4, 5, 3], (time series no. 1)
//         [1, 2, 3, 3, 3, 4, 4, 4, 5, 3], (time series no. 2)
//          ...
//         [1, 1, 2, 3, 3, 4, 5, 4, 5, 3]] (time series no. N)
// n: The number of SAX values
// size: The number of time points (the length of each time slice)
// xItems, yItems: The labels of axes (xItems: V1, V2, V3, ..., yItems:a, b, c, ...)
function drawHeatmap(id, data, countData, n) {//}, size, xItems, yItems) {
    // count how many times the SAX value appears at each time slice
    // Result: [{time: V1, variable: 1, value: 3},
    //          {time: V1, variable: 2, value: 5},
    //          ...]
    // note: 'time' is assigned to x, variable to y, and value (how many times) to color
    let size = 0;
    Object.keys(data[0]).forEach(function(e) {
        if (e !== 'id')
            size++;
    });
    let xItems = Object.keys(data[0]).filter(function(value) {
        return value.indexOf('V') >= 0;
    });
    let yItems = Array.from(new Array(n)).map((v, i) => String(i + 1));
    let margin = { "top": 10, "bottom": 10, "right": 30, "left": 10 };

    let clientWidth = gridSize * size + margin.left + margin.right,
        clientHeight = gridSize * n + margin.top + margin.bottom;
    let width = clientWidth - margin.left - margin.right,
        height = clientHeight - margin.top - margin.bottom;

    let svg = d3v5.select('#' + id)
        .append('svg')
        .attr('width', clientWidth)
        .attr('height', clientHeight)
        .attr('class', id)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // set axes
    let x = d3v5.scaleBand()
        .range([0, width])
        .domain(xItems)
        .padding(0.01);
    svg.append('f')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3v5.axisBottom(x).tickSize(0))
        .select(".domain").remove();

    let y = d3v5.scaleBand()
        .range([height, 0])
        .domain(yItems)
        .padding(0.01);

    let c = 'a'.charCodeAt(0);
    let yLabels = Array.apply(null, new Array(n)).map((v, i) => {
        return String.fromCharCode(c + i);
    });
    let yLabel = svg.selectAll('.saxLabel')
        .data(yLabels)
        .enter()
        .append('text')
        .text(function(d) {return d;})
        .attr('x', -3)
        .attr('y', function(d, i) {return height - (i * gridSize + gridSize / 4);})
        .style('text-anchor', 'end');
//        .attr('transform', 'translate(-6,0)');// + gridSize / 1.5 + ')');
//    heatmap.append('g')
//        .call(d3v5.axisLeft(y).tickSize(0))
//        .select(".domain").remove();

    // set colormap (color varies from white to steelblue)
    let color = d3v5.scaleSequential(
        function(t) { return d3v5.interpolate("white", "steelblue")(t); }
    )
        .domain([0, data.length]);
        // .domain([0, d3v5.max(countData, function (e) {
        //     return e.value;
        // })]);

    // set tooltip
    let tooltip = d3v5.select('#' + id)
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style("background-color", "white")
        .style("border", "solid dimgray")
        .style("border-width", "1px")
        .style("border-radius", "3px")
        .style("padding", "5px");

    // assign data to x position, y position, and color of each cell
    let cards = svg.selectAll()
        .data(countData, function (d) {
            return d.time + ':' + d.variable;
        });
    cards.enter()
        .append('rect')
        .attr('x', function (d) {
            return x(d.time);
        })
        .attr('y', function (d) {
            return y(d.variable);
        })
        .attr('width', gridSize)//x.bandwidth())
        .attr('height', gridSize)//y.bandwidth())
        .attr('class', 'heatmapCell')
        .style('fill', function (d) {
            return color(d.value);
        })
//        .on('mouseover', mouseover)
//        .on('mousemove', mousemove)
//        .on('mouseleave', mouseleave)
        .on('click', clickHeatmap);

    // interactions
    // mouseover: show tooltip
    // mousemove: move tooltip and update values on tooltip according to the position of the pointer
    // mouseleave: hide tooltip
    // mouseclick: focus on specific values and show all/mean+confidence interval of time series with the specific values
    function mouseover() {
        tooltip.style('opacity', 0.8);
    }
    function mousemove(d) {
        tooltip
            .html('Time: ' + d.time + '</br>'
            + 'SAX: ' + d.variable + '</br>'
            + 'Count: ' + d.value)
            .style('left', (d3v5.event.pageX + 10) + 'px')
            .style('top', (d3v5.event.pageY) + 'px');
    }
    function mouseleave() {
        tooltip.style('opacity', 0);
    }
    function clickHeatmap(d) {
        if (svg.selectAll('.lineGraph')._groups[0].length > 0) {
            svg.selectAll('.lineGraph')
                .remove();
        } else {
            svg.selectAll('.lineGraph')
                .remove();
            let points = [];
            let yRange = d3v5.scaleLinear()
                .domain([1 - 0.5, n + 0.5])
                .range([height, 0]);
            for (let i = 0; i < size; i++) {
                let ave = 0;
                let vari = 0;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]['V' + (i + 1)] !== 'NA')
                        ave += Number(data[j]['V' + (i + 1)]);
                }
                ave /= data.length;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]['V' + (i + 1)] !== 'NA')
                        vari += Math.pow(Number(data[j]['V' + (i + 1)]) - ave, 2);
                }
                vari /= data.length;
                vari = Math.sqrt(vari);
                points.push(['V' + (i + 1), ave, vari]);
            }
            svg.append('path')
                .datum(points)
                .attr('class', 'lineGraph')
                .attr('fill', "orange")
                .attr('stroke', 'none')
                .attr('opacity', 0.4)
                .attr('d', d3v5.area()
                    .x(function (d) {
                        return x(d[0]);
                    })
                    .y0(function (d) {
                        return yRange(d[1] - d[2]);
                    })
                    .y1(function (d) {
                        return yRange(d[1] + d[2]);
                    })
                    .curve(d3v5.curveCatmullRom)
                )
                .attr('transform', 'translate(' + (gridSize / 2) + ',' + 0 + ')');
            svg.append('path')
                .datum(points)
                .attr('class', 'lineGraph')
                .attr('fill', 'none')
                .attr('stroke', 'darkslateblue')
                .attr('stroke-width', 1)
                .attr('d', d3v5.line()
                    .x(function (d) {
                        return x(d[0]);
                    })
                    .y(function (d) {
                        return yRange(d[1]);
                    })
                    .curve(d3v5.curveCatmullRom)
                )
                .attr('transform', 'translate(' + (gridSize / 2) + ',' + 0 + ')');
        }
    }
    function clickHeatmapCell(d) {
        if (d3v5.select(this).attr('class').indexOf('selectedCell') >= 0) {
            svg.selectAll('rect')
                .attr('class', 'heatmapCell')
                .attr('stroke', 'none');
            svg.selectAll('.lineGraph')
                .remove();
        } else {
            svg.selectAll('rect')
                .attr('class', 'heatmapCell')
                .attr('stroke', 'none');
            d3v5.select(this)
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('class', 'heatmapCell selectedCell');
            let time = d.time.replace(/[^0-9^\.]/g,"") - 1;
            let selected = extractData(time, d.variable);
            svg.selectAll('.lineGraph')
                .remove();
            let mode = 'mean';//document.querySelector('input[name="mode"]:checked').value;
            // options: showing each time series as a time curve/showing mean and confidence interval of multiple time series
            switch (mode) {
                case 'each':
                    for (let i = 0; i < selected.length; i++) {
                        let tmp = [];
                        for (let j = 0; j < selected[i].length; j++) {
                            tmp.push(['V' + (j + 1), String(selected[i][j])]);
                        }
                        svg.append('path')
                            .datum(tmp)
                            .attr('class', 'lineGraph')
                            .attr('fill', 'none')
                            .attr('stroke', 'darkslateblue')
                            .attr('stroke-width', 1)
                            .style('opacity', 0.3)
                            .attr('d', d3v5.line()
                                .x(function (d) {
                                    return x(d[0]);
                                })
                                .y(function (d) {
                                    return y(d[1]);
                                })
                                .curve(d3v5.curveCatmullRom)
                            )
                            .attr('transform', 'translate(' + (gridSize / 2) + ',' + (gridSize / 2) + ')');
                    }
                    break;
                case 'mean':
                    let points = [];
                    let yRange = d3v5.scaleLinear()
                        .domain([1 - 0.5, n + 0.5])
                        .range([height, 0]);
                    for (let i = 0; i < size; i++) {
                        let ave = 0;
                        let vari = 0;
                        for (let j = 0; j < selected.length; j++) {
                            ave += Number(selected[j]['V' + (i + 1)]);
                        }
                        ave /= selected.length;
                        for (let j = 0; j < selected.length; j++) {
                            vari += Math.pow(Number(selected[j]['V' + (i + 1)]) - ave, 2);
                        }
                        vari /= selected.length;
                        vari = Math.sqrt(vari);
                        points.push(['V' + (i + 1), ave, vari]);
                    }
                    svg.append('path')
                        .datum(points)
                        .attr('class', 'lineGraph')
                        .attr('fill', "orange")
                        .attr('stroke', 'none')
                        .attr('opacity', 0.4)
                        .attr('d', d3v5.area()
                            .x(function (d) {
                                return x(d[0]);
                            })
                            .y0(function (d) {
                                return yRange(d[1] - d[2]);
                            })
                            .y1(function (d) {
                                return yRange(d[1] + d[2]);
                            })
                            .curve(d3v5.curveCatmullRom)
                        )
                        .attr('transform', 'translate(' + (gridSize / 2) + ',' + 0 + ')');
                    svg.append('path')
                        .datum(points)
                        .attr('class', 'lineGraph')
                        .attr('fill', 'none')
                        .attr('stroke', 'darkslateblue')
                        .attr('stroke-width', 1)
                        .attr('d', d3v5.line()
                            .x(function (d) {
                                return x(d[0]);
                            })
                            .y(function (d) {
                                return yRange(d[1]);
                            })
                            .curve(d3v5.curveCatmullRom)
                        )
                        .attr('transform', 'translate(' + (gridSize / 2) + ',' + 0 + ')');
                    break;
            }
        }
        // related to mouseclick interaction
        // extract time series with specific values
        function extractData(x, y) {
            let key = 'V' + (x + 1);
            let result = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i][key] === String(y)) {
                    result.push(data[i]);
                }
            }
            return result;
        }
    }
}

