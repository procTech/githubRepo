// App declaration
angular.module('githubApp', []);

// Directive declaration
angular.module('githubApp').directive('githuRepos', function($window, $http) {
  return {
    restrict: 'E',
    scope: {
    },
    template: '<table class="table table-hover"><thead> <tr> <th>Repo Name</th> <th>Description</th> <th>Owner Name</th> <th>Owner Type</th> <th>Actions</th> </tr> </thead> <tr ng-repeat="repo in repos"> \
                <td><span ng-hide="repo.editing" ng-bind="repo.name"></span><input ng-enter="update(repo)" ng-model="repo.name" ng-show="repo.editing" /></td> \
                <td><span ng-hide="repo.editing" ng-bind="repo.description"></span><input ng-enter="update(repo)" ng-model="repo.description" ng-show="repo.editing"/></td> \
                <td><span ng-hide="repo.editing" ng-bind="repo.owner.login"></span><input ng-enter="update(repo)" ng-model="repo.owner.login" ng-show="repo.editing"/></td> \
                <td><span ng-hide="repo.editing" ng-bind="repo.owner.type"></span><input ng-enter="update(repo)" ng-model="repo.owner.type" ng-show="repo.editing"/></td> \
                <td><a ng-hide="repo.editing" href="javascript:void(0)" ng-click="repo.editing=true">Edit</a><a href="javascript:void(0)" ng-click="update(repo)" ng-show="repo.editing">Update</a></td> </tr>\
                <tr ng-show="modal.loading" style="font-size:48px;"><td></td> <td>Loading...</td> </tr>\
                </table>',
    link: function(scope, elm, attr){
      scope.repos = [];
      scope.modal = {nextPage: '', loading: true};

      function fetchData(url){
        scope.modal.loading = true;
        $http.get(url)
            .success(function (data, status, headers, config) {
              scope.repos = _.union(scope.repos, data);
              scope.modal.nextPage =  headers('Link');
              scope.modal.nextPage = scope.modal.nextPage.split('>; rel="next"')[0].split('<')[1];
              scope.modal.loading = false;
            })
      }

      scope.update = function(repo){
        var config = {headers : {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'} };
        var data = {name: repo.name, description: repo.description, owner: {login: repo.owner.login, type: repo.owner.type}};

        $http.post('http://requestb.in/13wmkg01', data, config).then(function(res){
          repo.editing = false;
        }, function(error){
          repo.editing = false;
        });
      };

      angular.element($window).bind("scroll", function() {
          var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
          var body = document.body, html = document.documentElement;
          var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
          windowBottom = windowHeight + window.pageYOffset;
          if (windowBottom >= docHeight) {
            fetchData(scope.modal.nextPage);
          }
      });

      fetchData('https://api.github.com/repositories');
    }
  };
});


angular.module('githubApp').directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
});

