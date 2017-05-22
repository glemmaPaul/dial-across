import _ from './env'

import path from 'path'
import express from 'express'
import dialAcross from './src/app'
import config from 'config'

var app = express()
app = dialAcross.attach(app)

app.use(express.static('build'))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(config.get('Server.port'), () => {
    console.log("Successfully attached to " + config.get('Server.port'))
})
