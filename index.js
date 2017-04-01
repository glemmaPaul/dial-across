import express from 'express'
import dialAcross from './app'
import config from 'config'

var app = express()
app = dialAcross.attach(app)

app.listen(config.get('Server.port'), function() {
    console.log("Successfully attached to " + config.get('Server.port'))
})
