var hash = window.location.hash;

var COUNT_SCHOOL_DISPLAY = 3;

var centered;

var svg, projection, gmapProjection, path, g, gmap;
var activeId = 'sea',
    choropleth_data, source_data;
var all_data = {}, activeData = "population_total";
var min_population = 100;
var defaultColor = "#aaa";
var chartSvg, labels, anchors, links, label_array = [], anchor_array = [];
var chartMargin = {top: 20, right: 10, bottom: 20, left: 20};
var chartWidth = 268, chartHeight = 150;
var w = chartWidth - chartMargin.left - chartMargin.right;
var h = chartHeight - chartMargin.top - chartMargin.bottom;
var scale = d3.scale.linear().domain([0, 1]).range([h, 0]);
var ord_scale = d3.scale.ordinal().domain(["Under 18", "Over 18"]).range([0, w]);
var color = d3.scale.category20();
var dotRadius = 4;
var neighborhoods;
var fixed_color_palette = [ "#FEC201", "#FFE65E", "#9CE3BF", "#47BD94", "#19858E"];
function choro_color() {return fixed_color_palette[0]};

var currentMetric = null;
var highlightedNeighborhood = null;
var geom_granularity = null;
var bg_map, raw_bg_map, raw_ct_map, raw_nb_map, raw_bg_data, raw_ct_data, raw_nb_data, raw_jenks;

var col_data = [];
var data_prct = [];
var fields_format = {};

// default style for city-scale map
var gmap_style=[
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.natural",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f6f4f3" }
    ]
  },{
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#cfddff" }
    ]
  },{
     "featureType": "administrative",
     "elementType": "labels",
     "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
];

