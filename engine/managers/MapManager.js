(function(){
  function MapManager() {

  }

  MapManager.getMapData = function(mapName) {
    return TCHE.maps[mapName];
  };

  MapManager.getMapType = function(mapData) {
    if (TCHE.mapTypes[mapData.mapType] !== undefined) {
      return TCHE.mapTypes[mapData.mapType];
    } else {
      return TCHE.SpriteType;
    }
  };

  MapManager.getMapWidth = function(mapData) {
    return this.getMapType(mapData).getMapWidth(mapData);
  };
  
  MapManager.getMapHeight = function(mapData) {
    return this.getMapType(mapData).getMapHeight(mapData);
  };

  MapManager.getSpriteClass = function(mapData) {
    return this.getMapType(mapData).getSpriteClass(mapData);
  };

  MapManager.getMapObjects = function(mapData) {
    return this.getMapType(mapData).getMapObjects(mapData);
  };

  MapManager.loadMapFiles = function(mapData) {
    this.getMapType(mapData).loadMapFiles(mapData);
  };

  MapManager.getImportantObjectData = function(mapData, obj) {
    return this.getMapType(mapData).getImportantObjectData(mapData, obj);
  };

  MapManager.getTileFrame = function(mapData, tileset, tileId) {
    return this.getMapType(mapData).getTileFrame(mapData, tileset, tileId);
  };
  
  TCHE.registerStaticClass('MapManager', MapManager);
})();