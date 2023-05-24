// D3 visualization code can be found on Observable: https://observablehq.com/d/823cc41fe7c9b1d3

// I've also copied it below for transparency:
style = html`
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Share+Tech&display=swap">

<style>
  body, svg {
    font-family: 'Share Tech', sans-serif;
  }
</style>
`

wineChart = {
  const root = partition(data); // calls the partion function with the attached data as the input to create the root node of a hierarical partition layout

  // For each node in root, store the original node data in the current property so D3 can interpolate between the current and target states of the nodes during transitions.
  root.each(d => (d.current = d)); // the .each method iterates over the elements below the root

  // Create an svg element using d3.create() method
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, width]) // the value of the view box attribute is a list of four numbers: x starting point (left edge), y starting point (y edge), width, and height. Since this is a circle, we want the width = height.
    .style("font", "1.1rem Share Tech"); // Basic font styling of the svg element

  // create a group <g> element inside the svg with a translation that moves the group to the center of the svg
  const group = svg
    .append("g") // append the <g> element to the svg
    .attr("transform", `translate(${width / 2},${width / 2})`); // the transform.translate() function is used translate (move) the <g> element horizontally and vertically within the svg container

  // Group the <path> elements and apply attributes and behaivors
  const path = group
    .append("g") // group the paths together
    .selectAll("path") // select all path elements (initially there is none) to handle both enter and update selections when we bind the data
    .data(root.descendants().slice(1)) // bind data to selected elements
    .join("path") // appends a new path element for each node and its data
    .attr("fill", d => {
      // assign color of all child nodes of its highest-level ancestor (excluding the root)
      // traverse up the hierachy of nodes starting at the current node ('d') until a node depth = 1 is reached.
      while (d.depth > 1) d = d.parent;
      // once loop is terminated, the highest-level parent is found and color function is invoked with data.name
      return color(d.data.name);
    })
    .attr(
      "fill-opacity", d => 
        // invoke the arcVisible function with the current node. If the function returns True, the arc should be visible. False it should be transparent.
        arcVisible(d.current) ? (d.children ? 0.7 : 0.5) : 0
    )
    // if the node is visible, it should be responsive to mouse clicks, hovers, etc. These are "pointer events"
    .attr("pointer-events", d => (arcVisible(d.current) ? "auto" : "none")) // "auto" = responsive, "none" = disabled

    .attr("d", d => arc(d.current)); // d attribute defines a path to be drawn. Set the d attribute value of the current node by calling the defined arc() function

  path // refers to the path variable
    .filter((d) => d.children) // filter the selection of path elements based on if associated data has children.
    .style("cursor", "pointer") // css style property to change the cursor to point when hovering
    .on("click", clicked); // invoke clicked() event handler function when selected path is clicked

  path.append("title").text(
    // append a title as a child of each path element. This is a tool tip - when the user hovers over the corresponding path element.
     // .text() sets the title based on the data as a parameter
    (d) => `${d
        .ancestors() // returns an array of the ancestors of the current node (including itself)
        .map((d) => d.data.name) // extract the name property from each ancestory
        .reverse() // reverse the order of the ancestory names in array
        .join("/")}\n${format(d.value)}}` // join the ancestory names together with a forward slash as a seperator. After the hierarchical path string, a new line charcter ('\n') seperates the value of the current node, which is formatted with the format function.
  );

  // create a <g> element as a child of 'group' for text labels of the visualization
  const label = group
    .append("g")
    .attr("pointer-events", "none") // disable pointer events
    .attr("text-anchor", "middle") // set relative alignment of text to middle
    .style("user-select", "none") // prevent the user from hightlighting the text
    .selectAll("text") // select all text elements aand bind the data to the decendants of the root (not including root), then join the data with the selected text elements creating <text> elements with the data
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35rem") // the dy attribute indicates a shift along the y-axis on the position of the element
    .attr("fill-opacity", d => +labelVisible(d.current)) // call the labelVisible() function with the current node, which will return a boolean. The boolean determines if the label should be visible.
    // the '+' is a unary operator, converts a string or boolean (in this case) to a numerical value (True = 1, False = 0)
    .attr("transform", d => labelTransform(d.current)) // call the labeTransform() function to calculate the label rotatino needed at the current node
    .text((d) => d.data.name); // set the text to be the name of the node

  const parent = group // create a circle element as the parent node of the visualization - in the center. This circle acts as a sort of "back" button.
    .append("circle") // append new circle element as child of group - the main <g> of the svg
    .datum(root) // bind the root data to the circle element. Instead of data(), use datum() to bind a single data value to a selection of DOM elements.
    .attr("r", radius) // set the value of radius attribute
    .attr("fill", "none") // set the fill to transparent
    .attr("pointer-events", "all") // set the pointer-events to all to enable user to interact with this circle
    .on("click", clicked); //attach a handle event lister to the circle and invoke clicked()

  function clicked(event, p) {
    // event = the event object that triggered the click event
    // p = the node that was clicked (which is now the parent node)
    parent.datum(p.parent || root); // use datum() to bind a single data value to a selection of DOM elements.
    root.each( // iterate over each node in the root
      d => // set the target property of each node ('d') to an object with properties x0, x1, y0, and y1.
        d.target = { // the target property is used to define the target state of the node during a transition.
          // calculate a value based on the position of the current node ('d') within the clicked node ('p')
          // start angle of the arc along the x-axis
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI, // calculate the relative position of the current node 'd' and the clicked node 'p' by subtracting the starting position of the current node by the starting position of the parent node, then dividing that by the width of the parent node. the Math.min(1, ...) ensures this number <= 1. Math.max(0, ...) ensures that the calculated value from math.min is > 0.
          // end angle of the arc along the x-axis
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth), // start angle of the arc along the y-axis
          // p.depth = depth / hierarchy in the data structure relative to root (0)
          //Math.max ensures that this number is never negative
          y1: Math.max(0, d.y1 - p.depth)
        });

  const progress = group.transition().duration(750); // define the main svg group transition by using the transition() method specifying the duration with duration() method

  // transition all arcs and labels (including hidden arcs & labels)

  path.transition(progress) // initiate transition of path group
    // tween() functions smoothly animate properties of an object, such as opacity
    .tween("data", d => {
      // use tween method for the data property of each node, which corresponds to the current and target states of the arc
      // use an interpolator function to calculate the intermediate values between the current and target state
      const intermediateValues = d3.interpolate(d.current, d.target);
      // d.current = current position and dimensions of the arc
      // d.target = desired position and dimensions of arc during transition
      return progress => d.current = intermediateValues(progress); // return anonymous function that is called for each step of the transition
      // progress = interpolation progress between 0 and 1
      // intermediateValues(progress) = calculates the intermediate state of the data based on the current interpolation progress, assigning the result to d.current. This updates the current state of the data for each element, which animates the transition between current and target states.
    }).filter(function (d) {
      // to determine if a path element should be visible or hidden, filter the path elements based on whether the fill-opacity attribute is non-zero or the target arc (d.target) is visible using the arcVisible function.
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      // '+' = unary plus operator to convert the attribute value from a string to a number
      // 'this' = the current DOM element being filtered
      // .getAttribute() = access the value of a specific attribute of the element
      // OR, determine visibility if the target arc should be visible via the arcVisible function
    })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.7 : 0.5) : 0)
            // apply opacity to filtered elements
          .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
        // set pointer events attribute to filtered elements
          .attrTween("d", d => () => arc(d.current)); // update the path to be drawn ('d') of the path elements during transition by calling arc()

  label
    .filter(function (d) {
      // filter label elements based on if they should be visible or not
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    })
    .transition(progress) // initiate transition of label group
    .attr("fill-opacity", d => +labelVisible(d.target)) // set fill opacity of the filtered label elements
    .attrTween("transform", d => () => labelTransform(d.current)); // apply a transitional tranformation to the selected label element based on the state of the data
  // this function will be called for each step of the transition to calculate the intermediate tranformation value
  }

  
  // determine the visibility of the arc based on the properties of the data object, return true or false
  function arcVisible(d) {
    // d.y1 <= 3 checks the ending vertical coordinate of the arc (y1 value).
    // d.y0 >= 1 checks the starting vertical value of the arc is greater than 1.
    // d.x1 > d.x0 checks if the arc hasd a positve width, meaning it's not collapsed
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    // if all true, the arc should be visible. If one or more are false, the arc should be hidden.
  }

  function labelVisible(d) {
    // determine if a label should be visible
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    // calculate the transformation needed to position the label correctly on the arc
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  // manipulate the DOM with the svg element
  return svg.node();
}

  data = FileAttachment("master_wine.json").json() //JSON attached file is a nested tree data structure 

  // a function to create a partition layout with a data parameter