// intermediate display style, with neighborhood labels
var gmap_style_neighborhood=[
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape.natural",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f6f4f3" }
    ]
  },{
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#cfddff" }
    ]
  },{
     "featureType": "administrative",
     "elementType": "labels",
     "stylers": [
      { "visibility": "on" },
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#000000" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
];


// tweak for zoom-in display
var gmap_style_zoom = [
  {
    "featureType": 'poi.park',
    "elementType": 'geometry.fill',
    "stylers": [
      {"visibility": 'on'},
      {"color": "#8DB890"}
    ]
  },
  {
    "featureType": 'poi.business',
    "elementType": 'geometry.fill',
    "stylers": [
      {"visibility": 'on'},
      {"color": "#8DB890"}
    ]
  },
  {
    "featureType": 'poi.medical',
    "elementType": 'geometry.fill',
    "stylers": [
      {"visibility": 'on'},
      {"color": "#6088BB"}
    ]
  },
  {
    "featureType": "poi.school",
    "elementType": 'geometry.fill',
    "stylers": [
      {"color": "#A64452"},
      {"visibility": "on"}
    ]
  },
  {
    "featureType": 'transit.line',
    "elementType": 'geometry',
    "stylers": [{"color": '#000000'}]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry',
    'stylers': [
      {'visibility': 'on'},
      {'color': '#FED89D'}
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "landscape.man_made",
    'elementType': 'geometry.stroke',
    "stylers": [
      { "visibility": "on" },
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#cfddff" }
    ]
  },{
     "featureType": "administrative",
     "elementType": "labels",
     "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
]


var browserSupportsTouch = 'ontouchstart' in document.documentElement;

$(document).ready(function() {
  init();
}); // end document ready function

function init(){
  resizeContainer($("#content").parent().width());
  drawChoropleth();
  //drawChart();

  // set geom granularity to neighborhoods
  geom_granularity = 'geom_nb';

  //====EVENT LISTENERS===//

  // slide out menu
  $(".menu-toggle").on("click", toggleMenu);

  // narrative
  $("#narrative-row button").click(function() {
    if($(this).hasClass('active'))
      $(this).removeClass('active'); //change with .activatebutton
    else
      $("button.active").removeClass("active");
      $(this).addClass('active');
  });

  $("#narrative a.close-box").click(function (event) {
    event.preventDefault();
    removeNarrative();
  });

  $('#narrative-row button').on('click', function(){
    $( "#narrative" ).fadeIn(400);
    $('#narrative div.panel-body').hide();
    $('#' + $(this).data('rel')).show();
    $('#nav-panel #' + $(this).attr('data-filter')).trigger('click');
  });

  $(window).resize(function(){
    resizeContainer($("#content").parent().width());
  });

  $('#geom_nb').parent().click(function () {
	  geom_granularity = 'geom_nb';
	  changeNeighborhoodGranularity(geom_granularity, raw_nb_map);
  });
  $('#geom_tract').parent().click(function () {
	  geom_granularity = 'geom_tract';
	  changeNeighborhoodGranularity(geom_granularity, raw_ct_map);
  });
  $('#geom_bg').parent().click(function () {
	  geom_granularity = 'geom_bg';
	  changeNeighborhoodGranularity(geom_granularity, raw_bg_map);
  });
}
function resizeContainer(width){
  var new_height = $(window).width() < 797 ? Math.max($("#content").parent().width() * 0.75, 320) : 600;
  $("#content").css({"width":width,"height":new_height});
  $("#nav-panel").css({"height": new_height});
}
function transform(d) {
    d = new google.maps.LatLng(d.value[1], d.value[0]);
    d = projection.fromLatLngToDivPixel(d);
    return d3.select(this)
        .style("left", (d.x - 2) + "px")
        .style("top", (d.y - 2) + "px");
}

function calculatePrct(col_data) {
  Object.keys(col_data).forEach(function(col) {
    var colMax = Math.max.apply(Math, col_data[col].filter(function(v) { return !!v; }));
    data_prct[col] = [];
    col_data[col].forEach(function(val) {
      data_prct[col].push(val / colMax);
    });
  });
}

function drawChoropleth(){

  queue()
    //.defer(d3.csv, "data/fields_trial.csv")
    .defer(d3.csv, "data/fields_SEM.csv")

    .defer(d3.json, "data/cityBG_simp20_trial.geojson")
    .defer(d3.json, "data/cityCT_simp20_export.geojson")
    .defer(d3.json, "data/NBH_simp60.geojson")

    //.defer(d3.csv, "data/scripts/outputs/acs_blockgroup_data.csv")
    .defer(d3.csv, "data/BG_SEM.csv")
    //.defer(d3.csv, "data/scripts/outputs/acs_blockgroup_data_tract.csv")
    //.defer(d3.csv, "data/scripts/outputs/acs_blockgroup_data_neighborhood.csv")
    .defer(d3.csv, "data/tract_SEM.csv")
    .defer(d3.csv, "data/NBH_SEM.csv")

    .defer(d3.csv, "data/source_SEM.csv")
    .await(setUpChoropleth);

  function setUpChoropleth(error, fields, bg_map, ct_map, nb_map, bg_data, ct_data, nb_data, source) {
    populateNavPanel(fields);

	fields_format = fields;

	fields.forEach(function(d) {
	  console.log("field:"+d.id+",  legend_format:"+d.legend_format+",  reverse:"+d.reverse);
	  fields_format[d.id] = [d.legend_format, d.reverse];
	});

    //clean choropleth data for display.
    raw_bg_map = bg_map;
    raw_ct_map = ct_map;
    raw_nb_map = nb_map;
    raw_bg_data = bg_data;
    raw_ct_data = ct_data;
    raw_nb_data = nb_data;
    choropleth_data = {};
    source_data = source;
	choropleth_data['geom_bg'] = bg_data;
	choropleth_data['geom_tract'] = ct_data;
	choropleth_data['geom_nb'] = nb_data;

    bg_data.forEach(function(d) {
      all_data[d.block_group] = d; //used for colour
      choropleth_data['geom_bg'][d.block_group] = +d.population_total;
	    Object.keys(d).forEach(function(e) {
		      if (!(e in col_data)) {
			         col_data[e] = [];
		           }
		  col_data[e].push(parseFloat(d[e]));
	   });
    });
    ct_data.forEach(function(d) {
      all_data[d.tract] = d; //used for colour
      choropleth_data['geom_tract'][d.tract] = +d.population_total;
	    Object.keys(d).forEach(function(e) {
		      if (!(e in col_data)) {
			         col_data[e] = [];
		           }
		  col_data[e].push(parseFloat(d[e]));
	   });
    });
    nb_data.forEach(function(d) {
	  d["NBH_NAMES"] = d.neighborhood;
      all_data[d.neighborhood] = d; //used for colour
      choropleth_data['geom_nb'][d.neighborhood] = +d.population_total;
	    Object.keys(d).forEach(function(e) {
		      if (!(e in col_data)) {
			         col_data[e] = [];
		           }
		  col_data[e].push(parseFloat(d[e]));
	   });
    });

    calculatePrct(col_data);

    all_data.sea = {
      NBH_NAMES: "Seattle, WA",
      population_total: 657330,
      median_household_income: 75133,
      household_total: 298477,
      children_in_poverty_perc: 0.266
    };

    displayPopBox();

    gmap = new google.maps.Map(d3.select("#content").node(), {
      zoom: 12, //12
      minZoom: 10, //10
      maxZoom: 22, // used to be 14
      center: new google.maps.LatLng(47.61, -122.330422), //center coors
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      panControl: false,
      scrollwheel: false,
      mapTypeControl: false,
      styles: gmap_style,
      //styles: gmap_style_zoom,
      draggable: !browserSupportsTouch,
      zoomControl: !browserSupportsTouch,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    });

    if (browserSupportsTouch) {
      $('#zoom-box').prop('checked', false);
    }

    $('#zoom-box').change(function () {
      var checked = ($(this).prop('checked'));
      gmap.setOptions({
        draggable: checked,
        zoomControl: checked
      });
    });

    // var dcBounds = new google.maps.LatLngBounds(
    //   new google.maps.LatLng(38.791,-77.12),
    //   new google.maps.LatLng(38.996,-76.909)
    // );

    // Using this hack-y solution as fitBounds frequently produces maps that are too small.

    var containerHeight = $("#content-wrapper").height();

    gmap.setZoom(
      containerHeight < 250 ? 10 : //250
      containerHeight < 620 ? 11 : 12 //520
    );

    var maxBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(46.5,-123.6), //min coords
      new google.maps.LatLng(49.7,-121.0) //max coords
    );

    // If a drag ends outside of our max bounds, bounce back to the default center.
    google.maps.event.addListener(gmap, "dragend", function() {
      if (maxBounds.contains(gmap.getCenter())) { return; }

     var c = gmap.getCenter(),
         x = c.lng(),
         y = c.lat(),
         maxX = maxBounds.getNorthEast().lng(),
         maxY = maxBounds.getNorthEast().lat(),
         minX = maxBounds.getSouthWest().lng(),
         minY = maxBounds.getSouthWest().lat();

     if (x < minX) x = minX;
     if (x > maxX) x = maxX;
     if (y < minY) y = minY;
     if (y > maxY) y = maxY;

     gmap.panTo(new google.maps.LatLng(y, x));

    });

    var overlay = new google.maps.OverlayView();
    svg = d3.select("#content").append("svg:svg");

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {

      var layer = d3.select(this.getPanes().overlayLayer)
      .attr("id","overlay")
      .append("div")
      .attr("id","theDiv");

      var svg = layer.append("svg")
      .attr("id","theSVGLayer");

      g = svg.append("g");
      neighborhoods = g.append("g").attr("id", "neighborhoods");
      g.append("g").attr("id", "points");
      d3.select("#legend-container").append("svg")
          .attr("height", 170)
		  .attr("width", 170)
        .append("g")
          .attr("id", "legend");
	  d3.select("#legend-container").append("p")
		  .attr("id", "legend-comments");

	  $("#legend-comments").text("Missing data shown as grey");

      overlay.draw = function() {
        var data_values = _.filter(_.map(choropleth_data, function(d){ return parseFloat(d[currentMetric]); }), function(d){ return !isNaN(d); });

        var projection = this.getProjection(),
        padding = 10;

        gmapProjection = function (coordinates) {
          var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
          var pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
          return [pixelCoordinates.x+4000, pixelCoordinates.y+4000];
        };

        path = d3.geo.path().projection(gmapProjection);

        if (geom_granularity == null || geom_granularity == "geom_nb") {
          changeNeighborhoodGranularity(geom_granularity, raw_nb_map);
        } else if (geom_granularity == "geom_tract") {
          changeNeighborhoodGranularity(geom_granularity, raw_ct_map);
        } else {
          changeNeighborhoodGranularity(geom_granularity, raw_bg_map);
        }

      };
    };

    // Bind our overlay to the map…
    overlay.setMap(gmap);

  } // setUpChoropleth function

} // drawChoropleth function

function changeNeighborhoodGranularity(data_name, gran_map) {
	console.log("Changing granularity to :" + data_name);
	// Have to remove all the paths and readd them otherwise the visualization was highlighting the old path
	// and the new path when zooming.

	neighborhoods.selectAll("path").remove();
	neighborhoods.selectAll("path")
    //trial
    //.data(building_map.features)

	  .data(gran_map.features)
	  .enter().append("path")
	  .attr("d", path)
	  .attr("id", function (d) { return "path" + d.properties.NCID; })
	  .attr("class", "nbhd")
	  .on("mouseover", hoverNeighborhood)
	  .on("mouseout", function () {
		if ($("path.active").length === 0) {
		  activeId = 'sea';
		  $("#visualized-measure").text("");
		  displayPopBox();
		}
	  })
	  .on("click", function(d) { highlightNeigborhood(d, false); })

    .on("dblclick", function(d) {zoomtoNeighborhood(d,false); })

	  .style("fill",function(d) {
		if (currentMetric === null || all_data[d.properties.gis_id][currentMetric] === '0') { return defaultColor; }
		else { return choro_color(all_data[d.properties.gis_id][currentMetric]); }
	  })
	  .style("fill-opacity",0.1); // grey layer when no dataset is chosen

	g.select("#points").selectAll(".poi").remove();

	changeNeighborhoodData(currentMetric, data_name);

	//if there is a highlighted neighborhood then rehighlightit.
	if(highlightedNeighborhood) {
	  highlightNeigborhood(highlightedNeighborhood, true);
	}

	redrawPoints();

	if (hash) { $('a' + hash).click(); }
}

function populateNavPanel(data) {
  var fieldTemplate = _.template(
        '<li><a id="<%= field.id %>" href="#">&emsp;<%- field.name %> <% if (field.new === "TRUE") { %><span class="label label-danger">New</span></a><% } %></li>',
        { variable: 'field' }
      ),
      categoryTemplate = _.template('<li class="nav-header disabled"><a><%=category%></a></li>', {variable: 'category'});

  _.chain(data).groupBy('type').each(function (fields, type) {
    var $menu = $('.' + type + '-menu');

    $menu.empty();

    if (type === 'neighborhood') {
      _.chain(fields).groupBy('category').each(function (fields, category) {
        $menu.append(categoryTemplate(category));
        _.forEach(fields, function (field) {
          $menu.append(fieldTemplate(field));
        });
      });
    } else {
      _.forEach(fields, function (field) {
        $menu.append(fieldTemplate(field));
      });
    }
  });

  $(".layer-toggle-menu > li").on("click", "a", function(e){
    e.preventDefault();
    if (!$(this).parent().hasClass('disabled')){
      currentMetric=(typeof $(this).attr("id")==="undefined")?null:$(this).attr("id");
      getSource(source_data,currentMetric);
      changeNeighborhoodData(currentMetric, geom_granularity);
      $(this).parent().addClass("selected").siblings().removeClass("selected");
      $("#legend-panel").show();
      $("#details p.lead").show();
    }
  });

  // school points
  $(".schools-menu > li").on("click", "a", function(e){
    e.preventDefault();

    var $$parent = $(this).parent();
    if ($$parent.hasClass("selected")) {
      removePoints($(this).attr("id"));
    } else {
      drawPoints($(this).attr("id"));
    }
    $$parent.toggleClass("selected");

  });

  // other points
  $(".poi-menu > li").on("click", "a", function(e){
    e.preventDefault();

    var $$parent = $(this).parent();
    if ($$parent.hasClass("selected")) {
      removePoints($(this).attr("id"));
    } else {
      $$parent.siblings().each(function () {
        removePoints($(this).removeClass("selected")
          .children("a").attr("id"));
      });
      drawPoints($(this).attr("id"));
    }
    $$parent.toggleClass("selected");
  });
}

function changeNeighborhoodData(new_data_column, granularity) {
  console.log("changing neighborhood data:"+new_data_column+", "+granularity);

  if (gmap.getZoom() >= 13) {
    neighborhoods.selectAll("path").style("fill-opacity",0.3);
    gmap.setOptions({styles: gmap_style_zoom});
  } else if (gmap.getZoom() == 12) {
    neighborhoods.selectAll("path").style("fill-opacity",0.8);
    gmap.setOptions({styles: gmap_style_neighborhood});
  } else if (gmap.getZoom() <= 11) {
    neighborhoods.selectAll("path").style("fill-opacity",0.8);
    gmap.setOptions({styles: gmap_style});
  }

  if (new_data_column == null) {
    neighborhoods.selectAll("path").style("fill-opacity",0.1);
    return;
  }
  var data_values = _.filter(_.map(choropleth_data[granularity], function(d){ return parseFloat(d[new_data_column]); }), function(d){ return !isNaN(d); });
  var jenks = _.filter(_.unique(ss.jenks(data_values, Math.min(5, data_values.length))), function(d){ return !isNaN(d); });
  raw_jenks = jenks;

  //var color_palette = [ "#9ae3ff", "#45ccff", "#00adef", "#00709a", "#003245"];

  // trim lighter colours from palette (if necessary)
  color_palette = fields_format[new_data_column][1] == 'y' ?
  	fixed_color_palette.slice(6 - jenks.length).reverse() : fixed_color_palette.slice(6 - jenks.length);


  activeData = new_data_column;
  choro_color = d3.scale.threshold()
    .domain(jenks.slice(1,-1))
    .range(color_palette);
  choropleth_data[granularity].forEach(function(d) {
	  if (granularity == 'geom_nb') {
		  choropleth_data[granularity][d.neighborhood] = +d[new_data_column];
	  } else if (granularity == 'geom_bg') {
		  choropleth_data[granularity][d.block_group] = +d[new_data_column];
	  } else if (granularity == 'geom_tract') {
		  choropleth_data[granularity][d.tract] = +d[new_data_column];
	  }
  });

  g.select("#neighborhoods").selectAll("path")
    .transition().duration(600)
    .style("fill", function(d) {
      if(typeof all_data[d.properties.gis_id] ==="undefined" ||
        all_data[d.properties.gis_id].population_total < min_population ||
        !all_data[d.properties.gis_id][new_data_column]){
        return defaultColor;
      } else {
        return choro_color(all_data[d.properties.gis_id][new_data_column]);
      }
    })

  if(new_data_column !== "no_neighborhood_data") {
    setVisMetric(new_data_column, all_data[activeId][new_data_column]);
  } else {
    setVisMetric(null, null, true);
    removePoints("clear");
    $(".selected").removeClass("selected");
    $("#details p.lead").hide();
    $("#legend-panel").hide();
  }

  var zeroElement = jenks[0] === 0 && jenks[1] === 1;

  var previousElement = function(n, a){
    return _.max(_.filter(a, function(d){ return d < n; } ));
  };

  var legendText = function(d, i, jenks){
    if(d == _.min(jenks)) {
      if (zeroElement) { return "0"; }
      return "Less than " + legendNumber(d);
    } else if(d > _.max(jenks)){
      if (jenks.length === 0) { return "0 and above"; }
      return legendNumber(_.max(jenks)) + " and above";
    } else {
      return legendNumber(previousElement(d, jenks)) + " to " + legendNumber(d);
    }
  };

  drawChart(new_data_column, activeId); //used to be in below function

  var legendNumber = function(d) {
	var num = parseFloat(d);
	switch(fields_format[new_data_column][0]) {
      case "perc":
        return d3.format(".0%")(num);
      case "val":
        return d3.format(",.2r")(num);
      case "curr":
        return d3.format("$,.0f")(num);
      case "minutes":
        return d3.format(",.0f")(num);
	  default:
	  	return d3.format(",.2r")(num);
	}
  };

  var updatedLegend = d3.select("#legend").selectAll(".legend")
      .data(jenks.slice(1).reverse());

  enterLegend = updatedLegend.enter().append("g")
    .attr("transform", function(d, i){ return "translate(0," + (i * 35) + ")"; })
    .attr("class", "legend");

  enterLegend.append("rect")
    .attr("width", 170)
    .attr("height", 30)
    .style("opacity", "0.75");

  enterLegend.append("text")
    .style("fill", "black")
    .attr("dy",20)
    .attr("dx", 85)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle");

  updatedLegend.select("text")
    .text(function(d, i){ return legendText(d, i, jenks.slice(1,-1));});

  updatedLegend.select("rect")
    .style("fill", function(d, i) {
	  console.log("d="+d+", i="+i);
      if (zeroElement && jenks.length - i === 2) { return defaultColor; };
      return color_palette[color_palette.length - i - 1];
    });

  updatedLegend.exit().remove();

}

function redrawPoints() {
  $('.points-menu').children('li.selected').each(function () {
    drawPoints($(this).children('a').attr('id'));
  });
}

function drawPoints(type) {
  if (!type || type === "clear") { return; }

  var isSchool = type === "seattle_ps_elem" || type === "seattle_ps_ms" || type === "seattle_ps_high",
      packer = sm.packer(),
      color;

  d3.csv('data/' + type + '.csv', function (data) {
    var poi = g.select("#points").selectAll(".poi").data(data, function(d) {
      return d.name;
    });

    //make middle school a square, add different shape for high school
    //why doesnt the legend match?
    if (type === "seattle_ps_ms") {
      poi.enter().append("circle")
        .attr("class", "poi " + type + (isSchool ? " school" : ""))
        .attr("r", 4)
        .attr("transform", function(d) {
          return "translate(" + gmapProjection([d.long, d.lat]) + ")";})
        .append("title").text(function(d){return d.name;});
    } else {
      poi.enter().append("circle")
        .attr("class", "poi " + type + (isSchool ? " school" : ""))
        .attr("r", 4)
        .attr("transform", function(d) {
          return "translate(" + gmapProjection([d.long, d.lat]) + ")";})
        .append("title").text(function(d){return d.name;});
    }

    if (isSchool) { poi.on("click", displayPointsData); }
    packMetros();


    function displayPointsData(school) {
      var $schools = $("#schools_panel");
      var $panelBody = $schools.find(".panel-body");
      var $schoolData = $panelBody.children(".school-data");

      //Don"t add the school twice.
      for (var i = 0, len = $schoolData.length; i < len; i++) {
          if(school.name === $($schoolData[i]).find(".school-name").text()) { return; }
      }

      //Show panel on first school click.
      if ($schools.hasClass("hide")) {
        $("#btnPanelClose").on("click", closePanel);
        $schools.toggleClass("hide");
      }

      //Limit number of displayed schools.
      if ($schoolData.length === COUNT_SCHOOL_DISPLAY) {
        $panelBody.children(":nth-child(" + COUNT_SCHOOL_DISPLAY + ")").remove();
      }

      //Add a new school to the display.
      var $schoolDisplay = $panelBody.find("#school_data").clone();
      $panelBody.prepend(buildNewSchool($schoolDisplay, school));
    }

    function buildNewSchool($schoolDisplay, school) {
      $schoolDisplay.removeAttr("id").removeAttr("class").addClass("school-data");

      var $schoolName = $schoolDisplay.find(".school-name");
      $schoolName.html(school.name);
      $schoolName.on("click", function() {
        $schoolDisplay.remove();
        setPanel();
      });
      $schoolDisplay.find(".school-enrollment").html(getDisplayValue(school.enroll_val, "enroll_val", "val"));
      $schoolDisplay.find(".school-spert").html(getDisplayValue(school.s_per_t, "s_per_t", "val"));
      $schoolDisplay.find(".school-attendance").html(getDisplayValue(school.isa_perc, "isa_perc", "perc"));
      $schoolDisplay.find(".school-math").html(getDisplayValue(school.math_perc, "math_perc", "perc"));
      $schoolDisplay.find(".school-reading").html(getDisplayValue(school.reading_perc, "reading_perc", "perc"));
      $schoolDisplay.find(".school-grad").html(getDisplayValue(school.grad_perc, "grad_perc", "perc"));
      $schoolDisplay.find(".school-stusat").html(getDisplayValue(school.stu_sat, "stu_sat", "perc"));
      $schoolDisplay.find(".school-famsat").html(getDisplayValue(school.fam_sat, "fam_sat", "perc"));
      $schoolDisplay.find(".school-redlunch").html(getDisplayValue(school.red_lunch, "red_lunch", "perc"));
      return $schoolDisplay;
    }

    // Close button click handler.
    function closePanel(event) {
      event.preventDefault();
      $("#btnPanelClose").off("click", closePanel);
      $(".school-data").remove();
      $("#schools_panel").addClass("hide");
    }

    function setPanel() {
      var $schools = $("#schools_panel");
      var $panelBody = $schools.find(".panel-body");
      if ($panelBody.children(".school-data").length === 0) {
        $schools.addClass("hide");
      }
    }
  });

  function packMetros() {
    var elements = d3.selectAll("#points .poi")[0];
    packer.elements(elements).start();
  }
}

function removePoints(type) {
  if (type == "clear") {
    g.select("#points").selectAll(".poi").remove();
  } else {
    g.select("#points").selectAll(".poi." + type).remove();
  }
}

var tmp_bins, tmp_x, tmp_y, tmp_bar;

function drawChart(data_column, activeId){
  d3.select(".chart").select("svg").remove();
  chartSvg = d3.select(".chart").append("svg").attr("width",chartWidth).attr("height",chartHeight)
    .append("g")
    .attr("transform","translate(" + chartMargin.left + "," + chartMargin.top + ")");

    //data in here
    var point_orig = data_prct[Math.floor(Math.random()*data_prct.length)];
    //console.log(point_orig);
    var point = Math.round(point_orig*20)/20;
    //console.log(point);
    if(point_orig > point) {
      point += .05;
    }

    var formatCount = d3.format(",.0f");

    var x = d3.scale.linear()
        .domain([d3.min(col_data[data_column]), d3.max(col_data[data_column])])
        .rangeRound([0, w]);
    tmp_x = x;

    var bins = d3.layout.histogram()
        .bins(50)
        (col_data[data_column]);
    tmp_bins = bins;

    var y = d3.scale.linear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([0, h]);
    tmp_y = y;

    var bar = chartSvg.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + (h - y(d.y)) + ")"; });
    tmp_bar = bar;

    bar.append("rect")
        .attr("y", 0)
        .attr("x", 1)
        .attr("width", 5) //hard-coded in the width of each bar
        .attr("height", function(d) { return(y(d.y)); })
        .attr("fill", function(d){
          if (activeId == "sea") {
            return "lightgrey";
          } else if (d.x <= all_data[activeId][data_column] && (d.x + d.dx) > all_data[activeId][data_column]) {
            return choro_color(d.x);
          } else {
            return "lightgrey";
          }
        });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", function(d) {
          if (d.x <= all_data[activeId][data_column] && (d.x + d.dx) > all_data[activeId][data_column]) {
            return -15;
          } else { return 1000; }
        })
        .attr("x", x(bins[0].x + bins[0].dx/2))
        .attr("font-size", "7px")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text(function(d) { return formatCount(d.length); });

    chartSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(d3.svg.axis().scale(x).ticks(5).orient("bottom"));
}

