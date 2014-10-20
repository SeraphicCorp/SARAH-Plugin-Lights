/* There is no saturation or temperature equivalent with this bulb */

var MilightRGBWModule = function(config, Log, translationEngine) {
    var RGBLight = require('./rgb-light').RGBLightModule(config, Log, translationEngine, 'Milight RGBW').RGBLight;
    var MilightRGBW = function(hubId, bulbId) {
        this.base = RGBLight;
        this.base(hubId + "-" + bulbId);
        this.hubId = hubId;
        this.bulbId = bulbId;
        this.saturation = null;
        this.hue = null;
        this.temperature = null;
        this.colorChanged = false;
        this.client = connect(config);
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
    MilightRGBW.prototype.sendCommand = function(bytes) {
        Log.debug("Send to " + config[this.hubId] + " (" + this.bulbId + ") :");
        Log.debug(bytes);
        this.client.execute(this.hubId, bytes);
    };
    MilightRGBW.prototype.commandSwitch = function(setOn) {
        var command;
        switch (this.bulbId) {
            case '0':
                command = 0x42;
            case '1':
                command = 0x45;
            case '2':
                command = 0x47;
            case '3':
                command = 0x49;
            case '4':
                command = 0x4B;
        }
        this.sendCommand([command + (setOn ? 0 : -1), 0x00, 0x55]);
    };
    MilightRGBW.prototype.commandBrightness = function() {
        var instance = this;
        var execute = function() {
            var v = instance.scale(instance.brightness, instance.MIN_BRIGHTNESS, instance.MAX_BRIGHTNESS, instance.PROTOCOL_MIN_BRIGHTNESS, instance.PROTOCOL_MAX_BRIGHTNESS);
            v = 0x00 + Math.trunc(v);
            instance.sendCommand([0x4E, v, 0x55]);
        };
        this.commandSwitch(true);
        setTimeout(execute, 100);
    };
    MilightRGBW.prototype.commandRGB = function() {
        var instance = this;
        var execute = function() {
            var h = instance.scale(instance.hue, instance.MIN_HUE, instance.MAX_HUE, instance.PROTOCOL_MIN_HUE, instance.PROTOCOL_MAX_HUE);
            h = 0x00 + Math.trunc(h);
            instance.sendCommand([0x40, h, 0x55]);
        };
        this.commandSwitch(true);
        setTimeout(execute, 100);
    };
    var executeCommands = function(instance, commands) {
        for (var index in commands) {
            switch (commands[index]) {
                case 'on' :
                    instance.commandBrightness();
                case 'saturation' :
                    instance.commandRGB();
                default :
                    Log.warning(this.id + " does not support " + commands[index]);
            }
        }
    };
    var connect = function(config) {
        var dgram = require('dgram');
        var socket = dgram.createSocket('udp4');
        return {
            execute: function(hubId, commands) {
                socket.send(new Buffer(commands), 0, commands.length, config[hubId]['hub-port'], config[hubId]['hub-address'], function(err, bytes) {
                    Log.debug('err');
                    Log.debug(err);
                    Log.debug('bytes');
                    Log.debug(bytes);
                });
            },
            close: function() {
                socket.close();
            }
        };
    };
    MilightRGBW.prototype.execute = function(params) {
        var instance = this;
        Log.debug('Executing changes for Milight RGBW ' + instance.id);
        this.executeOperations(params);
        executeCommands(this, this.valuesToExtract);
        this.client.close();
    };
    return {
        MilightRGBW: MilightRGBW
    };
};
exports.MilightRGBWModule = MilightRGBWModule;