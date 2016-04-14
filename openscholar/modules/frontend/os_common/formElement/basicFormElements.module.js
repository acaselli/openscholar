(function () {

  var m = angular.module('basicFormElements', ['osHelpers', 'ngSanitize']);

  /**
   * Checkbox directive.
   * Arguments:
   *   name - string - the name of the element as Drupal expects it
   *   value - property on parent scope
   */
  m.directive('checkbox', [function () {
    return {
      scope: {
        name: '@',
        value: '=',
        element: '='
      },
      template: '<input type="checkbox" id="{{id}}" name="{{name}}" value="1" class="form-checkbox" ng-model="value" ng-true-value="1" ng-false-value="0"/><label class="option" for="{{id}}">{{title}}</label>',
      link: function (scope, elem, attr) {
        scope.id = attr['inputId'];
        scope.title = scope.element.title;
      }
    }
  }]);

  /**
   * Textbox directive.
   */
  m.directive('textfield', [function () {
    return {
      scope: {
        name: '@',
        value: '=',
        element: '='
      },
      template: '<label for="{{id}}">{{title}}</label><br />' +
      '<input type="textfield" id="{{id}}" name="{{name}}" ng-model="value" class="form-text">',
      link: function (scope, elem, attr) {
        scope.id = attr['inputId'];
        scope.title = scope.element.title;
      }
    }
  }]);

  /**
   * Radios directive.
   */
  m.directive('radios', ['$sce', function ($sce) {
    return {
      scope: {
        name: '@',
        value: '=',
        element: '='
      },
      template: '<label for="{{id}}">{{title}}</label>' +
      '<div id="{{id}}" class="form-radios">' +
        '<div class="form-item form-type-radio" ng-repeat="(val, label) in options">' +
          '<input type="radio" id="{{id}}-{{val}}" name="{{name}}" value="{{val}}" ng-model="$parent.value" class="form-radio"><label class="option" for="{{id}}-{{val}}" ng-bind-html="label"></label>' +
        '</div>' +
      '</div> ',
      link: function (scope, elem, attr) {
        scope.id = attr['inputId'];
        scope.options = scope.element.options;
        scope.title = scope.element.title;
      }
    }
  }]);

  /**
   * Submit button directive
   *
   * This type of form element should always have some kind of handler on the server end to take care of whatever this needs to do.
   */
  m.directive('submit', [function () {
    return {
      scope: {
        name: '@',
        value: '=',
        element: '='
      },
      template: '<input type="submit" id="{{id}}" name="{{name}}" value="{{label}}" class="form-submit">',
      link: function (scope, elem, attr) {
        scope.id = attr['inputId'];
        scope.label = scope.element.value;

        elem.click(function (click) {
          scope.value = (scope.value + 1)%2;
        });
      }
    }
  }]);

})();
