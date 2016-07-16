var app = angular.module('pokemonAlgoApp', ['ngMaterial']);

app.filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.filter('effectiveness', function() {
    return function(input) {
        var effs = ['None', 'Not Very', '-', 'Super'];
        return effs[parseInt(input)];
    }
})

app.controller('pokemonAlgoController', ["$scope", "$http", function($scope, $http) {
    $scope.ranked = [];
    $scope.whichGiven = "enemy";
    $scope.selectedType = "normal";

    $scope.effectivenessClasses = ['no-effect', 'not-very-effective', '', 'super-effective']

    $http.get(window.location.toString() + "pokeData.json").then(function(data) {
        console.log(data);
        $scope.relationships = data.data;
        $scope.types = Object.keys($scope.relationships);

        class TypeRelationship {
            constructor(friendly, enemy, score) {
                this.friendly = friendly;
                this.enemy = enemy;
                this.friendlyAttack = $scope.relationships[friendly][enemy];
                this.enemyAttack = $scope.relationships[enemy][friendly];
                this.score = this.friendlyAttack - this.enemyAttack;
            }
        }
        scoreRelationship = function(friendly, enemy) {
            return $scope.relationships[friendly][enemy] - $scope.relationships[enemy][friendly];
        }

        rank = function(fe) {
            var unsorted = [];
            for (var i = 0; i < $scope.types.length; i++) {
                if ($scope.whichGiven == 'friendly') {
                    unsorted.push(new TypeRelationship(fe, $scope.types[i]));
                } else {
                    unsorted.push(new TypeRelationship($scope.types[i], fe));
                }
            }
            return unsorted.sort(function(f, s) {
                return s.score - f.score;
            });
        }

        updateRanks = function() {
            $scope.ranked = $scope.rank($scope.selectedType);
        }

        $scope.updateRanks = updateRanks;
        $scope.scoreRelationship = scoreRelationship;
        $scope.rank = rank;
        updateRanks();

    });


}]);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default').dark();
});
