var Light = function(id) {
    this.id = id;
};
Light.prototype.on = function(/*boolean*/ value) {};
Light.prototype.saturation = function(/*integer*/ value) {};
Light.prototype.moreSaturation = function(/*integer*/ value) {};
Light.prototype.lessSaturation = function(/*integer*/ value) {};
Light.prototype.brightness = function(/*integer*/ value) {};
Light.prototype.moreBrightness = function(/*integer*/ value) {};
Light.prototype.lessBrightness = function(/*integer*/ value) {};
Light.prototype.hue = function(/*integer*/ value) {};
Light.prototype.moreHue = function(/*integer*/ value) {};
Light.prototype.lessHue = function(/*integer*/ value) {};
Light.prototype.temperature = function(/*integer*/ value) {};
Light.prototype.colder = function(/*integer*/ value) {};
Light.prototype.hotter = function(/*integer*/ value) {};
Light.prototype.alert = function(/* boolean */ value) {};
Light.prototype.effect = function(/* string */value) {};
/* object of values indexed by string representing operations for command pattern
 * example : {'on': true, 'lessHue': 42}
 * */
Light.prototype.execute = function(params) {};
