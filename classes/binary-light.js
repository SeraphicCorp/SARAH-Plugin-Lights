var BinaryLightModule = function(config, Log, translationEngine, type) {

    /** Inherit form this object to add a new type of Light. If you cannot implement a functionnality, then, do not surcharge it */
    var BinaryLight = function(id) {
        this.id = id;
        this.on = null;
        this.valuesToExtract = [];
    };

    BinaryLight.prototype.defaultImplementation = function(operationName) {
        Log.warning(operationName + translationEngine('is-an-unimplemented-operation') + type);
    };

    BinaryLight.prototype.adaptValue = function(value, minimalValue, maximalValue) {
        var limit = maximalValue - minimalValue + 1;
        var newValue = (limit + value - minimalValue) % limit + minimalValue;
        Log.debug('New value');
        Log.debug(newValue);
        return newValue;
    };

    BinaryLight.prototype.scale = function(value, originalMinValue, originalMaxValue, adaptedMinValue, adaptedMaxValue) {
        var originalRange = originalMaxValue - originalMinValue;
        var adaptedRange = adaptedMaxValue - adaptedMinValue;
        return (value - originalMinValue) * adaptedRange / originalRange + adaptedMinValue;
    };

    /** The following functions have parameters which are provided as strings */
    /* value : 0 or 1*/
    BinaryLight.prototype.switchOn = function(value) {
        var newValue = value !== '0';
        if (this.on === newValue) {
            return;
        }
        this.on = newValue;
        this.valuesToExtract.push('on');
    };
    /* value : Integer between 0 (white) and 255 (maximal saturation) */
    BinaryLight.prototype.setSaturation = function(value) {
        this.defaultImplementation('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreSaturation = function(value) {
        this.defaultImplementation('moreSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessSaturation = function(value) {
        this.defaultImplementation('lessSaturation');
    };
    /* value : Integer between 0 (darkest) and 255 (brightest) */
    BinaryLight.prototype.setBrightness = function(value) {
        this.defaultImplementation('setBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreBrightness = function(value) {
        this.defaultImplementation('moreBrightness');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessBrightness = function(value) {
        this.defaultImplementation('lessBrightness');
    };
    /* value : Integer between 0 and 65535. 0 is red, 25500 is green and 46920 is blue */
    BinaryLight.prototype.setHue = function(value) {
        this.defaultImplementation('setHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.moreHue = function(value) {
        this.defaultImplementation('moreHue');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.lessHue = function(value) {
        this.defaultImplementation('lessHue');
    };
    /* value : Integer between 153 (coldest) and 500 (hottest) */
    BinaryLight.prototype.setTemperature = function(value) {
        this.defaultImplementation('setTemperature');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.colder = function(value) {
        this.defaultImplementation('setSaturation');
    };
    /* value : Integer, if the computed value is outside range, a modulo operation with set it in range */
    BinaryLight.prototype.hotter = function(value) {
        this.defaultImplementation('hotter');
    };
    /* value: 0 or 1 */
    BinaryLight.prototype.setAlert = function(value) {
        this.defaultImplementation('setAlert');
    };
    /* value: array of string*/
    BinaryLight.prototype.setEffect = function(value) {
        this.defaultImplementation('setEffect');
    };

    BinaryLight.prototype.executeOperation = function(operation, param) {
        if (typeof this[operation] !== 'function') {
            Log.warning(operation + t('is-an-unknown-operation'));
            return;
        }
        Log.debug('Setting ' + this.id + ' with ' + operation + ' ' + param);
        this[operation](param);
        Log.debug('Done');
    };

    BinaryLight.prototype.executeOperations = function(params) {
        for (var operation in params) {
            this.executeOperation(operation, params[operation]);
        }
    };

    /* params : object of values indexed by string representing operations for command pattern
     * example : {'switchOn': true, 'lessHue': 42}
     * */
    BinaryLight.prototype.execute = function(params) {
        this.defaultImplementation('execute');
    };

    return {
        BinaryLight: BinaryLight
    };
};

exports.BinaryLightModule = BinaryLightModule;