(function(){
  var oldCreateLayers = TCHE.TiledMap.prototype.createLayers;
  TCHE.TiledMap.prototype.createLayers = function() {
    var transparentBackgroundLayer = new TCHE.TransparentLayerSprite(this._map.mapData.width, this._map.mapData.height);
    this._layers.push(transparentBackgroundLayer);
    this.addChild(transparentBackgroundLayer);

    oldCreateLayers.call(this);
  };
})();