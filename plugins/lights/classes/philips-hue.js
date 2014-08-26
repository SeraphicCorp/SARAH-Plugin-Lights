var request = require('request');

// This way of coding is to initialize config, logger, translationEngine in the module
var PhilipsHueModule = function(config, Log, translationEngine) {
    var RGBLight = require('./rgb-light').RGBLightModule(config, Log, translationEngine, 'Philips Hue').RGBLight;
    var t = translationEngine;

    var state = {
        'configuration': false,
        'user': false
    };

    var PhilipsHue = function(id) {
        this.base = RGBLight;
        this.base(id);
        this.alert = null;
        this.effect = null;
    };
    PhilipsHue.prototype = new RGBLight;

    PhilipsHue.prototype.PROTOCOL_MIN_BRIGHTNESS = 0;
    PhilipsHue.prototype.PROTOCOL_MAX_BRIGHTNESS = 255;
    PhilipsHue.prototype.PROTOCOL_MIN_SATURATION = 0;
    PhilipsHue.prototype.PROTOCOL_MAX_SATURATION = 255;
    PhilipsHue.prototype.PROTOCOL_MIN_HUE = 0;
    PhilipsHue.prototype.PROTOCOL_MAX_HUE = 65535;
    PhilipsHue.prototype.PROTOCOL_MIN_TEMPERATURE = 153;
    PhilipsHue.prototype.PROTOCOL_MAX_TEMPERATURE = 500;

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
        this.saturation = this.scale(currentState.sat, this.PROTOCOL_MIN_SATURATION, this.PROTOCOL_MAX_SATURATION, this.MIN_SATURATION, this.MAX_SATURATION);
        this.brightness = this.scale(currentState.bri, this.PROTOCOL_MIN_BRIGHTNESS, this.PROTOCOL_MAX_BRIGHTNESS, this.MIN_BRIGHTNESS, this.MAX_BRIGHTNESS);
        this.hue = this.scale(currentState.hue, this.PROTOCOL_MIN_HUE, this.PROTOCOL_MAX_HUE, this.MIN_HUE, this.MAX_HUE);
        this.temperature = this.scale(currentState.ct, this.PROTOCOL_MIN_TEMPERATURE, this.PROTOCOL_MAX_TEMPERATURE, this.MIN_TEMPERATURE, this.MAX_TEMPERATURE);
        this.alert = currentState.alert;
        this.effect = currentState.effect;
    };

    var adaptName = function(type){
        switch(type){
            case 'saturation': return 'sat';
            case 'brightness': return 'bri';
            case 'temperature': return 'ct';
            default: return type;
        }
    };

    var adaptValue = function(type, instance){
        switch(type){
            case 'saturation': return instance.scale(instance[type], instance.MIN_SATURATION, instance.MAX_SATURATION, instance.PROTOCOL_MIN_SATURATION, instance.PROTOCOL_MAX_SATURATION);
            case 'brightness': return instance.scale(instance[type], instance.MIN_BRIGHTNESS, instance.MAX_BRIGHTNESS, instance.PROTOCOL_MIN_BRIGHTNESS, instance.PROTOCOL_MAX_BRIGHTNESS);
            case 'hue': return instance.scale(instance[type], instance.MIN_HUE, instance.MAX_HUE, instance.PROTOCOL_MIN_HUE, instance.PROTOCOL_MAX_HUE);
            case 'temperature': return instance.scale(instance[type], instance.MIN_TEMPERATURE, instance.MAX_TEMPERATURE, instance.PROTOCOL_MIN_TEMPERATURE, instance.PROTOCOL_MAX_TEMPERATURE);
            default: return instance[type];
        }
    };

    PhilipsHue.prototype.extractRequest = function() {
        var extract = {};
        for (var index in this.valuesToExtract){
            extract[adaptName(this.valuesToExtract[index])] = adaptValue(this.valuesToExtract[index], this);
        }
        return extract;
    };

    var showWebserviceReturn = function(body) {
        Log.debug('Return');
        Log.debug(body);
    };

    var executeOperation = function(instance, operation, param) {
        if (typeof instance[operation] !== 'function') {
            Log.warning(operation + t('is-an-unknown-operation'));
            return;
        }
        Log.debug('Setting ' + instance.id + ' with ' + operation + ' ' + param);
        instance[operation](param);
        Log.debug('Done');
    };

    PhilipsHue.prototype.execute = function(params) {
        var instance = this;
        Log.debug('Executing changes for Philips Hue ' + instance.id);
        var treat = function(currentState) {
            Log.debug('currentState');
            Log.debug(currentState);
            instance.update(currentState.state);
            for (var operation in params) {
                executeOperation(instance, operation, params[operation]);
            }
            var body = instance.extractRequest();
            Log.debug('request');
            Log.debug(body);
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
                    Log.error(t('philips-hue-incomplete-configuration'));
                    state.configuration = false;
                }
                state.configuration = true;
            },
            user: function() {
                var callback = function(json) {
                    Log.info(t('philips-hue-user-configuration'));
                    // A TTS means an error
                    if (json.tts) {
                        state.user = false;
                        Log.error(t('philips-hue-bridge-unreachable'));
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
                            Log.error(t('philips-hue-bridge-unreachable'));
                            Log.error(json.tts || json[0].error.description);
                            return;
                        }
                        state.user = true;
                        config['philips-hue']['api-user'] = json[0].success.username;
                        Log.info(t('philips-hue-user-created') + ' : ' + config['philips-hue']['api-user']);
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