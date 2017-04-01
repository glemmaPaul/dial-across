'use strict'

// Imports
import bodyParser from 'body-parser'
import Joi from 'joi'

import * as validators from './validators'
import { Receiver, Call } from './models'
import * as controllers from './handlers'


/**
 * Attach to an express app
 * @param  {express()} app
 * @return {express()} app
 */
function attach(app) {

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // Our app uses a lot of application/json values
    app.use(bodyParser.json())

    /**
     * Twilio Create Callback Endpoint
     * @param  {route} '/calls/create/'
     * @param  {function} Handler for twilio
     */
    app.post('/calls/create/', (request, response) => {
        var twiml;

        Call.getCallByTwilio(request.body.CallSid, {
            fromNumber: request.body.From
        }).then(function(call) {

            if (request.body.Digits) {
                twiml = controllers.handlePoliticalPreferenceResponse(call, request.body.Digits)
            }
            else {
                twiml = controllers.createTwimlIncomingCall()
            }

            // Render the response as XML in reply to the webhook request
            response.type('text/xml');
            response.send(twiml.toString());

        }, function(error) {
            console.log(error)
        })

    })

    /**
     * Redirects call to random receiver
     * @param  {route}   '/calls/redirect/'
     * @param  {Function} callback
     */
    app.post('/calls/redirect/', (request, response) => {
        Call.getCallByTwilio(request.body.CallSid, {
            fromNumber: request.body.From
        }).then(
            (call) => {
                controllers.handleDialRedirectForCall(call).then((twiml) => {
                    // Render the response as XML in reply to the webhook request
                    response.type('text/xml');
                    response.send(twiml.toString());
                })


            },
            (err) => {
                console.log(err)
            }
        )
    })

    /**
     * Twilio Redial Callback Endpoint
     * @param  {route} '/calls/dial/'
     * @param  {function} Handler for twilio
     */
    app.post('/calls/dial/:call-id', (request, response) => {
        var twiml;

        if (request.body.Digits) {
            twiml = controllers.handlePoliticalPreferenceResponse(request.body.Digits)
        }
        else {
            twiml = controllers.createTwimlIncomingCall()
        }

        // Render the response as XML in reply to the webhook request
        response.type('text/xml');
        response.send(twiml.toString());
    })


    /**
     * Twilio status callback
     * @param  {route} '/twilio/status/'
     * @param  {function} Handler for twilio status
     */
    app.post('/call/status/:callId', (req, res) => {
        res.send("twilio status")
    })

    /**
     * Sign Up Endpoint
     * @param  {route} '/sign-up/'
     * @param  {function} Handler for signup
     */
    app.post('/sign-up/', (request, response) => {
        const result = Joi.validate(request.body, validators.signupSchema)

        if (result.error === null) {
            let receiver = new Receiver(request.body)
            receiver.save().then(console.log, console.log)

            return response.status(204).send(null)
        }

        return response.send(result.error.details)
    })

    return app
}

exports.attach = attach
