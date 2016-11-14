'use strict';

const TwilioSkill = require('./skill.js');
const Global = require('./exports.js');
const accountSid = Global.accountSid;
const authToken = Global.authToken;
const t = require('twilio');
const client = new t.RestClient(accountSid, authToken);
const twilioNumber = Global.twilioNumber;
const APP_ID = '';

let Twilio = function() {
  TwilioSkill.call(this, APP_ID);
};

Twilio.prototype = Object.create(TwilioSkill.prototype);
Twilio.prototype.constructor = Twilio;

Twilio.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
};

Twilio.prototype.intentHandlers = {
  'SendMessage': function (intent, session, response) {
    sendMessage(intent, session, response);
  },
  'AMAZON.HelpIntent': function (intent, session, response) {
    response.ask('You can say hello to me!', 'You can say hello to me!');
  }
};

let sendMessage = (intent, session, AlexaResponse) => {
    let name = intent.slots.name.value;
    let text = intent.slots.message.value;

    client.messages.create({
        body: text,
        to: Global.contactNumber,  
        from: twilioNumber 
    }, function(err, message) {
        AlexaResponse.tell('Your message has been sent to ' + name);
    });
};

exports.handler = (event, context) => {
    let twilio = new Twilio();
    twilio.execute(event, context);
};