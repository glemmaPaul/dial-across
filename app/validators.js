'use strict'
import Joi from 'joi'


/**
 * required properties for sign up form
 */
export const signupSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required()
})
