var app = angular.module('sugarScope', []);

app.directive('ngEasyTable', ['$http', function($http){
  var _allEntries = [];
  var entries = [];
  var currentEntryIndex = 0;

  var loadContent = function($scope){
    $http.get($scope.urlFeed)
      .success(function(data){
        entries = data;
        _allEntries = data;

        resizeEntries($scope);
      });
  };

  var changePage = function($scope){
    currentEntryIndex = $scope.currentPage * parseInt($scope.entriesShown);

    var tmp = [];
    for (var i = 0; i < parseInt($scope.entriesShown); i++){
      if (entries[i + currentEntryIndex]){
        tmp.push(entries[i + currentEntryIndex]);
      }
    }

    $scope.body = tmp;
  };

  var resizeEntries = function($scope){
    var pages = [];
    var length = parseInt(entries.length / parseInt($scope.entriesShown)) + 1;

    for (var i = 0; i < length; i++){
      pages.push(i+1);
    }

	$scope.currentPage = 0;
    changePage($scope);
    $scope.pages = pages;
  };

  return {
    restrict: 'E',
    link: function(scope, element, attrs){
      scope.urlFeed = attrs.urlFeed;
      scope.columns = eval(attrs.columns);
      scope.id = attrs.id;
      scope.lazyLoad = attrs.lazyLoad? eval(attrs.lazyLoad): false;

      loadContent(scope);
    },
    controller: ['$scope', '$rootScope', function($scope, $rootScope){
      $scope.body = [];
      $scope.entriesShown = '10';
      $scope.pages = [];
      $scope.currentPage = 0;
      $scope.orderColumn = {};
      $scope.searchBox = '';

      $scope.sort = function(col){
        if (col.sortable){
          if (col.value != $scope.orderColumn.value){
            $scope.orderColumn = {
              value: col.value,
              dirAsc: true
            }
          }

          $scope.orderColumn.dirAsc = !$scope.orderColumn.dirAsc;

          entries.sort(function(a, b){
            if (!$scope.orderColumn.dirAsc){
              if (a[col.value] < b[col.value])
                return  1;
              if (a[col.value] > b[col.value])
                return -1;
            }else{
              if (a[col.value] > b[col.value])
                return  1;
              if (a[col.value] < b[col.value])
                return -1;
            }
          });
          changePage($scope);
        }
      };

      $scope.updateClick = function(row){
        $rootScope.$emit($scope.id + '.ngTable.selectRow', row);
      };

      $scope.requestPage = function(id){
        loadContent($scope, id);
      };

      $scope.changeEntriesShown = function(){
        resizeEntries($scope);
      };

      $scope.changeSearchBox = function(){
        var tmp = [];

		var isColumn = function(key){
			for (var i = 0; i < $scope.columns.length; i++){
				if ($scope.columns[i].value === key){
					return true;
				}
			}
			return false;
		};

        for (var i = 0; i < _allEntries.length; i++){
          for (var key in _allEntries[i]){
            if (_allEntries[i].hasOwnProperty(key) && typeof _allEntries[i][key] === 'string' && isColumn(key)) {
              if (_allEntries[i][key].indexOf($scope.searchBox) > -1){
                tmp.push(_allEntries[i]);
                break;
              }
            }
          }
        }

        $scope.orderColumn = {};
        entries = tmp;
        resizeEntries($scope);
      };

      $scope.prevPage = function(){
        if ($scope.currentPage>0){
          $scope.currentPage--;
          changePage($scope);
        }
      };

      $scope.nextPage = function(){
        if ($scope.currentPage < $scope.pages.length){
          $scope.currentPage++;
          changePage($scope);
        }
      };

      $scope.goToPage = function(page){
        $scope.currentPage = page;
        changePage($scope);
      };

	  $rootScope.$on('ng-table.refresh', function(evt, callback){
		 loadContent($scope);
		 callback();
	  });
    }],
    template: function(){
      return '' +
        '<div class="row form-inline" style="padding: 5px">' +
        '  <div class="col-sm-6">' +
        '    Show' +
        '    <select ng-model="entriesShown" class="form-control" ng-change="changeEntriesShown()">' +
        '      <option value="5">5</option>' +
        '      <option value="10">10</option>' +
        '      <option value="25">25</option>' +
        '      <option value="50">50</option>' +
        '    </select>' +
        '    values' +
        '  </div>' +
        '  <div class="col-sm-6">' +
        '    <div class="pull-right">' +
        '      Search:' +
        '      <input type="text" ng-model="searchBox" ng-change="changeSearchBox()" class="form-control">' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div class="row">' +
        '  <div class="col-sm-12">' +
        '    <table class="table table-hover">' +
        '      <thead>' +
        '        <tr>' +
        '          <th ng-repeat="col in columns" ng-click="sort(col)">{{col.title}}' +
        '            <span class="pull-right" ng-if="col.sortable">' +
        '              <i ng-if="orderColumn.value == col.value && orderColumn.dirAsc" class="glyphicon glyphicon-sort-by-attributes"></i>' +
        '              <i ng-if="orderColumn.value != col.value" class="glyphicon glyphicon-sort" style="color:#ccc"></i>' +
        '              <i ng-if="orderColumn.value == col.value && !orderColumn.dirAsc" class="glyphicon glyphicon-sort-by-attributes-alt"></i>' +
        '            </span>' +
        '          </th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' +
        '        <tr ng-repeat="row in body" table-row="row" ng-dblClick="updateClick(row)"></tr>' +
        '      </tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>' +
        '<div class="row">' +
        '  <div class="col-sm-12">' +
        '    <nav aria-label="Page navigation">' +
        '      <ul class="pagination">' +
        '        <li>' +
        '          <a ng-click="prevPage()" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>' +
        '        </li>' +
        '        <li ng-repeat="page in pages" ng-class="{\'active\': page == currentPage + 1}">' +
        '          <a ng-click="goToPage(page-1)">{{page}}</a>' +
        '        </li>' +
        '        <li ng-if="lazyLoad">' +
        '          <a href="#">...</a>' +
        '        </li>' +
        '        <li>' +
        '          <a ng-click="nextPage()" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>' +
        '        </li>' +
        '      </ul>' +
        '    </nav>' +
        '  </div>' +
        '</div>';
    }
  };
}]);

