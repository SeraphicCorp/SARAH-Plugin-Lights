var pluginName = 'lights';

var log = function(text) {
    console.log(text);
};
var t;
var CoreModule;
var PhilipsHueModule;

var CoreModuleFactory = function (config, log, t) {
    var objectFactory = function(id) {
        var tmp = id.split("-");
        var type = tmp[0];
        var objectID = tmp[1];
        switch (type) {
            case 'hue':
                return new PhilipsHueModule.PhilipsHue(objectID);
            default:
                log(type + t('is-an-unknown-type'));
                return null;
        }
    };
    var setLight = function(id, params) {
        var light = objectFactory(id);
        light.execute(params);
    };
    var setGroup = function(id, params) {
        if (!config.groups[id]) {
            log(id + t('is-an-unknown-group'));
            return;
        }
        for (var index in config.groups[id]) {
            setLight(config.groups[id][index], params);
        }
    };
    return {
        setLight: setLight,
        setGroup: setGroup
    };
};

exports.init = function(SARAH) {
    var config = SARAH.ConfigManager.getConfig().modules[pluginName];
    t = require('./internationalization').translationEngineFactory(config.language);
    CoreModule = CoreModuleFactory(config, log, t);
    PhilipsHueModule = require('./classes/philips-hue').PhilipsHueModule(config, log, t);
};

exports.action = function(data, callback) {

    data = {};
    data.switchOn = true;
    data.group = {
        chambre: {
            setEffect: 'colorloop',
            setSaturation: 255,
            setHue: 46920
        }
    };

    var propagate = function(data, entityData) {
        if (data.switchOn) {
            entityData.switchOn = data.switchOn;
        }
        if (data.setEffect) {
            entityData.setAlert = data.setAlert;
        }
    };
    // Handle group (data.group is an object containing objects indexed by id)
    if (data.group) {
        for (var id in data.group) {
            propagate(data, data.group[id]);
            CoreModule.setGroup(id, data.group[id]);
        }
    }
    // Handle device (data.device is an object containing objects indexed by id)
    if (data.device) {
        for (var id in data.device) {
            propagate(data, data.device[id]);
            CoreModule.setLight(id, data.device[id]);
        }
    }
    return callback('tts', t('executing-order'));
};