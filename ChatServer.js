(function() {
	var http = require('http');
	var path = require('path');
	var url = require('url');
	var fs = require('fs');
	var querystring = require('querystring');
	
	var messages = {};
    var users = {};
    
    function addUser(username, address) {
        if (users[address]) {
            console.error('Address ' + address + ' already associated.');
            return null;
        }
        users[address] = username;
        saveUsers();
        return username;
    }
    
    function removeUser(username, address) {
        if (!users[address] || users[address] !== username) {
            console.error('Attempt to remove username to address association that does not exist. User: ' + username + ' Addr: ' + address);
            return;
        }
        delete users[address];
        saveUsers();
    }
    
    function getUser(address) {
        if (users[address]) {
            return users[address];
        }
        return null;
    }
    
    function saveUsers() {
        fs.writeFile('./users.json', JSON.stringify(users), function(error) {
            if (error) {
                console.error('I/O error: ', error);
            }
        });
    }
	
	function request_addMessage(request, response) {
        var body = '';
        var message;
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            message = JSON.parse(body);
            messages[message.date] = message;
            response.setHeader('content-type', 'text/plain');
            response.end();
        });
	}
	
	function request_getMessages(response) {
		response.setHeader('content-type', 'application/json');
		response.end(JSON.stringify(messages));
	}
    
    function request_getCurrentUser(request, response) {
        var addr = request.connection.remoteAddress;
        var user = getUser(addr);
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({user: user}));
    }
	
    function request_createNewUser(request, response) {
        var body = '';
        var info;
        request.on('data', function(data) {
            body += data;
        });
        request.on('end', function() {
            info = JSON.parse(body);
            
            var result;
            var addr = request.connection.remoteAddress;
            if (addUser(info.username, addr)) {
                result = {
                    success: true,
                    username: info.username
                };
            } else {
                result = {
                    success: false,
                    error: 'User already exists for this address.'
                };
            }
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify(result));
        });
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
            request_addMessage(request, response);
            return;
        } else if (parsedUrl.pathname === '/cgi/getMessages') {
            request_getMessages(response);
            return;
        } else if (parsedUrl.pathname === '/cgi/getCurrentUser') {
            request_getCurrentUser(request, response);
            return;
        } else if (parsedUrl.pathname === '/cgi/createNewUser') {
            request_createNewUser(request, response);
            return;
        }
			// else {
				// response.setHeader('content-type', 'text/plain');
				// response.end('Error: bad POST path');
				// return;
			// }
		// }
		
		//host files
        if (parsedUrl.pathname === '/') {
            parsedUrl.pathname = '/index.html';
        }
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