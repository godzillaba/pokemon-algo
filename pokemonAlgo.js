var app = angular.module('pokemonAlgoApp', ['ngMaterial']);

app.filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.filter('effectiveness', function() {
    return function(input) {
        var effs = ['None', 'Slight', '-', 'Super'];
        return effs[parseInt(input)];
    }
});

app.filter('infinitize', function() {
    return function(input) {
        if (input == Infinity) return "\u221e";
        else if (input == -Infinity) return "-\u221e";
        else return input
    }
})

app.controller('pokemonAlgoController', ["$scope", "$http", "$mdDialog", "$window",
function($scope, $http, $mdDialog, $window) {
    $scope.ranked = [];
    $scope.whichGiven = "enemy";
    $scope.selectedType = "normal";

    $scope.$window = $window;

    window.$scope = $scope;

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
                if (this.enemyAttack === 0 && this.friendlyAttack > 0) {
                    this.score = Infinity;
                } else if (this.enemyAttack > 0 && this.friendlyAttack === 0) {
                    this.score = -Infinity
                }
            }
        }

        var rank = function(fe) {
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

        var updateRanks = function() {
            $scope.ranked = $scope.rank($scope.selectedType);
        }

        var showInfoDialog = function() {
            info = $mdDialog.alert({
                template: `
                <md-dialog layout-padding aria-label="List dialog">
                    <h2>What Is This?</h2>
                    <p>This application can tell trainers which types of pokemon will be most effective in certain circumstances!
                        <br/><br/>
                        1. Select 'Friendly' or 'Enemy' to pick what will remain constant
                        <br/>2. Select a type from the dropdown menu
                        <br/>3. Win!
                    </p>
                    <md-dialog-actions>
                        <md-button ng-click="dialog.hide()" class="md-primary">Close</md-button>
                    </md-dialog-actions>
                </md-dialog>
                `
            }).clickOutsideToClose(true);
            $mdDialog.show(info);
        }

        angular.element($window).bind('resize', function(){
            $scope.$apply();
        })

        $scope.showInfoDialog = showInfoDialog;
        $scope.updateRanks = updateRanks;
        $scope.rank = rank;
        updateRanks();

    });


}]);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('yellow')
        .dark();
});
