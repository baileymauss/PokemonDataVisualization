// create svg element, set the height and width to 700 px
// add a group <g> element within it and set the
// starting point to the middle (350x350) with the transform/translate
const svg = d3.select("#SvgContainerDiv")
    .append("svg")
    .attr("width", 700)
    .attr("height", 700)
    .append("g")
    .attr("transform", "translate(350,350)");

//add tooltip div
//opacity is set to 0; not seen by default
const tooltip = d3.select("#SvgContainerDiv")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip") // translate all the lines below into the .tooltip class in the css file
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

//function for showing tooltip
//sets opacity to 1, sets text and position depending on the datapoint
const showTooltip = function (event, d) {
    tooltip
        .style("opacity", 1)
        .html("Primary Type: " + names[d.source.index] + "<br>Secondary Type: " + names[d.target.index])
        .style("left", (event.x) / 2 + 300 + "px")
        .style("top", (event.y) / 2 + 500 + "px")

};

//function for re-hiding tooltip
const hideTooltip = function (event, d) {
    tooltip
        .transition()
        .duration(1000)
        .style("opacity", 0)
}

// array of all the labels
const names = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dark", "Dragon", "Steel", "Fairy"];

//array of the hex codes for each type; in same order as above array
const typeColors = ["#A8A77A", "#EE8130", "#6390F0", "#7AC74C", "#F7D02C", "#96D9D6", "#C22E28", "#A33EA1", "#E2BF65", "#A98FF3", "#F95587", "#A6B91A", "#B6A136", "#735797", "#705746", "#6F35FC", "#B7B7CE", "#D685AD"];

// map pokemon types to ordinal number for indexing
var pokemonTypes = {
    "NORMAL": 0,
    "FIRE": 1,
    "WATER": 2,
    "GRASS": 3,
    "ELECTRIC": 4,
    "ICE": 5,
    "FIGHTING": 6,
    "POISON": 7,
    "GROUND": 8,
    "FLYING": 9,
    "PSYCHIC": 10,
    "BUG": 11,
    "ROCK": 12,
    "GHOST": 13,
    "DARK": 14,
    "DRAGON": 15,
    "STEEL": 16,
    "FAIRY": 17
};

let pokemonTypesCount = Object.keys(pokemonTypes).length

// initialize square type array
var typedata = new Array(pokemonTypesCount).fill(0);
for (var i = 0; i < pokemonTypesCount; i++) {
    typedata[i] = new Array(pokemonTypesCount).fill(0);
}

//function for calculating type data
const calcTypeCombo = function (data) {
    var x = pokemonTypes[data[" Type1"]];
    var y = pokemonTypes[data[" Type2"]];
    typedata[x][y]++;
}

//get and convert CSV file
var data = [];
var dualtypesdata = [];

d3.csv("data/pokemon-gen1-data.csv").then(function(data) {
    console.log(data);
    console.log(typeof (data));

    //reduce data to only dual types
    dualtypesdata = data.filter(function (d) { return d[" Type2"] != "none" });
    console.log(dualtypesdata);
    //do foreach here calling method i write
    dualtypesdata.forEach(calcTypeCombo);
    console.log(typedata);

    //now do stuff
    //hand data to d3.chord
    //chord needs square matrix
    const res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (typedata);

    //add groups to inner circle
    var group = svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data(d => d.groups)
        .enter()

    group.append("g")
        .append("path")
        .style("fill", function (d, i) { return typeColors[i] })
        .style("stroke", "black")
        .attr("d", d3.arc()
            .innerRadius(230)
            .outerRadius(240)
        )


    //Add the links between groups
    svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data(d => d)
        .join("path")
        .attr("d", d3.ribbon()
            .radius(220)
        )
        .style("fill", function (d) { return (typeColors[d.source.index]) })
        .style("stroke", "black")
        .on("mouseover", showTooltip)
        .on("mouseleave", hideTooltip)

    //add text labels
    group.append("text")
        .each(function (d) { return d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "text")
        .attr("text-anchor", function (d) { return d.angle > Math.PI ? "end" : "start"; })
        .attr("transform", function (d, i) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + (240 + 10) + ")" +
                (d.angle > Math.PI ? "rotate(180)" : "");
        }) //set text content
        .text(function (d, i) {
            return names[i];
        })
        .style("font-family", "sans-serif")
        .style("font-size", "10px");

});