'use strict';

function Skill(appId) {
  this._appId = appId;
}

Skill.speechOutputType = {
  PLAIN_TEXT: 'PlainText',
  SSML: 'SSML'
};

Skill.prototype.requestHandlers = {
  LaunchRequest: function(event, context, response) {
    this.eventHandlers.onLaunch.call(this, event.request, event.session, response);
  }, 
  IntentRequest: function (event, context, response) {
    this.eventHandlers.onIntent.call(this, event.request, event.session, response);
  },
  SessionEndedRequest: function (event, context) {
    this.eventHandlers.onSessionEnded(event.request, event.session);
    context.succeed();
  }
};

Skill.prototype.execute = function(event, context) {
  console.log(event.request.type);
  var requestHandler = this.requestHandlers[event.request.type];
  requestHandler.call(this, event, context, new Response(context, event.session));
};

Skill.prototype.eventHandlers = {
  onSessionStarted: function (sessionStartedRequest, session) {
    
  },
  onLaunch: function(launchRequest, session, response) {

  },
  onIntent: function (intentRequest, session, response) {
    let intent = intentRequest.intent,
      intentName = intentRequest.intent.name,
      intentHandler = this.intentHandlers[intentName];
    if (intentHandler) {
      intentHandler.call(this, intent, session, response);
    } else {
      throw 'Unsupported intent = ' + intentName;
    }
  },
  onSessionEnded: function (sessionEndedRequest, session) {
  }
};

let Response = function (context, session) {
  this._context = context;
  this._session = session;
};

function createSpeechObject(optionsParam) {
  if (optionsParam && optionsParam.type === 'SSML') {
    return {
      type: optionsParam.type,
      ssml: optionsParam.speech
    };
  } else {
    return {
      type: optionsParam.type || 'PlainText',
      text: optionsParam.speech || optionsParam
    };
  }
}

Response.prototype = (function () {
  let buildSpeechletResponse = function (options) {
    let alexaResponse = {
      outputSpeech: createSpeechObject(options.output),
      shouldEndSession: options.shouldEndSession
    };
    if (options.reprompt) {
      alexaResponse.reprompt = {
        outputSpeech: createSpeechObject(options.reprompt)
      };
    }
    if (options.cardTitle && options.cardContent) {
      alexaResponse.card = {
        type: 'Simple',
        title: options.cardTitle,
        content: options.cardContent
      };
    }
    let returnResult = {
      version: '1.0',
      response: alexaResponse
    };
    if (options.session && options.session.attributes) {
      returnResult.sessionAttributes = options.session.attributes;
    }
    return returnResult;
  };

  return {
    tell: function (speechOutput) {
      this._context.succeed(buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        shouldEndSession: true
      }));
    },
    tellWithCard: function (speechOutput, cardTitle, cardContent) {
      this._context.succeed(buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        cardTitle: cardTitle,
        cardContent: cardContent,
        shouldEndSession: true
      }));
    },
    ask: function (speechOutput, repromptSpeech) {
      this._context.succeed(buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        reprompt: repromptSpeech,
        shouldEndSession: false
      }));
    },
    askWithCard: function (speechOutput, repromptSpeech, cardTitle, cardContent) {
      this._context.succeed(buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        reprompt: repromptSpeech,
        cardTitle: cardTitle,
        cardContent: cardContent,
        shouldEndSession: false
      }));
    }
  };
})();


module.exports = Skill; 