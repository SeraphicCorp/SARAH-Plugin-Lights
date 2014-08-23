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
        this.on = null;
        this.sat = null;
        this.bri = null;
        this.hue = null;
        this.ct = null;
        this.alert = null;
        this.effect = null;
    };
    PhilipsHue.prototype = Object.create(PhilipsHue.prototype);
    PhilipsHue.prototype.addValue = function(value, addedValue, limit) {
        return (limit + value + addedValue) % limit;
    };
    PhilipsHue.prototype.switchOn = function(value) {
        this.on = value !== '0';
    };
    PhilipsHue.prototype.setSaturation = function(value) {
        this.sat = value;
    };
    PhilipsHue.prototype.moreSaturation = function(value) {
        this.sat = addValue(this.sat, value, 256);
    };
    PhilipsHue.prototype.lessSaturation = function(value) {
        this.sat = addValue(this.sat, -1 * value, 256);
    };
    PhilipsHue.prototype.setBrightness = function(value) {
        this.bri = value;
    };
    PhilipsHue.prototype.moreBrightness = function(value) {
        this.bri = addValue(this.bri, value, 256);
    };
    PhilipsHue.prototype.lessBrightness = function(value) {
        this.bri = addValue(this.bri, -1 * value, 256);
    };
    PhilipsHue.prototype.setHue = function(value) {
        this.hue = value;
    };
    PhilipsHue.prototype.moreHue = function(value) {
        this.hue = addValue(this.hue, value, 65536);
    };
    PhilipsHue.prototype.lessHue = function(value) {
        this.hue = addValue(this.hue, -1 * value, 65536);
    };
    PhilipsHue.prototype.setTemperature = function(value) {
        this.ct = value;
    };
    PhilipsHue.prototype.colder = function(value) {
        this.ct = addValue(this.ct, -1 * value, 500 - 153) + 153;
    };
    PhilipsHue.prototype.hotter = function(value) {
        this.ct = addValue(this.ct, -1 * value, 500 - 153) + 153;
    };
    PhilipsHue.prototype.setAlert = function(value) {
        this.alert = value !== '0' ? 'select' : 'none';
    };
    PhilipsHue.prototype.setEffect = function(value) {
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
    var showWebserviceReturn = function(body) {
        log('Return', 'DEBUG');
        log(body, 'DEBUG');
    };
    var executeOperation = function(instance, operation, param) {
        if (typeof instance[operation] !== 'function') {
            log(operation + t('is-an-unknown-operation'));
            return;
        }
        log('Setting ' + instance.id + ' with ' + operation + ' ' + param, 'DEBUG');
        instance[operation](param);
    };
    PhilipsHue.prototype.execute = function(params) {
        var instance = this;
        log('Executing changes for Philips Hue ' + instance.id, 'DEBUG');
        var treat = function(currentState) {
            instance.update(currentState.state);
            for (var operation in params) {
                executeOperation(instance, operation, params[operation]);
            }
            bridge.put('lights/' + instance.id + '/state', instance.extractRequest(), showWebserviceReturn);
        };
        bridge.get('lights/' + this.id, treat);
    };


    var bridge = {
        get: function(path, callback) {
            bridge.request(path, {}, callback);
        },
        post: function(path, body, callback) {
            bridge.request(path, {'method': 'post', 'body': JSON.stringify(body)}, callback);
        },
        put: function(path, body, callback) {
            bridge.request(path, {'method': 'put', 'body': JSON.stringify(body)}, callback);
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
                    log(t('philips-hue-user-configuration'));
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
                    bridge.post(false, {
                        'devicetype': 'S.A.R.A.H.',
                        'username': config['philips-hue']['api-user']
                    }, function(json) {
                        if (json.tts || json[0].error) {
                            state.user = false;
                            log(t('philips-hue-bridge-unreachable'));
                            log(json.tts || json[0].error.description);
                            return;
                        }
                        state.user = true;
                        config['philips-hue']['api-user'] = json[0].success.username;
                        log(t('philips-hue-user-created') + ' : ' + config['philips-hue']['api-user']);
                    });
                };
                bridge.get('', callback);
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