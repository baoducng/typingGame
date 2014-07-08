var app = angular.module("myApp", ['timer', 'ui.bootstrap', 'firebase']);

app.controller('TextController', function($scope, $rootScope, $interval, $firebase){
	$scope.text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	//I had to put everything in an array because ngrepeat will messed up the order in the string.
	$scope.textStorage = [];
	var lastLength;
	for (var i = 0; i < $scope.text.length; i++){
		var obj = { 
			letter : $scope.text[i],
			color : 'black'
		};
		$scope.textStorage.push(obj);
	};
	var enemyId;
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
	$interval(function(){
		$scope.fire.$child($scope.userId).$update({wpm: $scope.WPM, completion: $scope.completionRate});
	}, 1000);
	//have a timer counting down before the things starts
	$scope.WPM = 0;
	$scope.calWPM = function(){
		$scope.getTime();
		if ($scope.inputText){
			$scope.WPS = ($scope.inputText.length / $scope.seconds)
		 	$scope.WPM = Math.round($scope.WPS * 60 / 5);			
		}
	};
	$interval(function(){ $scope.calWPM() }, 1500);
  	// ************************************************************************************//	 
	//initiating fire base and setting up the first player
	$scope.fire = $firebase(new Firebase("https://typinggame.firebaseio.com"));
	$scope.userName = undefined;
	if ($scope.userName === undefined){
		$scope.userName = prompt('Please enter your name!');
	}
	$scope.fire.$add({name: $scope.userName, wpm: $scope.WPM, completion: $scope.completionRate, waiting: true, against: null})
	.then(function(ref){
		$scope.userId = ref.name();
	});

	$scope.storage = [];
	$scope.fire.$on('loaded', function(childSnapshot){		
		for (var key in childSnapshot){
			if (key[0] === '-'){
				$scope.storage.push(key);
			}
		}
		console.log($scope.storage.length);
		if ($scope.storage.length % 2 === 0){
			//this current one is the last one.
			$scope.fire.$child($scope.userId).$update({against: $scope.storage[$scope.storage.length - 2]})
			$scope.fire.$child($scope.storage[$scope.storage.length - 2]).$update({against: $scope.userId})
			$scope.waiting = false;
			$scope.enemy = $scope.fire.$child($scope.storage[$scope.storage.length - 2]);
			//$scope.fire.$child($scope.storage[$scope.storage.length - 2]) 

		}	else {
			$scope.fire.$child($scope.userId).$on('value', function(snapShot){
				if ($scope.fire.$child($scope.userId) !== undefined){
					enemyId = $scope.fire.$child($scope.userId).against;
					$scope.enemy = $scope.fire.$child(enemyId);
				}
			})
		}
	});

	//I can do a setInterval incrementing down the Count down
	//when it is zero then the time start


	//get the name of all the people playing right now down
	//look for the latest player that is not you.


  // ************************************************************************************//	 
	



	//time function
	$scope.timerRunning = false;
  $scope.startTimer = function (){
    $scope.$broadcast('timer-start');
    $scope.timerRunning = true;
  };
  // do I really need stop timer?
  $scope.stopTimer = function (){
    $scope.$broadcast('timer-stop');
    $scope.timerRunning = false;
    console.log('timer stopped')
  };

  //the changes in game started in not alerted into the review
  $scope.gameStarted = false;
  $scope.startGame = function(){
  	$scope.gameStarted = true;
  	console.log($scope.gameStarted);
  	$scope.$digest();
  };

  $scope.getTime = function(){
  	$scope.seconds = $rootScope.seconds;
  };
})