function toggleMenu() {
  var $this = $(".menu-toggle");
  if ($this.parent().hasClass("toggled")){
	  $("#" + geom_granularity).parent().removeClass("active");
      $this.parent().animate({ "left" : 0 }, 350, function(){ $("#main-container").removeClass("toggled"); });
  } else {
	$this.parent().animate({ "left" : $("#nav-panel").width() }, 350, function(){ $("#main-container").addClass("toggled"); $("#" + geom_granularity).parent().addClass("active");});
	removeNarrative();
  }
}

function displayPopBox(d) {
  //clear the menu if it"s exposed.
  if($("#main-container")[0].classList.contains("toggled")) {
    toggleMenu();
  }

  var $popbox = $("#pop-info"),
      highlighted = d ? all_data[d.properties.gis_id] : all_data.sea;

  d3.select(".neighborhood").html(highlighted.NBH_NAMES);

  var val, key, typeDef;
  $.each($popbox.find("tr"), function(k, row){
    key = $(row).attr("data-type");
    val = highlighted[key];
    typeDef = key.slice(key.lastIndexOf("_") + 1);
    $(row).find(".count").html(getDisplayValue(val, key, typeDef));
  });
}

//zooming
function zoomtoNeighborhood (d, isOverlayDraw) {
  console.log("zooming");

  var polyBounds = new google.maps.Polygon({
  paths: formatLatLng(d.geometry.coordinates[0])
  }).getBounds();
  gmap.fitBounds(polyBounds);

  //gmap.setZoom(gmap.getZoom() - 1);
}


