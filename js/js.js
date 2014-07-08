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
		$scope.fire.$child($scope.userId).$update({wpm: $scope.WPM, completion: $scope.completionRate});
	};
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
	$scope.fire = $firebase(new Firebase("https://typinggame.firebaseio.com/users"));
	$scope.userName = undefined;
	if ($scope.userName === undefined){
		$scope.userName = prompt('Please enter your name!');
	}
	$scope.fire.$add({name: $scope.userName, wpm: $scope.WPM, completion: $scope.completionRate, waiting: true, against: null})
	.then(function(ref){
		$scope.userId = ref.name();
	});

	console.log( JSON.stringify( $scope.fire ) );

	//two scenario, listening to changes on itself, or listening to added on other people.
	// for (var key in $scope.fire){
	// 	console.log( JSON.stringi);
	// }

	setTimeout( function() {
		var allKeys = Object.getOwnPropertyNames( $scope.fire );
		var firebaseKeys = allKeys.filter( function( key ) {
			return key.charAt( 0 ) === "-";
		});
		console.log(firebaseKeys);
	}, 1000);
	



	// $scope.fire.$on('loaded', function(childSnapshot){
	// 	// var user = childSnapshot.snapshot.value;
	// 	// user.id = childSnapshot.snapshot.name;
	// 	// $scope.users.push(user);
	// 	console.log(childSnapshot)
	// 	for (var key in childSnapshot){
	// 		console.log(key)
	// 	}
		

	// });	
	



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
  	$scope.seconds = $rootScope.seconds
  };
})
