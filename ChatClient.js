//(function() {
    var chatApp = angular.module('chatApp', []);

    chatApp.controller('ChatController', function($scope) {

        $scope.debugIt = function() {
            console.debug($scope);
        };
    });

    var currentUser;
	var history = [];
	
	/**
	 *	Send a message to the server.
	 */
	function sendMessage(sender, body, date) {
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
	}
	
	/**
	 *	Get messages from the server.
	 */
	function getMessages(callback) {
		$.post('./cgi/getMessages', function(messages) {
			callback(messages);
		}, 'json');
	}
    
	/**
	 *	Get the current user for this address, if exists.
	 */
	function getCurrentUser(callback) {
		$.post('./cgi/getCurrentUser', function(data) {
			callback(data.user);
		}, 'json');
	}
    
    /**
     *  Attempt to create a new user associated with this address.
     */
    function createNewUser(username, callback) {
        var sendData = {username: username};
        $.post('./cgi/createNewUser', JSON.stringify(sendData), function(data) {
            //TODO
			
			callback(data);
		}, 'json');
    }
	
	function refreshHistory(callback) {
		getMessages(function (messages) {
            var messagesString = "";
            for (var key in messages) {
                var prepend = (messagesString ? '\n' : ''); //prepend newline for all but first message
                var message = messages[key];
                messagesString += prepend + message.sender + ': ' + message.body;
            };
            $('#historyArea').html(messagesString);
            if (callback) {
                callback(messages);
            }
		});
	}
	
    // get an old or new username 
    getCurrentUser(function(username) {
        if (!username) {
            var desiredName;
            while (!desiredName) {
                desiredName = prompt('No username associated with this address. Please indicate desired nickname:');
            }
            createNewUser(desiredName, function(data) {
                currentUser = data.username;
            });
            return;
        }
        currentUser = username;
    });
    
    
	$(document).ready(function() {
        function scrollHistoryToEnd() {
            var $history = $('#historyArea');
            $history.scrollTop($history[0].scrollHeight - $history.height());
            $('#inputField').focus();
        }
    
        function triggerSend() {
            var messageBody = $('#inputField').val();
            $('#inputField').val('');
			sendMessage(currentUser, messageBody, new Date().getTime());
			refreshHistory(scrollHistoryToEnd);
        }
		$('#sendButton').click(function() {
			triggerSend();
		});
        $('#inputField').keypress(function (event) {
            if (event.which == 13) {
                triggerSend();
            }
        });
        
        refreshHistory(scrollHistoryToEnd);
        setInterval(refreshHistory, 250);
	});
//})();