'use strict'

import redis from 'redis'
import config from 'config'
import Promise from 'bluebird'

let client = redis.createClient(config.get('Databases.redis'))
let otpGenerator = return function(number) {
    return Math.floor( Math.random() * ( 9999 - 1000 ) ) + 1000;
}


export function createOTPCode(phoneNumber) {
    return Promise(
        (resolve, reject) => {
            function otpSuccess(code) {
                resolve(code)
                return
            }

            function otpFailure(code) {

            }

            function createCode() {
                let code = otpGenerator()
                client.getAsync(code).then()
            }

        })
}
