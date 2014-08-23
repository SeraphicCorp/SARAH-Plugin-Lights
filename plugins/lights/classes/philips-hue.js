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
        this.valuesToExtract = [];
    };
    PhilipsHue.prototype = Object.create(PhilipsHue.prototype);
    PhilipsHue.prototype.adaptValue = function(value, limit) {
        var newValue = (limit + parseInt(value)) % limit;
        log('New value', 'DEBUG');
        log(newValue, 'DEBUG');
        return newValue;
    };
    PhilipsHue.prototype.switchOn = function(value) {
        var newValue = value !== '0';
        if (this.on === newValue){
            return;
        }
        this.on = newValue;
        this.valuesToExtract.push('on');
    };
    PhilipsHue.prototype.setSaturation = function(value) {
        this.sat = this.adaptValue(value, 256);
        this.valuesToExtract.push('sat');
    };
    PhilipsHue.prototype.moreSaturation = function(value) {
        this.setSaturation(this.sat + parseInt(value));
    };
    PhilipsHue.prototype.lessSaturation = function(value) {
        this.setSaturation(this.sat - parseInt(value));
    };
    PhilipsHue.prototype.setBrightness = function(value) {
        this.bri = this.adaptValue(value, 256);
        this.valuesToExtract.push('bri');
    };
    PhilipsHue.prototype.moreBrightness = function(value) {
        this.setBrightness(this.bri + parseInt(value));
    };
    PhilipsHue.prototype.lessBrightness = function(value) {
        this.setBrightness(this.bri - parseInt(value));
    };
    PhilipsHue.prototype.setHue = function(value) {
        this.hue = this.adaptValue(value, 65536);
        this.valuesToExtract.push('hue');
    };
    PhilipsHue.prototype.moreHue = function(value) {
        this.setHue(this.hue + parseInt(value));
    };
    PhilipsHue.prototype.lessHue = function(value) {
        this.setHue(this.hue - parseInt(value));
    };
    PhilipsHue.prototype.setTemperature = function(value) {
        this.ct = this.adaptValue(value, 500 - 153) + 153;
        this.valuesToExtract.push('ct');
    };
    PhilipsHue.prototype.colder = function(value) {
        this.setTemperature(this.ct - parseInt(value));
    };
    PhilipsHue.prototype.hotter = function(value) {
        this.setTemperature(this.ct + parseInt(value));
    };
    PhilipsHue.prototype.setAlert = function(value) {
        this.alert = value !== '0' ? 'select' : 'none';
        this.valuesToExtract.push('alert');
    };
    PhilipsHue.prototype.setEffect = function(value) {
        this.effect = value;
        this.valuesToExtract.push('effect');
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
        var extract = {};
        for (var index in this.valuesToExtract){
            extract[this.valuesToExtract[index]] = this[this.valuesToExtract[index]];
        }
        return extract;
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
        log('Done', 'DEBUG');
    };
    PhilipsHue.prototype.execute = function(params) {
        var instance = this;
        log('Executing changes for Philips Hue ' + instance.id, 'DEBUG');
        var treat = function(currentState) {
            log('currentState', 'DEBUG');
            log(currentState, 'DEBUG');
            instance.update(currentState.state);
            for (var operation in params) {
                executeOperation(instance, operation, params[operation]);
            }
            var body = instance.extractRequest();
            log('request', 'DEBUG');
            log(body, 'DEBUG');
            bridge.put('lights/' + instance.id + '/state', body, showWebserviceReturn);
        };
        bridge.get('lights/' + instance.id, treat);
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