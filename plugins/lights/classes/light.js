var LightModule = function(config, Log, translationEngine, type) {

    /** Inherit form this object to add a new type of Light. If you cannot implement a functionnality, then, do not surcharge it */
    var Light = function(id) {
        this.id = id;
    };

    var defaultError = function(operationName){
        Log.warning(operationName+translationEngine('is-an-unimplemented-operation')+type);
    };

    /** The following functions have parameters which can be provided under their intended type or as strings */
    /* value : 0 or 1*/
    Light.prototype.switchOn = function(value) {
        Log.warning();
    };
    /* value : Integer between 0 (white) and 255 (maximal saturation) */
    Light.prototype.setSaturation = function(value) {
        defaultError('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.moreSaturation = function(value) {
        defaultError('moreSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.lessSaturation = function(value) {
        defaultError('lessSaturation');
    };
    /* value : Integer between 0 (darkest) and 255 (brightest) */
    Light.prototype.setBrightness = function(value) {
        defaultError('setBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.moreBrightness = function(value) {
        defaultError('moreBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.lessBrightness = function(value) {
        defaultError('lessBrightness');
    };
    /* value : Integer between 0 and 65535. 0 is red, 25500 is green and 46920 is blue */
    Light.prototype.setHue = function(value) {
        defaultError('setHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.moreHue = function(value) {
        defaultError('moreHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.lessHue = function(value) {
        defaultError('lessHue');
    };
    /* value : Integer between 153 (coldest) and 500 (hottest) */
    Light.prototype.setTemperature = function(value) {
        defaultError('setTemperature');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.colder = function(value) {
        defaultError('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    Light.prototype.hotter = function(value) {
        defaultError('hotter');
    };
    /* value : 0 or 1 */
    Light.prototype.setAlert = function(value) {
        defaultError('setAlert');
    };
    /* value: string*/
    Light.prototype.setEffect = function(value) {
        defaultError('setEffect');
    };
    /* params : object of values indexed by string representing operations for command pattern
     * example : {'switchOn': true, 'lessHue': 42}
     * */
    Light.prototype.execute = function(params) {
        defaultError('execute');
    };

    return {
        Light: Light
    };
};

exports.LightModule = LightModule;