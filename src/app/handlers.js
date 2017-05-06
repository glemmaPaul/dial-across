'use strict'

import config from 'config'
import twilio from 'twilio'
import { PoliticalSides, Receiver } from './models'
import Promise from 'bluebird'
import debug from 'debug'

var logger = debug('app.handlers')
var twilioClient = new twilio.RestClient(
    config.get('Twilio.accountSid'), config.get('Twilio.authToken'));

/**
 * Creates TwimlResponse for incoming call to capture input
 * @return {TwimlResponse}
 */
export function createTwimlIncomingCall() {
    let twiml = new twilio.TwimlResponse()

    // Use the <Gather> verb to collect user input
    twiml.gather({ numDigits: 1 }, (gatherNode) => {
        let preferenceText = PoliticalSides.map(function(preference, index) {
            return ` Press ${index + 1} if you lean towards ${ preference.name }`
        }).join(',.. or')
        gatherNode.say('Welcome to dial across the aisle. Before we can connect you through to someone,' +
                       ' we would like to know your political preference.' + preferenceText)
    });

    return twiml
}

/**
 * Creates Twiml object that responds to digit input
 * @param  {models.Call} call   object
 * @param  {Integer} digits value input
 * @return {TwimlResponse}
 */
export function handlePoliticalPreferenceResponse(call, digits) {
    let twiml = new twilio.TwimlResponse();
    var preferenceIndex = parseInt(digits) - 1

    // Check if is in table, if not try again
    if (preferenceIndex < 0 || preferenceIndex > PoliticalSides.length - 1) {
        twiml.say('Sorry, I don\'t understand that choice.').pause();
        twiml.redirect('/calls/create/')

        return twiml
    }

    let preference = PoliticalSides[preferenceIndex]

    call.politicalSide = preference.value
    call.save()

    twiml.say(`You selected ${preference.name}. Give us a moment to connect you with someone.`).pause()

    twiml.redirect('/calls/start/')

    return twiml
}

/**
 * Redirects caller to someone of different aisle
 * @param  {models.Call} call object
 * @return {Promise -> TwimlResponse} for async resolve of receiver
 */
export function lookupReceiverForCall(call) {
    return new Promise((resolve, reject) => {
        let twiml = new twilio.TwimlResponse();

        let query = {
            phoneNumber: {$ne: call.fromNumber},
            politicalSide: {$ne: call.politicalSide}
        }

        Receiver.getRandomCaller(query).then(
            (receiver) => {
                call.toNumber = receiver.phoneNumber
                call.save()

                twiml.say(`We've found someone from across the Aisle,.. Connecting you through now.`)
                twiml.dial((dialNode) => {
                    dialNode.conference(conferenceKey(call), {
                        startConferenceOnEnter: true
                    });
                })

                sendOutboundCall(call, receiver)

                return twiml
            },
            (error) => {
                twiml.say("We're not able to find anyone at this moment, try another time.")
            }).then(resolve, reject)
    })
}

export function createRequestReceiverJoining(call) {
    let twiml = new twilio.TwimlResponse()

    twiml.say('We are connecting you to a caller from Dial Across The Aisle.')
    twiml.gather({
        numDigits: 1,
        action: apiURL(`/calls/join/${call.twilioId}`),
        method: 'POST'
    }, (gatherNode) => {
        gatherNode.say("Press any key to accept the call.")
    })

    twiml.say("Sorry, did not get any response")
    twiml.hangup()

    return twiml
}

export function connectReceiverWithCall(call) {
    let twiml = new twilio.TwimlResponse()
    twiml.dial((dialNode) => {
        dialNode.conference(conferenceKey(call), {
            startConferenceOnEnter: false
        });
    })

    return twiml
}

/**
 * Creates an outbound call to a receiver
 * @param  {models.Call} call
 * @param  {models.Receiver} receiver
 */
function sendOutboundCall(call, receiver) {
    twilioClient.calls.create({
        url: apiURL(`/calls/invite/${call.twilioId}/`),
        to: receiver.phoneNumber,
        from: config.get('Twilio.fromNumber')
    }, function(err, twilioCall) {
        if (err) {
            logger(err)
        }
        debug(`Outbound call created to ${receiver.phoneNumber}`)

        call.outboutTwilioId = twilioCall.sid
        call.save()
    });
}

function conferenceKey(call) {
    debug("queue:" + call.twilioId)
    return "conference " + call.twilioId
}

function apiURL(route) {
    return config.get('Server.baseURL') + route
}
