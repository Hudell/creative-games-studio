(function(){
  function TcheLayerSprite(layerData) {
    this.initialize(layerData);
  }

  TcheLayerSprite.prototype = Object.create(TCHE.Sprite.prototype);
  TcheLayerSprite.prototype.constructor = TcheLayerSprite;

  TcheLayerSprite.prototype.initialize = function(layerData) {
    TCHE.Sprite.prototype.initialize.call(this);

    this._layerData = layerData;
    this._texture = null;
    this._sprite = null;
    this.createPixiSprite();
  };

  TCHE.accessor(TcheLayerSprite.prototype, 'layerData');

  TcheLayerSprite.prototype.addSprite = function(texture, x, y, tileId) {
    var tileX = x * texture.frame.width;
    var tileY = y * texture.frame.height;

    var sprite = new PIXI.Sprite(texture);
    sprite.x = tileX;
    sprite.y = tileY;
    sprite.tileId = tileId;

    var container = new PIXI.Container();
    container.addChild(sprite);

    this._texture.render(container);
  };

  TcheLayerSprite.prototype.onLoadTexture = function() {
    this.layerSprite.addSprite(this.texture, this.x, this.y, this.tileId);
  };

  TcheLayerSprite.prototype.createPixiSprite = function() {
    var layerData = this._layerData;
    var mapName = TCHE.globals.map.mapName;

    this._texture = TCHE.TileManager.getLayerTextureFromCache(mapName, layerData.name);
    if (!this._texture) {
      var layerSprite = this;
      var mapData = TCHE.MapManager.getMapData(mapName);

      var width = mapData.width * mapData.tilewidth;
      var height = mapData.height * mapData.tileheight;

      this._texture = new PIXI.RenderTexture(TCHE.renderer, width, height);

      var index = -1;
      for (var y = 0; y < layerData.height; y++) {
        for (var x = 0; x < layerData.width; x++) {
          index++;
          var tileId = layerData.data[index];
          if (tileId === 0) continue;

          var texture = TCHE.TileManager.loadTileTexture(mapName, tileId);

          if (texture.baseTexture.isLoading) {
            texture.baseTexture.addListener('loaded', layerSprite.onLoadTexture.bind({
              x : x,
              y : y,
              tileId : tileId,
              texture : texture,
              layerSprite : layerSprite
            }));
          } else {
            layerSprite.addSprite(texture, x, y, tileId);
          }
        }
      }

      TCHE.TileManager.saveLayerTextureCache(mapName, layerData.name, this._texture);
    }
    
    this._sprite = new PIXI.Sprite(this._texture);
    this.addChild(this._sprite);
  };

  TcheLayerSprite.prototype.update = function() {
  };
  
  TCHE.registerClass('TcheLayerSprite', TcheLayerSprite);
})();