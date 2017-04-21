'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
app = _app2.default.attach(app);

app.listen(_config2.default.get('Server.port'), function () {
    console.log("Successfully attached to " + _config2.default.get('Server.port'));
});