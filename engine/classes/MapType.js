(function(){
  function MapType(){

  }

  MapType.getMapWidth = function(mapData) {
    return mapData.width;
  };

  MapType.getMapHeight = function(mapData) {
    return mapData.height;
  };

  MapType.getSpriteClass = function(mapData) {
    return TCHE.Map2d;
  };

  MapType.getMapObjects = function(mapData) {
    return [];
  };

  MapType.loadMapFiles = function(mapData) {
  };

  TCHE.MapType = MapType;
})();