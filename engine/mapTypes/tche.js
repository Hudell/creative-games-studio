(function(){
  var TcheMapType = Object.create(TCHE.MapType);

  TcheMapType.getMapWidth = function(mapData) {
    return mapData.width * mapData.tilewidth;
  };

  TcheMapType.getMapHeight = function(mapData) {
    return mapData.height * mapData.tileheight;
  };

  TcheMapType.getSpriteClass = function(mapData) {
    return TCHE.TcheMap;
  };

  TcheMapType.getMapObjects = function(mapData) {
    var objects = [];

    mapData.layers.forEach(function(layer){
      if (layer.type == "objectgroup") {
        layer.objects.forEach(function(object) {
          object.layerName = layer.name;
        });

        objects = objects.concat(layer.objects);
      }
    });

    return objects;
  }; 

  TcheMapType.loadMapFiles = function(mapData) {
    TCHE.FileManager.loadTiledMapFiles(mapData);
  };

  TcheMapType.getTileFrame = function(mapData, tileset, tileId) {
    var columns = (tileset.imagewidth + tileset.spacing) / (tileset.tilewidth + tileset.spacing / 2);

    var subTileId = tileId - tileset.firstgid;
    var column = subTileId % columns;
    var line = Math.floor(subTileId / columns);

    var frame = {
      width : tileset.tilewidth,
      height : tileset.tileheight,
      x : 0,
      y : 0
    };

    var xSpacing = Math.floor(column / 2) * tileset.spacing;
    var ySpacing = Math.floor(line / 2) * tileset.spacing;

    frame.x = (column * tileset.tilewidth) + xSpacing;
    frame.y = (line * tileset.tileheight) + ySpacing;

    return frame;
  };

  TcheMapType.getImportantObjectData = function(mapData, obj) {
    var type = obj.type;

    if (!TCHE.objectTypes[type]) {
      return false;
    }

    var result;
    var type = new (TCHE.objectTypes[type])();

    result = type.extractProperties(obj);
    result.type = type;
    
    return result;
  };

  TCHE.mapTypes.tche = TcheMapType;
})();