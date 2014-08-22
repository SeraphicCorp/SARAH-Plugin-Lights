var Light = function(id) {
    this.id = id;
};
Light.prototype.switchOn = function(/*boolean*/ value) {};
Light.prototype.setSaturation = function(/*integer*/ value) {};
Light.prototype.moreSaturation = function(/*integer*/ value) {};
Light.prototype.lessSaturation = function(/*integer*/ value) {};
Light.prototype.setBrightness = function(/*integer*/ value) {};
Light.prototype.moreBrightness = function(/*integer*/ value) {};
Light.prototype.lessBrightness = function(/*integer*/ value) {};
Light.prototype.setHue = function(/*integer*/ value) {};
Light.prototype.moreHue = function(/*integer*/ value) {};
Light.prototype.lessHue = function(/*integer*/ value) {};
Light.prototype.setTemperature = function(/*integer*/ value) {};
Light.prototype.colder = function(/*integer*/ value) {};
Light.prototype.hotter = function(/*integer*/ value) {};
Light.prototype.setAlert = function(/* boolean */ value) {};
Light.prototype.setEffect = function(/* string */value) {};
/* object of values indexed by string representing operations for command pattern
 * example : {'on': true, 'lessHue': 42}
 * */
Light.prototype.execute = function(params) {};