app.directive('tableRow', ['$compile', '$rootScope', function($compile, $rootScope){
  return {
    restrict: 'A',
    scope: {
      row: '=tableRow'
    },
    require: '^^ngEasyTable',
    transclude: true,
    link: function(scope, element, attr){
      var content = '';
      var columns = scope.$parent.columns;
	  var templateCell = {};
      var id = scope.$parent.id;

	  for (var i = 0; i < columns.length; i++){
		  if (columns[i].type === 'button'){
			  var buttons = columns[i].value;
			  templateCell[i] = '';

			  for (var j = 0; j < buttons.length; j++){
				templateCell[i] += '<a class="'+buttons[j].class+'" ng-click="onClick(\''+ buttons[j].event +'\', row)" title="'+buttons[j].tooltip+'">' + buttons[j].label + '</a> '
			  }
		  }
	  }

      for (var i = 0; i < columns.length; i++){
		var value = '';

		if(templateCell[i]){
			value = templateCell[i];
		} else {
			if(columns[i].preProccessor){
				value = columns[i].preProccessor(scope.row[columns[i].value]);
			} else {
				value = scope.row[columns[i].value];
			}
		}
        content += '<td>' + value + '</td>';
      }

	  scope.onClick = function(event, data){
		$rootScope.$emit(id + '.ngTable.'+event, data);
	  };

	  element.html('').append( $compile( content )( scope ) );
    }
  };
}]);

app.filter('preserveFunctions', function(){
	var parseString = function(data){
		var response = '';

		for (var key in data){
			if(typeof data[key] === 'string'){
				response += ',' + key + ':"' +  data[key].replace(/"/g,'\\"') + '"';
			} else if (Object.prototype.toString.call( data[key] ) === '[object Array]'){
				var innerResponse = '';
				for (var i = 0; i < data[key].length; i++){
					innerResponse += ',' + parseString(data[key][i]);
				}
				response += ',' + key + ':[' + innerResponse.substring(1) + ']';
			} else if (typeof data[key] === 'object'){
				response += ',' + parseString(data[key]);
			} else {
				response += ',' + key + ':' +  data[key].toString();
			}
		}

		response = response.substring(1);

		return '{' + response +'}';
	};
	return function(input){
		var response = '';
		if (Object.prototype.toString.call( input ) !== '[object Array]'){
			response = parseString(input);
		}else{
			for (var i = 0; i < input.length; i++){
				response += ',' + parseString(input[i]);
			}
			response = '[' + response.substring(1) + ']';
		}

		return response;
	}
});
