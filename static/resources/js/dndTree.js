/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/


// Get JSON data
// treeJSON = d3v3.json("static/resources/js/flare.json", function(error, treeData) {
// treeJSON = d3v3.json("static/resources/data/ts_atp_sax/atp_n6_size1.json", function(error, treeData) {
//d3v4.csv("static/resources/data/ts_atp_sax/atp_n6_size1.csv", function(error, list) {
//    drawTree(list);
//});
saxArray=[];
maxTree=[];
let origin = {};
let baseSVGDragFlg = false;
const initScale = 0.51;
d3v4.csv("static/resources/data/ts_astronomy_sax/atp_n4_size1.csv", function(error, list) {
    saxArray=list;
    drawTree(list);
});

function drawTree(originalData) {

    json_tree_data = "static/resources/data/ts_astronomy_sax/astronomy_n4_size1_binary_complete_500.json"
    // json_tree_data = "static/resources/data/ts_astronomy_sax/astronomy_n4_size1_50.json"
    treeJSON = d3v3.json(json_tree_data, function(error, treeData) {

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;

    // size of the diagram
    // var viewerWidth = $(document).width();
    // var viewerHeight = $(document).height();
    var viewerWidth = $('#tree-container').width() - parseInt($('.container-fluid').css('margin-right').replace('px', ''));//1200;
    var viewerHeight = $('#tree-container').height();

    var tree = d3v3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3v3 diagonal projection for use by the node paths later on.
    var diagonal = d3v3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        var speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3v3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3v3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        let props = $('.treeGroup').css('transform');
        let vals = props.split('(')[1];
        vals = vals.split(')')[0];
        vals = vals.split(',');
        svgGroup.attr("transform", "translate(" + (d3v3.event.translate[0] + origin.x) + ',' + (d3v3.event.translate[1] + origin.y) + ") scale(" + (initScale * d3v3.event.scale) + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3v3.behavior.zoom().scaleExtent([0.1, 3 ]).on("zoom", zoom);

    // DRAG EVENT COMMENTED OUT FOR NOW

    // function initiateDrag(d, domNode) {
    //     draggingNode = d;
    //     d3v3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
    //     d3v3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
    //     d3v3.select(domNode).attr('class', 'node activeDrag');
    //
    //     svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
    //         if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
    //         else return -1; // a is the hovered element, bring "a" to the front
    //     });
    //     // if nodes has children, remove the links and nodes
    //     if (nodes.length > 1) {
    //         // remove link paths
    //         links = tree.links(nodes);
    //         nodePaths = svgGroup.selectAll("path.link")
    //             .data(links, function(d) {
    //                 return d.target.id;
    //             }).remove();
    //         // remove child nodes
    //         nodesExit = svgGroup.selectAll("g.node")
    //             .data(nodes, function(d) {
    //                 return d.id;
    //             }).filter(function(d, i) {
    //                 if (d.id == draggingNode.id) {
    //                     return false;
    //                 }
    //                 return true;
    //             }).remove();
    //     }
    //
    //     // remove parent link
    //     parentLink = tree.links(tree.nodes(draggingNode.parent));
    //     svgGroup.selectAll('path.link').filter(function(d, i) {
    //         if (d.target.id == draggingNode.id) {
    //             return true;
    //         }
    //         return false;
    //     }).remove();
    //
    //     dragStarted = null;
    // }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3v3.select("#tree-container").append("svg")
        .attr("id","viewerSVG")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener)
        .on('mousedown', function () {
            baseSVGDragFlg = false;
        })
        .on('mousemove', function () {
            baseSVGDragFlg = true;
        })
        .on('mouseup', function () {
            if (!baseSVGDragFlg) {
                d3v3.selectAll(".link")
                    .style("stroke", "#ccc");
                d3v3.selectAll('tr.metadataTable')
                    .style('border', '1px solid #ddd');
            }
        });

  // ACTION EVENTS COMMENTED OUT FOR NOW

    // Define the drag listeners for drag/drop behaviour of nodes.
  //   dragListener = d3v3.behavior.drag()
  //       .on("dragstart", function(d) {
  //           if (d == root) {
  //               return;
  //           }
  //           dragStarted = true;
  //           nodes = tree.nodes(d);
  //           d3v3.event.sourceEvent.stopPropagation();
  //           // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3v3.select(this).attr('pointer-events', 'none');
  //       })
  //       .on("drag", function(d) {
  //           if (d == root) {
  //               return;
  //           }
  //           if (dragStarted) {
  //               domNode = this;
  //               initiateDrag(d, domNode);
  //           }
  //
  //           // get coords of mouseEvent relative to svg container to allow for panning
  //           relCoords = d3v3.mouse($('svg').get(0));
  //           if (relCoords[0] < panBoundary) {
  //               panTimer = true;
  //               pan(this, 'left');
  //           } else if (relCoords[0] > ($('svg').width() - panBoundary)) {
  //
  //               panTimer = true;
  //               pan(this, 'right');
  //           } else if (relCoords[1] < panBoundary) {
  //               panTimer = true;
  //               pan(this, 'up');
  //           } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
  //               panTimer = true;
  //               pan(this, 'down');
  //           } else {
  //               try {
  //                   clearTimeout(panTimer);
  //               } catch (e) {
  //
  //               }
  //           }
  //
  //           d.x0 += d3v3.event.dy;
  //           d.y0 += d3v3.event.dx;
  //           var node = d3v3.select(this);
  //           node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
  //           updateTempConnector();
  //       }).on("dragend", function(d) {
  //           if (d == root) {
  //               return;
  //           }
  //           domNode = this;
  //           if (selectedNode) {
  //               // now remove the element from the parent, and insert it into the new elements children
  //               var index = draggingNode.parent.children.indexOf(draggingNode);
  //               if (index > -1) {
  //                   draggingNode.parent.children.splice(index, 1);
  //               }
  //               if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
  //                   if (typeof selectedNode.children !== 'undefined') {
  //                       selectedNode.children.push(draggingNode);
  //                   } else {
  //                       selectedNode._children.push(draggingNode);
  //                   }
  //               } else {
  //                   selectedNode.children = [];
  //                   selectedNode.children.push(draggingNode);
  //               }
  //               // Make sure that the node being added to is expanded so user can see added node is correctly moved
  //               expand(selectedNode);
  //               sortTree();
  //               endDrag();
  //           } else {
  //               endDrag();
  //           }
  //
  // // node.each(function(d, i) {
  // //   // console.log(d + " " + i);
  // //   addTSNode(d);
  // // });
  //
  //           // node.on("click", function(d){
  //
  //
  //           //     console.log(d.name)
  //           //         if(d.name == "Root") {
  //           //           d3v3.selectAll("#cluster-display svg").remove();
  //           //         } else {
  //           //           updateTSNodes(d)
  //           //         }
  //           //                 // d3v3.select(this).attr('r', 25)
  //           //                 //     .style("fill","lightcoral")
  //           //                 //     .style("stroke","red");
  //           // });
  //
  //       });

    // function endDrag() {
    //     selectedNode = null;
    //     d3v3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
    //     d3v3.select(domNode).attr('class', 'node');
    //     // now restore the mouseover event or we won't be able to drag a 2nd time
    //     d3v3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
    //     updateTempConnector();
    //     if (draggingNode !== null) {
    //         update(root);
    //         centerNode(draggingNode);
    //         draggingNode = null;
    //     }
    // }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3v3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3v3.svg.diagonal());

        link.exit().remove();
    };


    // CENTER NODE ACTION COMMENTED OUT FOR NOW

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    // function centerNode(source) {
    //     scale = zoomListener.scale();
    //     x = -source.y0;
    //     y = -source.x0;
    //     x = x * scale + viewerWidth / 2;
    //     y = y * scale + viewerHeight / 2;
    //     d3v3.select('g.node').transition()
    //         .duration(duration)
    //         .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
    //     zoomListener.scale(scale);
    //     zoomListener.translate([x, y]);
    // }

    // Toggle children function

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

     // function click(d) {
     //     if (d3v3.event.defaultPrevented) return; // click suppressed
     //     d = toggleChildren(d);
     //     update(d);
     //     centerNode(d);
     // }

    function hover(d) {
        if (d3v3.event.defaultPrevented) return; // click suppressed

        // console.log(d)

        if(d.name == "Root1") {
            d3v3.selectAll("#cluster-display svg").remove();
        } else {
            updateTSNodes(d)
        }
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3v3.max(levelWidth) * 150; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);
        let heatmapWidth = 210;
//        for (let i = 0; i < nodes.length; i++) {
//            nodes[i].y += heatmapWidth * nodes[i].depth;
//        }
//            console.log('after', nodes);
//        let curLev = root;
//        let levCount = 1;
//        console.log('before', treeData);
//        console.log(root.depth);
//        while('children' in curLev) {
//            let children = curLev.children;
//            for (let i = 0; i < children.length; i++) {
//                children[i].x += heatmapWidth * levCount;
//            }
//            levCount++;
//            curLev = children;
//        }
//        console.log('after', treeData);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d, i) {
            // d.y = (d.depth * (maxLabelLength * 14)); //maxLabelLength * 10px
//            if (d.name.indexOf('Root') >= 0) {
//                origin.x = d.x;
//                origin.y = d.y;
//            }
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            d.y = (d.depth * 200); //500px per level.
        });

        let props = $('.treeGroup').css('transform'); 
        let vals = props.split('(')[1];
        vals = vals.split(')')[0];
        vals = vals.split(',');
        origin.x = Number(vals[vals.length - 2]);
        origin.y = Number(vals[vals.length - 1]);

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                     return d.id || (d.id = ++i);
            });
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            // .call(dragListener)
            .attr("class", "node")
            .attr("id", function(d){
                return d.name
            })
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            // .on('click', click)
            .on('mouseover', hover);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr('id', function(d) {return 'circle-node-' + d.id})
            .attr('transform', function(d) {
                if ('parent' in d) {
                    return 'translate(' + (heatmapWidth * d.parent.depth) + ', 0)';
                } else {
                    return 'translate(' + (heatmapWidth * d.depth) + ', 0)';
                }
            });
        // this section places the heatmaps near their respective nodes
        let heatmaps = svgGroup.selectAll('g.heatmap-node')
            // .data(nodes, function(d) {
            //     return d.id || (d.id = ++i);
            // });
            .data(nodes.filter(function(d) {
                let names = d.name.split('-');
                return names.length > 1;
            }));
        heatmaps
            .enter()
            .append('g')
            .attr('id', function (d) { return "heatmap-node-" + d.id; })
            .attr('class', 'heatmap-obj')