function highlightNeigborhood(d, isOverlayDraw) {
  console.log("highlighting");

  removeNarrative();
  highlightedNeighborhood = d;
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = $('#content').width() / 2;
    y = $('#content').height() / 2;
    k = 1;
    centered = null;
  }

  // if this is being called from the overlay.draw handler then
  // select the centered neighborhood and bring it to the front.
  if(!isOverlayDraw) {
    g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

    // if d is a neighborhood boundary and clicked
    if (d && all_data[d.properties.gis_id]){
      displayPopBox(d);
      //last neighborhood to display in popBox.
      activeId = d.properties.gis_id;
      setVisMetric(activeData, all_data[activeId][activeData]);
      drawChart(activeData, activeId);
    }
  } else {
    g.selectAll("#path" + highlightedNeighborhood.properties.NCID).classed("active", true);
    bringNeighborhoodToFront();
  }
}

function bringNeighborhoodToFront() {
  if (centered) {
      var activeNeighborhood = d3.select(".active");
      activeNeighborhood.each(function () {
        this.parentNode.appendChild(this);
      });
      return;
    }
}

function hoverNeighborhood(d) {
  // keep active path as the displayed path.
  if($("path.active").length > 0) {
    // keep centered neighborhood path up front
    bringNeighborhoodToFront();
    return;
  }

  //bring hovered neighborhood path to front.
  var neighborhood = d3.select(d3.event.target);
  neighborhood.each(function () {
    this.parentNode.appendChild(this);
  });

  //but also keep centered neighborhood path up front
  bringNeighborhoodToFront();

  if (d && all_data[d.properties.gis_id]){
    displayPopBox(d);
    //last neighborhood to display in popBox.
    activeId = d.properties.gis_id;

    if (activeData !== "no_neighborhood_data") {
      setVisMetric(activeData, all_data[activeId][activeData]);
      drawChart(activeData, activeId);
    } else {
      setVisMetric(null, null, true);
    }

  }
}


