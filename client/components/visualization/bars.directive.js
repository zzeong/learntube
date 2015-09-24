'use strict';

angular.module('learntubeApp')
.directive('d3Bars', function($window, $timeout, d3Service) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
    },
    link: function(scope, ele) {
      d3Service.d3().then(function(d3) {
        var isInitialized = false;
        var margin = { top: 20, right: 10, bottom: 45, left: 25 };

        $window.onresize = function() { scope.$apply(); };

        scope.$watch('data', function(newData) {
          if(!newData) { return; }

          var data = newData.sort(function(a, b) { return a.date - b.date; });
          if(!isInitialized) {
            scope.init(data);
            return;
          }
          scope.update(data);
        });

        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          if(!isInitialized) { return; }
          scope.resize();
        });


        var width, height, x, y, xAxis, yAxis, chart;
        var svg = d3.select(ele[0]).append('svg');

        scope.init = function(data) {
          width = ele[0].offsetWidth - margin.left - margin.right;
          height = 200;

          svg.attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

          x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
          y = d3.scale.linear().range([height, 0]); 

          x.domain(data.map(function(d) { return d.date; }));
          y.domain([0, d3.max(data, function(d) { return d.value; }) + 5]);

          xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .tickFormat(d3.time.format('%d %b'));

          yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickFormat(d3.format('d'))
          .ticks((y.domain()[1] > 10 && 10) || y.domain()[1]);

          chart = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


          chart.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)
          .selectAll('text')
          .attr('dx', '-0.5em')
          .attr('transform', 'rotate(-45)' );

          chart.append('g')
          .attr('class', 'y axis')
          .call(yAxis);

          chart.selectAll('.bar')
          .data(data)
          .enter().append('rect')
          .attr('class', 'bar md-primary')
          .attr('x', function(d) { return x(d.date); })
          .attr('y', function(d) { return y(d.value); })
          .attr('height', function(d) { return height - y(d.value); })
          .attr('width', x.rangeBand());

          isInitialized = true;
        };

        scope.update = function(data) {
          chart.selectAll('.bar')
          .data(data)
          .attr('x', function(d) { return x(d.date); })
          .attr('y', function(d) { return y(d.value); })
          .attr('height', function(d) { return height - y(d.value); })
          .attr('width', x.rangeBand());
        };

        scope.resize = function() {
          width = ele[0].offsetWidth - margin.left - margin.right;
          x.rangeRoundBands([0, width], 0.1);
          y.range([height, 0]); 

          chart.select('.x.axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)
          .selectAll('text')
          .attr('dx', '-0.5em');

          chart.select('.y.axis')
          .call(yAxis);

          chart.selectAll('.bar')
          .attr('x', function(d) { return x(d.date); })
          .attr('y', function(d) { return y(d.value); })
          .attr('height', function(d) { return height - y(d.value); })
          .attr('width', x.rangeBand());
        };

      });
    }
  };
});
