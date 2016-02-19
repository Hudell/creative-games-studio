(function(){
  function MapObjectObjectType() {
    this.initialize();
  }

  MapObjectObjectType.prototype = Object.create(TCHE.objectTypes.Object.prototype);
  MapObjectObjectType.prototype.constructor = MapObjectObjectType;

  MapObjectObjectType.prototype.initialize = function() {
    TCHE.objectTypes.Object.prototype.initialize.call(this);

    this._properties.name = { type : 'string' };
    this._properties.x = { type : 'number' };
    this._properties.y = { type : 'number' };
    this._properties.width = { type : 'number' };
    this._properties.height = { type : 'number' };
    this._properties.autosize = { type : 'boolean' };
    this._properties.ghost = { type : 'boolean' };
    this._properties.gravityEffects = { type : 'boolean' };
    this._properties.sprite = { type : 'sprite' };
    this._properties.xOffset = { type : 'number' };
    this._properties.yOffset = { type : 'number' };
    
    this._properties['On Activated'] = { type : 'event' };
    this._properties['On Player Touch'] = { type : 'event' };
    this._properties['On Mouse Click'] = { type : 'event' };
    this._properties['On Screen Touch'] = { type : 'event' };
    this._properties['On Map Loaded'] = { type : 'event' };
  };

  MapObjectObjectType.prototype.getName = function() {
    return 'MapObject';
  };

  TCHE.objectTypes.MapObject = MapObjectObjectType;
})();