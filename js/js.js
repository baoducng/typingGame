var app = angular.module("myApp", ['timer', 'ui.bootstrap', 'firebase']);

app.controller('TextController', function($scope, $rootScope, $interval, $firebase){
	var lastLength;
	var enemyId;
	var userId
	$scope.text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	$scope.textStorage = [];
	$scope.storage = [];
	$scope.WPM = 0;
	$scope.timerRunning = false;
	$scope.gameStarted = false;
	$scope.userName = undefined;
	$scope.ready = false;

	
//Put text in an array because ngrepeat messes up string order.
	for (var i = 0; i < $scope.text.length; i++){
		var obj = { 
			letter : $scope.text[i],
			color : 'black'
		};
		$scope.textStorage.push(obj);
	};

	$scope.checkColor = function(){
		var last = $scope.inputText.length - 1;	
		var currLength = $scope.inputText.length;
		//reset the color to black when user backspace
		if (lastLength > currLength){
			$scope.textStorage[lastLength - 1].color = 'black';
			//getting an err when last length is 0
		}
		//set the color to red or green
		if ($scope.inputText[last] === $scope.textStorage[last].letter){
			$scope.lastLength++;
			$scope.textStorage[last].color = 'green';
		} else {
			$scope.lastLength++;
			$scope.textStorage[last].color = 'red';
		}
		lastLength = currLength; 
	};
	
	$scope.checkCompletion = function(){
		$scope.completionRate = (($scope.inputText.length / $scope.textStorage.length * 100).toFixed(2));	
	};

	$scope.calWPM = function(){
		$scope.getTime();
		if ($scope.inputText){
			$scope.WPS = ($scope.inputText.length / $scope.seconds)
		 	$scope.WPM = Math.round($scope.WPS * 60 / 5);			
		}
	};

// ***************TIME DIRECTIVE***********************//	 
  $scope.startTimer = function (){
    $scope.$broadcast('timer-start');
    $scope.timerRunning = true;
  };
  // do I nned stop timer?
  $scope.stopTimer = function (){
    $scope.$broadcast('timer-stop');
    $scope.timerRunning = false;
    console.log('timer stopped')
  };

  $scope.startGame = function(){
  	$scope.gameStarted = true;
  	console.log($scope.gameStarted);
  	$scope.$digest();
  };

  $scope.getTime = function(){
  	$scope.seconds = $rootScope.seconds;
  };

// ************************FIREBASE SETUP****************//	 
	$scope.fire = $firebase(new Firebase("https://typinggame.firebaseio.com"));

	//replace this with an input box later	
	if ($scope.userName === undefined){
		$scope.userName = prompt('Please enter your name!');
	}

	//inititate new user
	$scope.fire.$add({
		name: $scope.userName, 
		wpm: $scope.WPM, 
		completion: $scope.completionRate, 
		waiting: true,
		text: $scope.textStorage, 
		against: null})
			.then(function(ref){
				userId = ref.name();	
				$interval(function(){
					$scope.calWPM();
					$scope.fire.$child(userId).$update({
						wpm: $scope.WPM, 
						completion: $scope.completionRate,
						text: $scope.textStorage
					});
				}, 1000);
					
		});

	//find opponents
	$scope.fire.$on('loaded', function(childSnapshot){		
		for (var key in childSnapshot){
			if (key[0] === '-'){
				$scope.storage.push(key);
			}
		}
		if ($scope.storage.length % 2 === 0){
			enemyId = $scope.storage[$scope.storage.length - 2];
			$scope.fire.$child(userId).$update({against: enemyId})
			$scope.fire.$child(enemyId).$update({against: userId})
			$scope.enemy = $scope.fire.$child(enemyId);
			$scope.ready = true;
		}	else {						
			$scope.fire.$child(userId).$on('value', function(snapShot){
				if ($scope.fire.$child(userId).against !== undefined){
					enemyId = $scope.fire.$child(userId).against;
					$scope.enemy = $scope.fire.$child(enemyId);
					$scope.ready = true;
					
				}
			});
		}		
	});	
});
	
