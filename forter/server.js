

var http = require('http');
var url = require('url');
var bl = require('bl');
var uuid = require('node-uuid');

var PORT = 8081;
var credit_cards = {};

/**
 * Stores a credit card in our database.
 * 
 * @param {string} card - credit card number
 * @returns {string} token - unique ID that represents the credit card token
 */
function store_card(card) {

    //TODO: check if already exists
    var token = uuid.v4();
    credit_cards[token] = card;

    return token;

}

/**
 * Stores a credit card in our database.
 * 
 * @param {string} token - the credit card's token
 * @returns {string} card - the credit card number that matches this token
 */
function get_card(token) {

    //TODO: Handle errors
    return credit_cards[token];
    
}

/**
 * Main server logic - handle POST and GET requests
 */
var server = http.createServer(function (request, response) {
    
    response.writeHead(200, { 'Content-Type': 'application/json' });
    var uri = url.parse(request.url).pathname;

    switch (request.method) {

        // Adding a new credit card to the database
        case "POST":

            if (uri == "/creditcard") {

                // Extract card number from data and create response
                var card;
                request.pipe(bl(function(err, data) {
                    if (err) {
                        console.error("error reading request data");
                    } else {
                        card = JSON.parse(data.toString())["credit-card"];

                        // Save card and respond with token
                        response.end(JSON.stringify({
                        "token" : store_card(card),
                        }));
                    }
                }));

            // Bad URI
            } else {
                console.error("bad uri: '", uri, "'");
                response.end();
            }
            break;

        // Querying the database for a credit card using a token
        case "GET":
            
            // Extract token from URI
            var uri_regex = /creditcard\/([\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12})$/gi.exec(uri)
            if (uri_regex) {
                var token = uri_regex[1];

                // Find card number and respond with credit card number
                response.end(JSON.stringify({
                "credit-card" : get_card(token),
                }));

            // Bad URI
            } else {
                console.error("bad uri: '", uri, "'");
                response.end();
            }
            break;

        default:
            console.error("unable to handle request method '", request.method, "'");
            response.end();
    }

});

server.listen(PORT);