//            .attr("pointer-events", "none")
            .each(heatmap);

        // move to origin (the center of heatmap area = position of root)
        heatmaps
            .attr("transform", function(d) {
                let heatmapHeight = d3v4.select('#heatmap-node-' + d.id).node().getBBox().height;
                return "translate(" + (origin.x - heatmapHeight / 2 - 10) + ")";
            });
//        nodeEnter.append('svg')
//            .attr('class', 'heatmap-obj')
//            .attr('id', function (d) { return "heatmap-node-" + d.id; })
//            .attr("y", source.y)
//            .attr("x", function(d) {
//                var selected = d3v4.select(this.parentNode).select(".nodeCircle")._groups[0][0]
//                let div = document.getElementsByClassName(d.id);
//
//                let data = [];
//
//                if (d.id < nodes.length) {
//                    let nodeName = nodes[d.id].name;
//                    if (nodeName.indexOf('Root') === -1 && nodes[d.id].name.length > 1) {
//                        let idx = nodes[d.id].name.split('-').map(x => {
//                            return isNaN(x) ? x : Number(x)}
//                        );
//                        for (let j = 0; j < idx.length; j++) {
//                            data.push(originalData[idx[j]]);
//                        }
//                        let countData = countSAX(data, 4);
//                        div.innerHTML += nodes[d.id].name + '</n>';
//                        drawHeatmap("heatmap-node-" + d.id, data, countData, 4);
//                    }
//                }
//            // return -380;
//            return source.x - 1070
//        })
//        // this removes hover effect for the heatmaps
//        .attr("pointer-events", "none");

