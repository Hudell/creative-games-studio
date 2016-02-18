(function(){
  function MapSprite(map) {
    this.initialize(map);
  }

  MapSprite.prototype = Object.create(TCHE.Sprite.prototype);
  MapSprite.prototype.constructor = MapSprite;

  MapSprite.prototype.initialize = function(map) {
    TCHE.Sprite.prototype.initialize.call(this);
    this._map = map;
  };

  TCHE.reader(MapSprite.prototype, 'map');
  
  TCHE.registerClass('MapSprite', MapSprite);
})();