partition = (data) => {
    // transform data into a heirarchy of nodes
    const root = d3
      .hierarchy(data) // create the root of the hierarchy
      .sum((d) => d.value) // calculate the node's value based on value of child nodes
      .sort((a, b) => b.value - a.value); // sort the objects in decending order based on if object b.value - a.value is a positive or negative number
  
    // invoke partition layout function that returns a function that can be invoked with the root hierachy as the parameter
    return d3.partition().size([2 * Math.PI, root.height + 1])(root);
    // set the size of the partition layout (width, height)
       // 2 * Math.PI is a full cirlce
       // Root.height is the depth of the heirarchy (how many levels from the root to the lowest leaf, plus one to ensure that the entire heirarcy is visible within the circular layout.)
    // use the root hierachy to return partioned data ready to be used in visualization
  }

  color = d3.scaleOrdinal( // ordinal scale is used for categorical data, where input values (in this case, names) are mapped to a range of colors 
  // d3.quantize takes an interpolator and number and returns an array of uniformly spaced colors from the given interpolators color range
  d3.quantize(d3.interpolateRgb("#DD7596", "#B7C3F3"), data.children.length + 1))


  // specifically format numbers as integers with comma-seperated thousands to apply consistent formatting to numeric values in visualization 
format = d3.format(",d") 
// ',' = this is a specifier that adds a comma as a thousands seperator to improve readability 
// 'd' = this is a specifier that indicates the number should be formatted as a decimal number

width = 1000

radius = width / 6  

arc = d3
  .arc()
  .startAngle((d) => d.x0) // the start angle method takes a parameter 'd' which represents the data bound to the element and returns the angle value (x.0)
  .endAngle((d) => d.x1) // the end angle method also takes 'd' as a parameter and returns the angle value (x.1)
  .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005)) // set the padding angle between adjacent arcs to avoid them from touching, with a max value of 0.005.
  .innerRadius((d) => d.y0 * radius) // set the inner radius of hte arc based on y0 to determine the distance from the center to the inner edge of the arc
  .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1)) // sets the outer radius of the arc