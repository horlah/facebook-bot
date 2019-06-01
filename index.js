"use strict";

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express().use(bodyParser.json()); // creates express http server

const PAGE_ACCESS_TOKEN = 'EAAFLncrZCnYMBAEweIJPeYi3Yzv8bOw3uUUzKVTgNdxko1cBx05jRWuwwLZAvCJ2YTl0L2uWc27WT1DwRdV7TR4zGsbmyRZCEWygH32JELPYL9rZAQiLyBTZAq6civdhq1fYOgLEeFV3VZAUKAqT0051pzTWqZAfaDVlCcqJxxWfmb00O4k47zo';
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337);

app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "TOKENFORTHEBAG";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach((entry) => {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];

            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
        if (received_message.text === 'Hello' || received_message.text === 'Hi' || received_message.text === 'Hey' || received_message.text === 'Yo') {
            response = {
                "text": `${received_message.text} Human, what's good`,
                "quick_replies": [
                    {
                        "content_type": "text",
                        "title": "Cool!",
                        "payload": "Cool"
                    },
                    {
                        "content_type": "text",
                        "title": "Nice!",
                        "payload": "Nice"
                    },
                    {
                        "content_type": "text",
                        "title": "Awesome!",
                        "payload": "Awesome"
                    },
                    {
                        "content_type": "text",
                        "title": "Incredible!",
                        "payload": "Incredible"
                    },
                    {
                        "content_type": "text",
                        "title": "Fantastic!",
                        "payload": "Fantastic"
                    },
                    {
                        "content_type": "text",
                        "title": "Wooow!",
                        "payload": "Wooow"
                    }
                ]
            };
        } else {
            response = {"text": `You sent the message: "${received_message.text}". Now send me an image!`};
        }
    } else if (received_message.attachments) {

        // Gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        };
    } 

    // Sends the response message
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { "text": "Thanks!" };
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." };
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

function sendQuickAction() {
    
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!!');
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}