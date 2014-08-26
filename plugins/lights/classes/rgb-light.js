var RGBLightModule = function(config, Log, translationEngine) {
    var DimmableLight = require('./dimmable-light').DimmableLightModule(config, Log, translationEngine, 'RGB light').DimmableLight;

    var RGBLight = function(id) {
        this.base = DimmableLight;
        this.base(id);
        this.saturation = null;
        this.hue = null;
        this.temperature = null;
    };

    RGBLight.prototype = new DimmableLight;

    RGBLight.prototype.MIN_SATURATION = 0;
    RGBLight.prototype.MAX_SATURATION = 255;
    RGBLight.prototype.MIN_HUE = 0;
    RGBLight.prototype.MAX_HUE = 65535;
    RGBLight.prototype.MIN_TEMPERATURE = 153;
    RGBLight.prototype.MAX_TEMPERATURE = 500;

    RGBLight.prototype.setSaturation = function(value) {
        this.saturation = this.adaptValue(parseInt(value), this.MIN_SATURATION, this.MAX_SATURATION);
        this.valuesToExtract.push('saturation');
    };

    RGBLight.prototype.moreSaturation = function(value) {
        this.setSaturation(this.saturation + parseInt(value));
    };

    RGBLight.prototype.lessSaturation = function(value) {
        this.setSaturation(this.saturation - parseInt(value));
    };

    RGBLight.prototype.setHue = function(value) {
        this.hue = this.adaptValue(parseInt(value), this.MIN_HUE, this.MAX_HUE);
        this.valuesToExtract.push('hue');
    };

    RGBLight.prototype.moreHue = function(value) {
        this.setHue(this.hue + parseInt(value));
    };

    RGBLight.prototype.lessHue = function(value) {
        this.setHue(this.hue - parseInt(value));
    };

    RGBLight.prototype.setTemperature = function(value) {
        this.temperature = this.adaptValue(parseInt(value), this.MIN_HUE, this.MAX_HUE);
        this.valuesToExtract.push('temperature');
    };

    RGBLight.prototype.colder = function(value) {
        this.setTemperature(this.temperature - parseInt(value));
    };

    RGBLight.prototype.hotter = function(value) {
        this.setTemperature(this.temperature + parseInt(value));
    };

    return {
        RGBLight: RGBLight
    };
};
exports.RGBLightModule = RGBLightModule;