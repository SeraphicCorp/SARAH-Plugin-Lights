var BinaryLightModule = function(config, Log, translationEngine, type) {

    /** Inherit form this object to add a new type of Light. If you cannot implement a functionnality, then, do not surcharge it */
    var BinaryLight = function(id) {
        this.id = id;
        this.on = null;
        this.valuesToExtract = [];
    };

    BinaryLight.prototype.defaultImplementation = function(operationName){
        Log.warning(operationName+translationEngine('is-an-unimplemented-operation')+type);
    };

    BinaryLight.prototype.adaptValue = function(value, minimalValue, maximalValue) {
        var limit = maximalValue - minimalValue + 1;
        var newValue = (limit + value - minimalValue) % limit + minimalValue;
        Log.debug('New value');
        Log.debug(newValue);
        return newValue;
    };

    BinaryLight.prototype.scale = function(value, originalMinValue, originalMaxValue, adaptedMinValue, adaptedMaxValue){
        var originalRange = originalMaxValue - originalMinValue;
        var adaptedRange = adaptedMaxValue - adaptedMinValue;
        return (value - originalMinValue) * adaptedRange / originalRange + adaptedMinValue;
    };

    /** The following functions have parameters which are provided as strings */
    /* value : 0 or 1*/
    BinaryLight.prototype.switchOn = function(value) {
        var newValue = value !== '0';
        if (this.on === newValue){
            return;
        }
        this.on = newValue;
        this.valuesToExtract.push('on');
    };
    /* value : Integer between 0 (white) and 255 (maximal saturation) */
    BinaryLight.prototype.setSaturation = function(value) {
        defaultError('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreSaturation = function(value) {
        defaultError('moreSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessSaturation = function(value) {
        defaultError('lessSaturation');
    };
    /* value : Integer between 0 (darkest) and 255 (brightest) */
    BinaryLight.prototype.setBrightness = function(value) {
        defaultError('setBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreBrightness = function(value) {
        defaultError('moreBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessBrightness = function(value) {
        defaultError('lessBrightness');
    };
    /* value : Integer between 0 and 65535. 0 is red, 25500 is green and 46920 is blue */
    BinaryLight.prototype.setHue = function(value) {
        defaultError('setHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreHue = function(value) {
        defaultError('moreHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessHue = function(value) {
        defaultError('lessHue');
    };
    /* value : Integer between 153 (coldest) and 500 (hottest) */
    BinaryLight.prototype.setTemperature = function(value) {
        defaultError('setTemperature');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.colder = function(value) {
        defaultError('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.hotter = function(value) {
        defaultError('hotter');
    };
    /* value: 0 or 1 */
    BinaryLight.prototype.setAlert = function(value) {
        defaultError('setAlert');
    };
    /* value: array of string*/
    BinaryLight.prototype.setEffect = function(value) {
        defaultError('setEffect');
    };
    /* params : object of values indexed by string representing operations for command pattern
     * example : {'switchOn': true, 'lessHue': 42}
     * */
    BinaryLight.prototype.execute = function(params) {
        defaultError('execute');
    };

    return {
        BinaryLight: BinaryLight
    };
};

exports.BinaryLightModule = BinaryLightModule;