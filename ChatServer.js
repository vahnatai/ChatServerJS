(function() {
	var http = require('http');
	var path = require('path');
	var url = require('url');
	var fs = require('fs');
	var querystring = require('querystring');
	
	var messages = [];
	
	function requestAddMessage(message, response) {
		messages.push(message);
		response.setHeader('content-type', 'text/plain');
		response.end();
	}
	
	function requestGetMessages(response) {
		response.setHeader('content-type', 'application/json');
		response.end(JSON.stringify(messages));
	}
	
	var server = http.createServer(function (request, response) {
		var parsedUrl = url.parse(request.url);
		if (!parsedUrl.pathname) {
			response.setHeader('content-type', 'text/plain');
			response.end('Error: bad path');
			return;
		}
		
		//check for CGI call
		//if (request.method === 'POST') {
			if (parsedUrl.pathname === '/cgi/addMessage') {
				var body = '';
				var message;
				request.on('data', function(data) {
					body += data;
				});
				request.on('end', function() {
					message = querystring.parse(body);
				});
				requestAddMessage(message, response);
				return;
			} else if (parsedUrl.pathname === '/cgi/getMessages') {
				console.log('getMessages');
				requestGetMessages(response);
				return;
			}
			// else {
				// response.setHeader('content-type', 'text/plain');
				// response.end('Error: bad POST path');
				// return;
			// }
		// }
		
		//host files
		fs.readFile(path.normalize('.' + parsedUrl.pathname), function (error, data) {
			if (error) {
				response.setHeader('content-type', 'text/plain');
				response.end('I/O Error: ' + error);
				return;
			}
			var ext = path.extname(parsedUrl.pathname);
			var contentType;
			if (ext === '.html') {
				contentType = 'text/html';
			} else if (ext === '.css') {
				contentType = 'text/css';
			} else if (ext === '.js') {
				contentType = 'application/javascript';
			} else if (ext === '.json') {
				contentType = 'application/json';
			} else {
				contentType = 'text/plain';
			}
			
			response.setHeader('content-type', contentType);
			response.end(data);
		});
	});
	server.listen(8989);
})();