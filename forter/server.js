#!/usr/bin/nodejs

var http = require('http');
var url = require('url');
var bl = require('bl');
var uuid = require('node-uuid');
var redis = require('redis');
var luhn = require('luhn').luhn;
var ZSchema = require('z-schema');


var PORT = 8081;
var redis_client = redis.createClient();

//ZSchema.registerFormat("credit-card", luhn.validate);
var validator = new ZSchema();


/**
 * Removes any hyphens from the credit card number
 * 
 * @param {string} card - credit card number with / without hyphens
 * @returns {string} clean_card - creditcard number without hyphens (only digits)
 */
function format_card(card) { 
    return card.replace(/-/g,"");
}

/**
 * Stores a credit card in our database.
 * 
 * @param {string} card - credit card number
 * @returns {string} token - unique ID that represents the credit card token
 */
function store_card(card) {

    if (!luhn.validate(card)) {
        console.error("bad credit card number:", card);
        return "bad credit card number: " + card;
    }

    //TODO: check if already exists
    var token = uuid.v4();
    redis_client.set(token, card);

    return token;

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
                request.pipe(bl(function(err, data) {
                    if (err) {
                        console.error("error reading request data");
                    } else {
                        
                        var json = JSON.parse(data.toString());
                        var json_schema = {
                                properties: {
                                    "credit-card": { type: "string" }
                                },
                                required: ["credit-card"]
                        };

                        // Make sure the JSON schema is valid
                        if (validator.validate(json, json_schema)) {

                            // Save card and respond with token
                            response.end(JSON.stringify({
                            "token" : store_card(format_card(json["credit-card"])),
                            }));

                        } else {
                            console.error("invalid input JSON:", data.toString());
                            response.end("invalid input JSON: " + data.toString() + "\n");
                        }
                    }
                }));

            // Bad URI
            } else {
                console.error("bad uri: '", uri, "'");
                response.end("bad uri: '" + uri + "'\n");
            }
            break;

        // Querying the database for a credit card using a token
        case "GET":
            
            // Extract token from URI
            var uri_regex = /creditcard\/([\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12})$/gi.exec(uri)
            if (uri_regex) {
                var token = uri_regex[1];

                // Find card number and respond with credit card number
                redis_client.get(token, function(err, reply) {
                    if (err) {
                        console.log("redis error:", err);
                    } else {
                        response.end(JSON.stringify({
                        "credit-card" : reply,
                        }));
                    }
                });
                
            // Bad URI
            } else {
                console.error("bad uri: '", uri, "'");
                response.end("bad uri: '" + uri + "'\n");
            }
            break;

        default:
            console.error("unable to handle request method '", request.method, "'");
            response.end("unable to handle request method '" + request.method + "'\n");
    }

});

server.listen(PORT);

