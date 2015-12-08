(function () {
  var reportModule = angular.module('ReportModule', ['os-auth']);
  reportModule.controller('SiteReportQuery', ['$http', '$scope', function ($http, $scope) {
    $scope.pager = function($direction) {
      var url = '';
      eval ('url = $scope.' + $direction + ';');
      $scope.params = convertRestURLtoObj(url);
      $scope.update();
    }

    $scope.updateCheckedValues = function($set, $value) {
      if (!$scope.params) {
        $scope.params = new Object();
      }
      $checked = eval ("$scope.query." + $set + "." + $value);

      if ($checked && $scope.params[$set]) {
        $scope.params[$set].push($value);
      }
      else if ($checked) {
        $scope.params[$set] = [$value];
      }
      else if ($scope.params[$set]) {
        angular.forEach($scope.params[$set], function($val, $index) {
          if ($val == $value) {
            delete $scope.params[$set][$index];
          }
        });
        if ($scope.params[$set].length == 0) {
          delete $scope.params[$set];
        }
      }
    };

    $scope.updateParam = function($field) {
      if (!$scope.params) {
        $scope.params = new Object();
      }

      $value = eval ("$scope.query." + $field);

      if ($value) {
        $scope.params[$field] = $value;
      }
      else if ($scope.params[$field]) {
        delete $scope.params[$field];
      }
    };

    $scope.update = function update() {
      // reset values
      $scope.headers = [];
      $scope.rows = [];
      jQuery("div.results").css("background-image", "url('/profiles/openscholar/modules/frontend/os_common/FileEditor/large-spin_loader.gif')");
      jQuery(".pager a").hide();
      $scope.status = "";
      $scope.params.range = $scope.query.limit;

      if ($scope.params && $scope.params.lastupdate) {
        $scope.params.exclude = ['feed_importer', 'profile', 'harvard_course'];
      }

      var $request = {
        method: 'POST',
        url : Drupal.settings.paths.api + '/report_sites',
        headers : {'Content-Type' : 'application/json'},
        data : $scope.params,
      };

      $http($request).then(function($response) {
        var $responseData = angular.fromJson($response.data.data);

        $scope.total = $response.data.count;

        if ($response.data.next != null) {
          $scope.next = $response.data.next.href;
          jQuery(".pager .next a").show();
        }
        else {
          $scope.next = null;
          jQuery(".pager .next a").hide();
        }

        if ($response.data.previous != null) {
          $scope.previous = $response.data.previous.href;
          jQuery(".pager .previous a").show();
        }
        else {
          $scope.previous = null;
          jQuery(".pager .previous a").hide();
        }

        var $keys = [];

        // get table headers from returned data
        for ($key in $responseData[0]) {
          if ($key && $key != "site_url") {
            $scope.headers.push($key);
          }
        }
        $scope.rows = $responseData;

        if ($scope.params.page == null) {
          $scope.params.page = 1;
        }

        if (($scope.params.page * $scope.params.range) < $scope.total) {
          $end = ($scope.params.page * $scope.params.range);
        }
        else {
          $end = $scope.total;
        }

        if ($scope.total) {
          $scope.status = "showing " + ((($scope.params.page - 1) * $scope.params.range) + 1) + " - " + $end + " of " + $scope.total;
        }
      },
      // error
      function() {
        jQuery("div.results").css("background-image", "none");
        ajax_command_remove('#messages');
        ajax_command_after('#header-region', '<div id="messages">Something went wrong.</div>');
      });
    };    

    $scope.sort = function sort($obj) {
      if ($scope.params.sort && ($scope.params.sort == $obj.header)) {
        $scope.params.sort = "-" + $obj.header;
      }
      else {
        $scope.params.sort = $obj.header;
      }

      // reset to page 1
      $scope.params.page = '1';

      $scope.update();
    };
  }]);

  reportModule.filter('makelink', ['$sce', function($sce) {
    return function($value, $header, $row) {
      if ($header == "site_name" && $value) {
        $html = '<a href="' + $row['site_url'] + '" target="_new">' + $value + '</a>'
        return $sce.trustAsHtml($html);
      }
      else if ($header == "site_name") {
        $html = '<a href="' + $row['site_url'] + '" target="_new">[No Title]</a>'
        return $sce.trustAsHtml($html);
      }
      else {
        return $sce.trustAsHtml($value);
      }
    };
  }]);

  reportModule.filter('formatHeader', function($sce) {
    return function($header) {
      return $header.replace(/_/g, " ");
    };
  });

  // function to take URL and return a javascript object of the query string
  var convertRestURLtoObj = function (url) {
      var query = decodeURIComponent(url.split('?').slice(1).toString());
      $queryArray = query.split('&');
      $queryObj = new Object();

      jQuery.each($queryArray, function($key, $value) {
        $pair = $value.split('=');
        $arrayFlag = 0;
        if ($pair[0].match(/\[\d+\]/)) {
          $arrayFlag = 1;
          $pair[0] = $pair[0].replace(/\[\d+\]/g, '');
        }
        if ($queryObj[$pair[0]]) {
          if (typeof $queryObj[$pair[0]] === "string") {
            $queryObj[$pair[0]] = new Array($queryObj[$pair[0]], $pair[1]);
          }
          else {
            $queryObj[$pair[0]].push($pair[1]);
          }
        }
        else {
          if ($arrayFlag) {
            $queryObj[$pair[0]] = new Array($pair[1]);
          }
          else {
            $queryObj[$pair[0]] = $pair[1];
          }
        }
      });

      return $queryObj;
  };


})();
