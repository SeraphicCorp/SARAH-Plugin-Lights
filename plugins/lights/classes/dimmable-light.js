var DimmableLightModule = function(config, Log, translationEngine) {
    var BinaryLight = require('./binary-light').BinaryLightModule(config, Log, translationEngine, 'Dimmable light').BinaryLight;

    var DimmableLight = function(id){
        this.base = BinaryLight;
        this.base(id);
        this.brightness = null;
    };

    DimmableLight.prototype = new BinaryLight;

    DimmableLight.prototype.MIN_BRIGHTNESS = 0;
    DimmableLight.prototype.MAX_BRIGHTNESS = 255;

    DimmableLight.prototype.setBrightness = function(value) {
        this.brightness = this.adaptValue(parseInt(value), this.MIN_BRIGHTNESS, this.MAX_BRIGHTNESS);
        this.valuesToExtract.push('brightness');
    };

    DimmableLight.prototype.moreBrightness = function(value) {
        this.setBrightness(this.brightness + parseInt(value));
    };

    DimmableLight.prototype.lessBrightness = function(value) {
        this.setBrightness(this.brightness - parseInt(value));
    };

    return {
      DimmableLight: DimmableLight
    };
};
exports.DimmableLightModule = DimmableLightModule;