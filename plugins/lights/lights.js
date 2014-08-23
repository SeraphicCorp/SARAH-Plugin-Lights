var pluginName = 'lights';

var LogFactory = function(config) {
    return function(text, level) {
        if (!config.debug && typeof level !== 'undefined'){
            return;
        }
        console.log(text);
    };
};

var t;
var log;
var CoreModule;
var PhilipsHueModule;

var CoreModuleFactory = function(config, log, t) {
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
        log('Treating light : ' + id, 'DEBUG');
        var light = objectFactory(id);
        light.execute(params);
    };
    var setGroup = function(id, params) {
        if (!config.groups[id]) {
            log(id + t('is-an-unknown-group'));
            return;
        }
        log('Treating group : ' + id, 'DEBUG');
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
    log = LogFactory(config);
    CoreModule = CoreModuleFactory(config, log, t);
    PhilipsHueModule = require('./classes/philips-hue').PhilipsHueModule(config, log, t);
};

exports.action = function(data, callback) {

    log('Data received by plugin ' + pluginName, 'DEBUG');
    log(data, 'DEBUG');

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
        log('usableData', 'DEBUG');
        log(usableData, 'DEBUG');
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

    return callback('tts', t('executing-order'));
};