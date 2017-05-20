/**
* Dial across
* @namespace dial across
*/
(function () {
    'user-strict'

    angular
        .module('dialacross', [
            'ui.mask'
        ])
    .controller('BaseController', BaseController)
    .controller('SignUpController', SignUpController)
    .factory('SignUp', SignUpFactory)

    BaseController.$inject = ['$rootScope', '$scope']
    SignUpController.$inject = ['$rootScope', '$scope', 'SignUp']
    SignUpFactory.$inject = ['$http']

    /**
    * @namespace BaseController
    */
    function BaseController($rootScope, $scope) {

        var vm = this

        $rootScope.formSend = false

        return vm
    }

    function SignUpController($rootScope, $scope, SignUp) {
        var vm = this

        $scope.user = {}

        vm.signUp = signUp
        vm.selectPoliticalSide = selectPoliticalSide

        return vm

        function signUp(isValid) {
            if (isValid) {
              SignUp.submit($scope.user).then(function(response) {
                $rootScope.formSend = true
              }, function(response) {
                $rootScope.formSend = false
                alert("Submission has failed, try again.")
              })
            } else {
                console.error("Form validation has failed, make sure all the forms are filled in correctly")
            }
        }

        function selectPoliticalSide($event) {
            $scope.user.politicalSide = $event.target.value
        }
    }

    /**
    * @namespace SignUpFactory
    */
    function SignUpFactory($http) {

        var resource = {}

        resource.submit = function(user) {
            if ( !user.phone ) {
                return $http.post('/sign-up/', user)
            }
        }

        return resource
    }
})();
