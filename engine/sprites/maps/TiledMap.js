(function(){
  function TiledMap(map) {
    this.initialize(map);
  }

  TiledMap.prototype = Object.create(TCHE.TcheMap.prototype);
  TiledMap.prototype.constructor = TiledMap;

  TiledMap.prototype.initialize = function(map) {
    TCHE.TcheMap.prototype.initialize.call(this, map);
  };

  TCHE.registerClass('TiledMap', TiledMap);
})();