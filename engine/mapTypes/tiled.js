(function(){
  var TiledMapType = Object.create(TCHE.mapTypes.tche);

  TiledMapType.getSpriteClass = function(mapData) {
    return TCHE.TiledMap;
  };

  TiledMapType.getTileFrame = function(mapData, tileset, tileId) {
    var columns = (tileset.imagewidth + tileset.spacing) / (tileset.tilewidth + tileset.spacing);

    var subTileId = tileId - tileset.firstgid;
    var column = subTileId % columns;
    var line = Math.floor(subTileId / columns);

    var frame = {
      width : tileset.tilewidth,
      height : tileset.tileheight,
      x : column * (tileset.tilewidth + tileset.spacing),
      y : line * (tileset.tileheight + tileset.spacing)
    };

    return frame;
  };

  TCHE.mapTypes.tiled = TiledMapType;
})();