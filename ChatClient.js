(function() {
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
	function Message(sender, body) {
		this.sender = sender;
		this.body = body;
	}
	
	/**
	 *	Send a message to the server.
	 */
	function sendMessage(message) {
		$.post('./cgi/addMessage', JSON.stringify(message), function(data, status) {
			console.log(status);
		});
	}
	
	/**
	 *	Get messages from the server.
	 */
	function getMessages(callback) {
		$.post('./cgi/getMessages', function(data) {
			console.log(messages);
			var messages = JSON.parse(data);
			callback(messages);
		}, 'json');
	}
	
	function refreshHistory() {
		getMessages(function (messages) {
			history = messages;
		});
		var messagesString = "";
		history.forEach(function(message) {
			messagesString += message.sender + ': ' + message.body + '\n';
		});
		$('#historyArea').html(messagesString);
	}
	
	$(document).ready(function() {
		$('#sendButton').click(function(){
			console.log('test');
			var message = new Message('a', 'test');
			sendMessage(message);
			refreshHistory();
		});
	});
})();