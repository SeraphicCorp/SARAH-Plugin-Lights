var Light = require('./light');
var request = require('request');

// This way of coding is to initialize config, log, translationEngine in the module
var PhilipsHueModule = function(config, log, translationEngine) {

    var t = translationEngine;

    var state = {
        'configuration': false,
        'user': false
    };

    var PhilipsHue = function(id) {
        this.id = id;
        this.on;
        this.sat;
        this.bri;
        this.hue;
        this.ct;
        this.alert;
        this.effect;
    };
    PhilipsHue.prototype = Object.create(PhilipsHue.prototype);
    PhilipsHue.prototype.addValue = function(value, addedValue, limit) {
        return (limit + value + addedValue) % limit;
    };
    PhilipsHue.prototype.on = function(value) {
        this.on = value;
    };
    PhilipsHue.prototype.saturation = function(value) {
        this.sat = value;
    };
    PhilipsHue.prototype.moreSaturation = function(value) {
        this.sat = addValue(this.sat, value, 256);
    };
    PhilipsHue.prototype.lessSaturation = function(value) {
        this.sat = addValue(this.sat, -1 * value, 256);
    };
    PhilipsHue.prototype.brightness = function(value) {
        this.bri = value;
    };
    PhilipsHue.prototype.moreBrightness = function(value) {
        this.bri = addValue(this.bri, value, 256);
    };
    PhilipsHue.prototype.lessBrightness = function(value) {
        this.bri = addValue(this.bri, -1 * value, 256);
    };
    PhilipsHue.prototype.hue = function(value) {
        this.hue = value;
    };
    PhilipsHue.prototype.moreHue = function(value) {
        this.hue = addValue(this.hue, value, 65536);
    };
    PhilipsHue.prototype.lessHue = function(value) {
        this.hue = addValue(this.hue, -1 * value, 65536);
    };
    PhilipsHue.prototype.temperature = function(value) {
        this.ct = value;
    };
    PhilipsHue.prototype.colder = function(value) {
        this.ct = addValue(this.ct, -1 * value, 500 - 153) + 153;
    };
    PhilipsHue.prototype.hotter = function(value) {
        this.ct = addValue(this.ct, -1 * value, 500 - 153) + 153;
    };
    PhilipsHue.prototype.alert = function(value) {
        this.alert = value ? 'select' : 'none';
    };
    PhilipsHue.prototype.effect = function(value) {
        this.effect = value;
    };
    PhilipsHue.prototype.update = function(currentState) {
        this.on = currentState.on;
        this.sat = currentState.sat;
        this.bri = currentState.bri;
        this.hue = currentState.hue;
        this.ct = currentState.ct;
        this.alert = currentState.alert;
        this.effect = currentState.effect;
    };
    PhilipsHue.prototype.extractRequest = function() {
        return {
            on: this.on,
            sat: this.sat,
            bri: this.bri,
            hue: this.hue,
            ct: this.ct,
            alert: this.alert,
            effect: this.effect
        };
    };
    PhilipsHue.prototype.execute = function(params) {
        var treat = function(currentState) {
            this.update(currentState.state);
            for (var operation in params) {
                if (typeof this[operation] !== 'function') {
                    log(operation + t('is-an-unknown-operation'));
                    continue;
                }
                this[operation](params[operation]);
            }
            network.put('lights/' + this.id + '/state', this.extractRequest, config);
        };
        network.get('lights/' + id, config, treat);
    };


    var network = {
        get: function(path, callback) {
            request(path, {}, callback);
        },
        post: function(path, body, callback) {
            request(path, {'method': 'post', 'body': JSON.stringify(body)}, callback);
        },
        put: function(path, body, callback) {
            request(path, {'method': 'put', 'body': JSON.stringify(body)}, callback);
        },
        request: function(path, data, callback) {
            data.uri = 'http://' + config['philips-hue']['hub-address'] + '/api' + (path !== false ? '/' + config['philips-hue']['api-user'] + '/' + path : '');
            data.json = true;
            request(data, function(err, response, json) {
                if (err || response.statusCode !== 200) {
                    callback({'tts': t('philips-hue-bridge-unreachable')});
                    return;
                }
                if (callback) {
                    callback(json);
                }
            });
        }
    };

    var canUse = function() {
        var test = {
            configuration: function() {
                var valid = config['philips-hue']['hub-address'] && config['philips-hue']['api-user'];
                if (!valid) {
                    log(t('philips-hue-incomplete-configuration'));
                    state.configuration = false;
                }
                state.configuration = true;
            },
            user: function() {
                var callback = function(json) {
                    // A TTS means an error
                    if (json.tts) {
                        state.user = false;
                        log(t('philips-hue-bridge-unreachable'));
                        return;
                    }
                    // User alread exists
                    if (!(json instanceof Array)) {
                        state.user = true;
                        return;
                    }
                    // Create a new user
                    network.post(false, {
                        'devicetype': 'SARAH',
                        'username': config.username
                    }, config, function(json) {
                        if (json.tts || json[0].error) {
                            state.user = false;
                            log(t('philips-hue-bridge-unreachable'));
                            log(json.tts || json[0].error.description);
                            return;
                        }
                        state.user = true;
                        log(t('user-created-user-created'));
                    });
                };
                network.get('', callback);
            }
        };

        if (config['philips-hue']) {
            test.configuration();
            test.user();
        }
    };

    canUse();

    return {
        PhilipsHue: PhilipsHue,
        state: state
    };
};

exports.PhilipsHueModule = PhilipsHueModule;