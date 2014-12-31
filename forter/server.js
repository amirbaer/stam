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
                        
                        // Try to parse JSON
                        try {
                            var json = JSON.parse(data.toString());
                        // Error parsing JSON
                        } catch(err) {
                            console.error("ERROR:", err.message);
                            response.end("error parsing JSON: " + err.message + "\n");
                            return;
                        }
                        var json_schema = {
                                properties: {
                                    "credit-card": { type: "string" }
                                },
                                required: ["credit-card"]
                        };

                        // Make sure the JSON schema is valid
                        if (validator.validate(json, json_schema)) {

                            var card = format_card(json["credit-card"]);

                            // Validate card number
                            if (!luhn.validate(card)) {
                                console.error("bad credit card number:", card);
                                response.end("bad credit card number: " + card + "\n");
                                return;
                            }

                            //TODO: check if already exists
                            // Generate token and save to database
                            var token = uuid.v4();
                            redis_client.set(token, card);

                            // Save card and respond with token
                            response.end(JSON.stringify({
                            "token" : token,
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