//        d3v4.selectAll('.heatmap-obj').append('text')
//            .text(function(d) {
//                if (d.name === 'Root1') {
//                    return 1
//                } else {
//                    cluster_size = d.name.split('-').length
//                    return cluster_size;
//                }
//            })
//            .attr("x", function(d) {
//                return 210
//                // return d.children || d._children ? -10 : 10;
//            })
//            .attr("dy", "50")
//            .attr('class', '')
//            // .attr("text-anchor", function(d) {
//            //     return d.children || d._children ? "end" : "start";
//            // })
//            .style("fill-opacity", 1);
        // END: heatmap add to nodes




        // adds node labels as all cluster member's names separated by a '-'
        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        // nodeEnter.append("circle")
        //     .attr('class', 'ghostCircle')
        //     .attr("r", 0)
        //     .attr("opacity", 0.2) // change this to zero to hide the target area
        // .style("fill", "red")
        //     .attr('pointer-events', 'mouseover')
        //     .on("mouseover", function(node) {
        //         overCircle(node);
        //     })
        //     .on("mouseout", function(node) {
        //         outCircle(node);
        //     });


        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 10;
            })
            // .attr("text-anchor", function(d) {
            //     return d.children || d._children ? "end" : "start";
            // })
            .text(function(d) {
                if (d.name == "Root1") {
                    return "Root"
                }
                // return d.name;

                cluster_size = d.name.split('-').length

                if (cluster_size > 1) {
                  return cluster_size;
                } else {
                  return '';
                }
                // return "Cluster Size: " + cluster_size
            })
            .attr('fill-opacity', 1)
            .attr('transform', function(d) {
                if ('parent' in d) {
                    return 'translate(' + (13 + heatmapWidth * d.parent.depth) + ', 0)';
                } else {
                    return 'translate(' + (13 + heatmapWidth * d.depth) + ', 0)';
                }
            })
            .attr('fill', function (d) {
                if (d.name.indexOf('Root') >= 0) {
                    return "#343a40";
                } else {
                    return '#ddd';
                }
            })
            .attr('text-anchor','middle')
            .attr('font-weight','bold');

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", function (d) {
                if (d.name.split('-').length > 1 || d.name.indexOf('Root') >= 0) {
                    return 15;
                } else {
                    return 5;
                }
            })
            .style("fill", function(d) {
                if (d.name.indexOf('Root') >= 0 || d.name.split('-').length <= 1) {
                    return '#fff';
                } else {
                    return d._children ? "#343a40" : "#343a40";
                }
            })
            .style("stroke","343a40");
        let pos = '';
        // Transition nodes and heatmaps to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        heatmaps.transition()
            .duration(duration)
            .attr('transform', function(d) {
                let heatmapHeight = d3v4.select('#heatmap-node-' + d.id).node().getBBox().height;
                if (d.name.split('-').length > 1) {
                    return 'translate(' + (d.y + heatmapWidth * d.parent.depth + 30) + ',' + (d.x - heatmapHeight / 2 - 10) + ')';
                } else {
                    return '';
                }
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);


        // Transition exiting heatmaps to the parent's new position.
        let heatmapExit = heatmaps.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
        heatmapExit.select('rect')
            .attr('width', 0)
            .attr('height', 0);
        heatmapExit.select('text')
            .style("fill-opacity", 0);
        heatmaps.exit().remove();

        // CUSTOM CODE FOR REMOVING NODES CIRCLES OF LEAVES
        // selected = node.selectAll(".node circle")
        // selected.filter(function(d, i) {
        //     cluster_size = d.name.split('-').length
        //     return cluster_size < 2;
        // }).remove()

        // create list of lengths to use for the scale
        nodesList = d3v4.selectAll(".node")
        nodes_sizes_list = []
        nodesList._groups[0].forEach(function(node){

            node_ids_list = node.id.split('-')
            nodes_sizes_list.push(node_ids_list.length)

        })

        // scale for cluster sizes
        var cluster_size_scale = d3v4.scaleLinear()
          .domain([d3v4.min(nodes_sizes_list), d3v4.max(nodes_sizes_list)])
          .range([1, 15]);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("id", function(d){
                return "ids" + d.target.name
            })
            .style("stroke-width", function(d) {
                cluster_size = d.target.name.split('-').length
                return cluster_size_scale(cluster_size) + "px";
            })
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal)
            .attr('transform', function(d) {
                return 'translate(' + (heatmapWidth * d.source.depth) + ',0)';
            });

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // CUSTOM CODE FOR REMOVING LEAVES LINKS
        // links_selected = d3v4.selectAll("#tree-container svg g path.link")
        // links_selected.filter(function(d, i) {
        //     cluster_size = d.target.name.split('-').length
        //     return cluster_size < 2;
        // }).remove()

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function heatmap(d) {
//        var selected = d3v4.select(this.parentNode).select(".nodeCircle")._groups[0][0]
            if ($("svg.heatmap-node-" + d.id).length === 0 && d.name.split('-').length > 1) {
                let div = document.getElementsByClassName(d.id);

                let data = [];

                if (d.id < nodes.length) {
                    let nodeName = d.name;
                    if (nodeName.indexOf('Root') === -1) { //&& nodes[d.id].name.length > 1) {
                        let idx = d.name.split('-').map(x => {
                            return isNaN(x) ? x : Number(x)
                        }
                    )
                        ;
                        for (let j = 0; j < idx.length; j++) {
                            data.push(originalData[idx[j]]);
                        }
                        let countData = countSAX(data, 4);
                        div.innerHTML += d.name + '</n>';
                        drawHeatmap("heatmap-node-" + d.id, data, countData, 4);
                    }
                }
            }
        }
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g")
        .attr('class', 'treeGroup');

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    svgGroup.attr('transform', function(d) {

        // looks good for "static/resources/data/ts_astronomy_sax/astronomy_n4_size1_50.json"  
        // return 'translate(' + 44 + ',-661) scale(' + initScale + ')';

        initScaleSize = 0.20
        // looks good for "static/resources/data/ts_astronomy_sax/astronomy_n4_size1_binary_complete_500.json"
        return 'translate(' + 144 + ',-2133) scale(' + initScaleSize + ')';
    });
    update(root);
    // centerNode(root);

    // set initial scale and position of the tree

});
}