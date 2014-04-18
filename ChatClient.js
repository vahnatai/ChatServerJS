//(function() {
    var currentUser;
	var history = [];
	/**
	 *  Make one class extend another.
	 *
	 *  @param base {function} Base class constructor.
	 *  @param sub {function} Sub-class constructor.
	 */
	function extend(base, sub, properties) {
		sub.prototype = Object.create(base.prototype);
		sub.prototype.constructor = sub;
		Object.defineProperty(sub.prototype, 'constructor', { 
			enumerable: false, 
			value: sub 
		});
		if (typeof properties !== 'undefined' && properties) {
			for (var propName in properties) {
				sub.prototype[propName] = properties[propName];
				Object.defineProperty(sub.prototype, propName, { 
					enumerable: true, 
					value: properties[propName]
				});
			}
		}
		sub.prototype._super = base;
	}
	
	/**
	 *	Message class.
	 */
	function Message(sender, body, date) {
		this.sender = sender;
		this.body = body;
        this.date = date;
	}
	
	/**
	 *	Send a message to the server.
	 */
	function sendMessage(message) {
		$.post('./cgi/addMessage', JSON.stringify(message), function(data, status) {
		});
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
			history = messages;
            var messagesString = "";
            for (var key in history) {
                var prepend = (messagesString ? '\n' : ''); //prepend newline for all but first message
                var message = history[key];
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
			var message = new Message(currentUser, messageBody, new Date().getTime());
			sendMessage(message);
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