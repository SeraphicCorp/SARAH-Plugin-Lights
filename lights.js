var pluginName = 'lights';

var LogFactory = function(config) {
    var generic = function(text, level) {
        if (!config.debug && typeof level !== 'undefined') {
            return;
        }
        console.log(text);
    };
    var normal = function(text) {
        generic(text);
    };
    return {
        fatal: normal,
        error: normal,
        warning: normal,
        info: normal,
        debug: function(text) {
            generic(text, 'DEBUG');
        }
    };
};

var t;
var Log;
var CoreModule;
var PhilipsHueModule;
var MilightRGBWModule;

var CoreModuleFactory = function(config, Log, t) {
    var objectFactory = function(id) {
        var tmp = id.split("-");
        var type = tmp[0];
        var objectID = tmp[1];
        switch (type) {
//            case 'hue':
//                return new PhilipsHueModule.PhilipsHue(objectID);
            case 'milightrgbw':
                return new MilightRGBWModule.MilightRGBW(tmp[1], tmp[2]);
            default:
                Log.warning(type + t('is-an-unknown-type'));
                return null;
        }
    };
    var setLight = function(id, params) {
        Log.debug('Treating light : ' + id);
        var light = objectFactory(id);
        if (light === null){
            return;
        }
        light.execute(params);
    };
    var setGroup = function(id, params) {
        if (!config.groups[id]) {
            Log.warning(id + t('is-an-unknown-group'));
            return;
        }
        Log.debug('Treating group : ' + id);
        for (var index in config.groups[id]) {
            setLight(config.groups[id][index], params);
        }
    };
    return {
        setLight: setLight,
        setGroup: setGroup
    };
};

exports.init = function() {
    var config = require('./config');
    t = require('./internationalization').translationEngineFactory(config.language);
    Log = LogFactory(config);
    CoreModule = CoreModuleFactory(config, Log, t);
    PhilipsHueModule = require('./classes/philips-hue').PhilipsHueModule(config['philips-hue'], Log, t);
    MilightRGBWModule = require('./classes/milight-rgbw').MilightRGBWModule(config['milight'], Log, t);
};

exports.action = function(data, callback, config, SARAH) {

    Log.debug('Data received by plugin ' + pluginName);
    Log.debug(data);

    var prepare = function(data) {
        var usableData = {device: {}, group: {}};
        for (var index in data) {
            var list = index.split('--');
            if (list.length !== 3) {
                continue;
            }
            var operation = list[0];
            var type = list[1];
            var id = list[2];
            usableData[type] = usableData[type] || {};
            usableData[type][id] = usableData[type][id] || {};
            usableData[type][id][operation] = data[index];
        }
        Log.debug('usableData');
        Log.debug(usableData);
        return usableData;
    };

    var usableData = prepare(data);
    // Handle group (data.group is an object containing objects indexed by id)
    if (usableData.group) {
        for (var id in usableData.group) {
            CoreModule.setGroup(id, usableData.group[id]);
        }
    }
    // Handle device (data.device is an object containing objects indexed by id)
    if (usableData.device) {
        for (var id in usableData.device) {
            CoreModule.setLight(id, usableData.device[id]);
        }
    }
    return callback({'tts': t('executing-order')});
};