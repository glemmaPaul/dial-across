'use strict'
import Joi from 'joi'
import ValidPhone from 'joi-phone'

import { PoliticalSides } from './models'

var phoneNumberValidator = ValidPhone.e164().required()
var politicalSides = PoliticalSides.map(function(v) { return v.value })


/**
 * required properties for sign up form
 */
export const signupSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: phoneNumberValidator, // US Phone number valid (for now)
    politicalSide: Joi.string().valid(politicalSides)
})


/**
 * required properties for notify form
 */
export const notifySchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: phoneNumberValidator // US Phone number valid (for now)
})
