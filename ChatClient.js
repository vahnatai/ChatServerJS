//(function() {
    var chatApp = angular.module('chatApp', []);

    chatApp.controller('ChatController', function($scope) {
        $scope.currentUser = null;
    	$scope.messages = [];
        $scope.users = [];
    	
    	/**
    	 *	Send a message to the server.
    	 */
    	$scope.sendMessage = function sendMessage(sender, body, date) {
    		$.post(
                './cgi/addMessage',
                JSON.stringify({
                    sender: sender,
                    body: body,
                    date: date
                }),
                function(data, status) {

                }
            );
    	};
    	
    	/**
    	 *	Get messages from the server.
    	 */
    	$scope.getMessages = function getMessages(callback) {
    		$.post('./cgi/getMessages', function(messages) {
    			callback(messages);
    		}, 'json');
    	};
        
        /**
         *  Get the current user for this address, if exists.
         */
        $scope.getCurrentUser = function getCurrentUser(callback) {
            $.post('./cgi/getCurrentUser', function(data) {
                callback(data.user);
            }, 'json');
        };
        
        /**
         *  Get the current user for this address, if exists.
         */
        $scope.getActiveUsers = function getActiveUsers(callback) {
            $.post('./cgi/getActiveUsers', function(data) {
                callback(data.users);
            }, 'json');
        };
        
        /**
         *  Attempt to create a new user associated with this address.
         */
        $scope.createNewUser = function createNewUser(username, callback) {
            var sendData = {username: username};
            $.post('./cgi/createNewUser', JSON.stringify(sendData), function(data) {
                //TODO
    			
    			callback(data);
    		}, 'json');
        };
    	
    	$scope.refreshHistory = function refreshHistory(callback) {
    		$scope.getMessages(function (messages) {
                $scope.messages = messages;
                $scope.$apply();
                if (callback) {
                    callback(messages);
                }
    		});
    	};

        $scope.refreshUsers = function refreshUsers() {
            $scope.getActiveUsers(function (users) {
                $scope.users = users;
                $scope.$apply();
            });
        };
    	
        // get an old or new username 
        $scope.getCurrentUser(function(username) {
            if (!username) {
                var desiredName;
                while (!desiredName) {
                    desiredName = prompt('No username associated with this address. Please indicate desired nickname:');
                }
                $scope.createNewUser(desiredName, function(data) {
                    $scope.currentUser = data.username;
                    $scope.refreshUsers();
                });
                return;
            }
            $scope.currentUser = username;
            $scope.refreshUsers();
        });
        
        
    	$scope.init = function init() {
            function scrollHistoryToEnd() {
                var $history = $('#historyArea');
                $history.scrollTop($history[0].scrollHeight - $history.height());
                $('#inputField').focus();
            }
        
            function triggerSend() {
                var messageBody = $('#inputField').val();
                $('#inputField').val('');
    			$scope.sendMessage($scope.currentUser, messageBody, new Date().getTime());
    			$scope.refreshHistory(scrollHistoryToEnd);
            }
    		$('#sendButton').click(function() {
    			triggerSend();
    		});
            $('#inputField').keypress(function (event) {
                if (event.which == 13) {
                    triggerSend();
                }
            });
            
            $scope.refreshHistory(scrollHistoryToEnd);
            setInterval($scope.refreshHistory, 250);
    	};

    });
//})();