//strNum = The Value for the metric.
//name = The Display Name.
//typeDef = The type of value (perc = percentage, val = a number, cur = a dollar amount)
function getDisplayValue(strNum, name, typeDef) {
  var num = parseFloat(strNum);

  if (!(name in fields_format)) {
	  return d3.format(",")(num);
  }

  switch(fields_format[name][0]) {
	case "perc":
	  return d3.format(".1%")(num);
	case "val":
	  return d3.format(",")(num);
	case "curr":
	  return d3.format("$,.2f")(num);
	case "minutes":
	  return d3.format(",.1f")(num);
	default:
	  return d3.format(",")(num);
  }
}

function setVisMetric(metric, val, clear) {
  var $metric = $("#visualized-metric");
  var $metricDesc = $("#visualized-measure");

  if (clear) {
    $metric.text("");
    $metricDesc.text("");
    return;
  }

  var $metricType = $("a#" + metric);
  if($metricType.length > 0) {
    var metricText = $metricType.text();
    var typeDef = $metricType[0].id;
    typeDef = typeDef.slice(typeDef.lastIndexOf("_") + 1);
    $metric.text(metricText);
    var newDesc = activeId === 'sea' ? '' : val === "" ? "N/A" : getDisplayValue(val, metricText, typeDef);
    $metricDesc.text(newDesc);
  }
}

function formatLatLng(coords){
  var gcoords = [];
  $.each(coords, function(i, ll){
    gcoords.push(new google.maps.LatLng(ll[1], ll[0]));
  });
  return gcoords;
}
// getBounds for polyline and polygon doesn"t exist in v3
// this adds method.
if (!google.maps.Polyline.prototype.getBounds){
  google.maps.Polyline.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    this.getPath().forEach( function(latlng) { bounds.extend(latlng); } );
    return bounds;
  };
}

if (!google.maps.Polygon.prototype.getBounds) {
  google.maps.Polygon.prototype.getBounds=function(){
      var bounds = new google.maps.LatLngBounds();
      this.getPath().forEach(function(element,index){bounds.extend(element); });
      return bounds;
  };
}

function getSource(data, layerID){
  if(layerID == "no_neighborhood_data"){
    d3.select("#source-title").text("").attr("href",null);
  }
  data.forEach(function(d){
    if(d.layer == layerID){
      d3.select("#source-title")
        .text(d.source)
        .attr("href",d.url);
      $("#source").show();
      return false;
    }
  });
}

function removeNarrative() {
  $( "#narrative" ).fadeOut(400);
  $( "#narrative-row button" ).removeClass('active');
}
