// ==UserScript==
// @name        artifactory-local-repo-stats
// @namespace   com.harmonic.userscript.artifactory
// @include     http://hsj-ivy/artifactory/local-ivy/*
// @require     http://code.jquery.com/jquery-1.11.1.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/jquery.jqplot.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.pieRenderer.min.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.barRenderer.min.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.categoryAxisRenderer.min.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.canvasTextRenderer.min.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js
// @require     http://pure-river-7622.herokuapp.com/jqplot/plugins/jqplot.logAxisRenderer.js
// @version     1
// @grant       none
// ==/UserScript==

console.log(unsafeWindow.jQuery);
var $ = unsafeWindow.jQuery;
$(document) .ready(function () {
  $('head') .append('<link rel="stylesheet" href="' + 'http://pure-river-7622.herokuapp.com/jqplot/jquery.jqplot.css' + '" type="text/css" />');
  $('body') .append('<div id="chartdiv" style="height:1000px">');
  var allStats = [
  ];
  $('a') .each(function (index, obj) {
    var url = obj.href;
    var urlsplit = url.split('/');
    if (obj.text === '../')
    {
      return ;
    }
    var path = url.split('/') .slice(4, url.split('/') .length - 1) .join('/');
    console.log(path);
    //http://hsj-ivy/artifactory/api/plugins/execute/repoPathStats?params=repoPaths=local-ivy/harmonic
    var queryUrl = window.location.origin;
    queryUrl += '/artifactory/api/plugins/execute/repoPathStats?params=repoPaths=' + path;
    //console.log(queryUrl);
    $.ajax({
      url: queryUrl,
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa('admin:password'));
      }
    }) .done(function (data) {
      var art = JSON.parse(data);
      art.stats.forEach(function (it) {
        var folderName = it.repoPath.split('/') [it.repoPath.split('/') .length - 1];
        var jsonStats = [
          it.size,
          folderName
        ];
        allStats.push(jsonStats);
      });
    });
  });
  $(document) .ajaxStop(function () {
    $('#chartdiv') .height(200 + allStats.length * 20);
    console.log($('#chartdiv') .height());
    console.log('done: ' + allStats.length);
    console.log(JSON.stringify(allStats));
    $.jqplot.config.enablePlugins = true;
    $('#chartdiv') .jqplot([allStats], {
      title: 'Artifactory (' + window.location.host + ') storage usage',
      seriesDefaults: {
        renderer: $.jqplot.BarRenderer,
        rendererOptions: {
          // Set the varyBarColor option to true to use different colors for each bar.
          // The default series colors are used.
          varyBarColor: true,
          highlightMouseOver: true,
          barDirection: 'horizontal',
          barWidth: 10
        }
      },
      axes: {
        xaxis: {
          label : 'Bytes used',
          //renderer: $.jqplot.LogAxisRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            angle: - 45
          }
        },
        yaxis: {
          renderer: $.jqplot.CategoryAxisRenderer,
          rendererOptions: {
            tickInset: 0,
            sortMergedLabels: true
          },
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            angle: 0
          }
        }
      }
    });
    /*
    $.jqplot.config.enablePlugins = true;
    //console.dir($.jqplot);
    $.jqplot('chartdiv',[allStats],
            {
              seriesDefaults: {
              // Make this a pie chart.
              renderer: jQuery.jqplot.PieRenderer,
              rendererOptions: {
                // Put data labels on the pie slices.
                // By default, labels show the percentage of the slice.
                showDataLabels: true
                }
              },
              legend: { show:true, location: 'e' }
              
            });
    */
    console.log('done');
  });
});
