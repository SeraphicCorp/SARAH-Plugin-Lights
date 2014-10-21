/* There is no saturation or temperature equivalent with this bulb */

var MilightRGBWModule = function (config, Log, translationEngine) {
    var RGBLight = require('./rgb-light').RGBLightModule(config, Log, translationEngine, 'Milight RGBW').RGBLight;
    var MilightRGBW = function (hubId, bulbId) {
        this.base = RGBLight;
        this.base(hubId + "-" + bulbId);
        this.hubId = hubId;
        this.bulbId = bulbId;
        this.saturation = null;
        this.hue = null;
        this.temperature = null;
        this.colorChanged = false;
        this.client = connect(hubId, config);
    };
    MilightRGBW.prototype = new RGBLight;
    MilightRGBW.prototype.PROTOCOL_MIN_BRIGHTNESS = 2;
    MilightRGBW.prototype.PROTOCOL_MAX_BRIGHTNESS = 27;
    MilightRGBW.prototype.PROTOCOL_MIN_SATURATION = 0;
    MilightRGBW.prototype.PROTOCOL_MAX_SATURATION = 1;
    MilightRGBW.prototype.PROTOCOL_MIN_HUE = 0;
    MilightRGBW.prototype.PROTOCOL_MAX_HUE = 255;
    MilightRGBW.prototype.PROTOCOL_MIN_TEMPERATURE = 0;
    MilightRGBW.prototype.PROTOCOL_MAX_TEMPERATURE = 1;

    MilightRGBW.prototype.setSaturation = function (value) {
        this.defaultImplementation('setSaturation');
    };

    MilightRGBW.prototype.moreSaturation = function (value) {
        this.defaultImplementation('moreSaturation');
    };

    MilightRGBW.prototype.lessSaturation = function (value) {
        this.defaultImplementation('lessSaturation');
    };

    MilightRGBW.prototype.sendCommand = function (bytes) {
        Log.debug("Send to " + config[this.hubId]['hub-address'] + ':' + config[this.hubId]['hub-port'] + " (Bulb : " + this.bulbId + ") :");
        this.client.execute(bytes);
    };

    MilightRGBW.prototype.commandSwitch = function () {
        var command, offset = 1;
        switch (this.bulbId) {
            case '0':
                command = 0x42;
                offset = -1;
                break;
            case '1':
                command = 0x45;
                break;
            case '2':
                command = 0x47;
                break;
            case '3':
                command = 0x49;
                break;
            case '4':
                command = 0x4B;
                break;
        }
        this.sendCommand([command + (this.on ? 0 : offset), 0x00, 0x55]);
    };

    MilightRGBW.prototype.commandBrightness = function () {
        var instance = this;
        var execute = function () {
            var v = instance.scale(instance.brightness, instance.MIN_BRIGHTNESS, instance.MAX_BRIGHTNESS, instance.PROTOCOL_MIN_BRIGHTNESS, instance.PROTOCOL_MAX_BRIGHTNESS);
            v = 0x00 + Math.floor(v);
            instance.sendCommand([0x4E, v, 0x55]);
        };
        this.commandSwitch(true);
        setTimeout(execute, 100);
    };

    MilightRGBW.prototype.commandRGB = function () {
        var instance = this;
        var execute = function () {
            var h = instance.scale(instance.hue, instance.MIN_HUE, instance.MAX_HUE, instance.PROTOCOL_MIN_HUE, instance.PROTOCOL_MAX_HUE);
            h = 0x00 + Math.floor(h);
            instance.sendCommand([0x40, h, 0x55]);
        };
        this.commandSwitch(true);
        setTimeout(execute, 100);
    };

    MilightRGBW.prototype.executeCommands = function (commands) {
        Log.debug('commands');
        Log.debug(commands);
        for (var index in commands) {
            switch (commands[index]) {
                case 'on' :
                    this.commandSwitch();
                    break;
                case 'brightness' :
                    this.commandBrightness();
                    break;
                case 'saturation' :
                    this.commandRGB();
                    break;
                default :
                    Log.warning(commands[index] + t('is-an-unimplemented-operation') + this.id + " does not support ");
            }
        }
    };

    var connect = function (hubId, config) {
        var lib = require('dgram');
        var socket = null;
        var hubConfig = config[hubId];
        return {
            start: function () {
                socket = lib.createSocket('udp4');
            },
            execute: function (commands) {
                var bytes = new Buffer(commands, 'hex');
                Log.debug(bytes);
                socket.send(bytes, 0, commands.length, hubConfig['hub-port'], hubConfig['hub-address'], function (err, bytes) {
                    if (err !== null) {
                        Log.debug('err');
                        Log.debug(err);
                    } else {
                        Log.debug('bytes');
                        Log.debug(bytes);
                    }
                });
            },
            close: function () {
            }
        };
    };

    MilightRGBW.prototype.execute = function (params) {
        this.client.start();
        var instance = this;
        Log.debug('Executing changes for Milight RGBW ' + instance.id);
        this.executeOperations(params);
        this.executeCommands(this.valuesToExtract);
        this.client.close();
    };
    return {
        MilightRGBW: MilightRGBW
    };
};
exports.MilightRGBWModule = MilightRGBWModule;