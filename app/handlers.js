'use strict'

import config from 'config'
import twilio from 'twilio'
import { PoliticalSides, Receiver } from './models'
import Promise from 'bluebird'

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

    twiml.say(`You selected ${preference.name}. We will now try to find you someone to talk to.`).pause()

    twiml.redirect('/calls/redirect/')

    return twiml
}

/**
 * Redirects caller to someone of different aisle
 * @param  {models.Call} call object
 * @return {Promise -> TwimlResponse} for async resolve of receiver
 */
export function handleDialRedirectForCall(call) {
    return new Promise((resolve, reject) => {
        let twiml = new twilio.TwimlResponse();

        let query = {
            phoneNumber: {$ne: call.fromNumber},
            politicalSide: {$ne: call.politicalSide}
        }

        Receiver.findRandom(query, {}, {count: 1},
            (error, results) => {
                if (error) {
                    throw error
                }

                if (results) {
                    let receiver = results.pop()
                    call.toNumber = receiver.phoneNumber
                    call.save()

                    twiml.say(`We are now connecting you with someone from across the aisle.`).pause()
                    twiml.dial({
                        callerId: config.get('Calls.twilioNumber'),
                        hangupOnStar: true
                    }, receiver.phoneNumber)
                }
                else {
                    twiml.say("We were not able to find anyone at this moment, try again later.")
                }

                resolve(twiml)
            })
    })
}
