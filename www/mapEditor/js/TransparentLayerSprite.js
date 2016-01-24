(function(){
  function TransparentLayerSprite(width, height) {
    TCHE.TiledLayerSprite.call(this, this.getFakeLayerData(width, height));
  }

  TransparentLayerSprite.prototype = Object.create(TCHE.TiledLayerSprite.prototype);
  TransparentLayerSprite.prototype.constructor = TransparentLayerSprite;

  TransparentLayerSprite.prototype.getFakeLayerData = function(width, height) {
    var layer = {
      name : 'Transparent Background',
      height : height,
      width : width,
      data : []
    };

    var length = layer.height * layer.width;
    for (var i = 0; i < length; i++) {
      layer.data[i] = 0;
    }

    return layer;
  };

  TransparentLayerSprite.prototype.addSprite = function(texture, x, y, tileId) {
    var sprite = new PIXI.Sprite(texture);
    sprite.x = x;
    sprite.y = y;
    sprite.tileId = tileId;

    var container = new PIXI.Container();
    container.addChild(sprite);

    this._texture.render(container);
  };

  TransparentLayerSprite.prototype.createPixiSprite = function() {
    var layerData = this._layerData;
    var mapName = TCHE.globals.map.mapName;

    this._texture = TCHE.TileManager.getLayerTextureFromCache('MapEditor', 'Transparent');
    if (!this._texture) {
      var layerSprite = this;
      var mapData = TCHE.MapManager.getMapData(mapName);

      var width = mapData.width * mapData.tilewidth;
      var height = mapData.height * mapData.tileheight;

      this._texture = new PIXI.RenderTexture(TCHE.renderer, width, height);

      var index = -1;
      for (var y = 0; y < height; y += 32) {
        for (var x = 0; x < width; x += 32) {
          index++;
          var texture = TCHE.SpriteManager.getSpriteTexture('transparent');
          texture.frame = {
            width : 32,
            height : 32,
            x : 0,
            y : 0
          };

          layerSprite.addSprite(texture, x, y, 0);
        }
      }

      TCHE.TileManager.saveLayerTextureCache('MapEditor', 'Transparent', this._texture);
    }

    this._sprite = new PIXI.Sprite(this._texture);
    this.addChild(this._sprite);
  };

  TCHE.registerClass('TransparentLayerSprite', TransparentLayerSprite);
})();