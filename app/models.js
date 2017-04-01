'use strict'
import mongoose from 'mongoose'
import config from 'config'
import Promise from 'bluebird'
import { e164 } from 'libphonenumber'
import random from 'mongoose-simple-random'


mongoose.connect(config.get('Databases.mongodb'), (error) => {
    if (error) {
        throw error
    }

    console.log('mongodb connected.')
})
mongoose.Promise = Promise

let validatePhone = {
    validator: function(v, cb) {
        e164(v, 'US', function(error, result) {
            // Check if anonymous call
            if (error && v != '+266696687') {
                return cb(false)
            }

            cb(true)
        })
    },
    isAsync: true,
    message: '{VALUE} is not a valid phone number'
}

let politicalSides = [
    {
        name: "Republican",
        value: "republican"
    },
    {
        name: "Liberal",
        value: "liberal"
    }
]

let callSchema = new mongoose.Schema({
    fromNumber: {
        type: String,
        validate: validatePhone,
        required: [true, 'From Number is required.']
    },
    toNumber: {
        type: String,
        validate: validatePhone
    },
    twilioId: String,
    politicalSide: {
        type: String,
        enum: politicalSides.map(function(v) { v.value }),
        required: [false, ]
    }
})

callSchema.statics.getCallByTwilio = function(twilioId, defaultData) {
    const self = this;

    return new Promise((resolve, reject) => {
        self.findOne({twilioId: twilioId}, (err, result) => {
            if (err) {
                reject(err)
            }

            if (result) {
                resolve(result)
            }

            defaultData.twilioId = twilioId

            self.create(defaultData).then(function(result) {
                resolve(result)
            }, reject);
        });
    })

}

let receiverSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        validate: validatePhone,
        required: [true, 'User phone number required'],
        index: { unique: true }
    },
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"]
    },
    politicalSide: {
        type: String,
        enum: politicalSides.map(function(v) { v.value }),
        required: [false, ]
    }
})

receiverSchema.plugin(random)


export const Receiver = mongoose.model('Receiver', receiverSchema)
export const Call = mongoose.model('Call', callSchema)
export const PoliticalSides = politicalSides


