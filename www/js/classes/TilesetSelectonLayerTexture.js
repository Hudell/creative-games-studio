function TilesetSelectionLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

TilesetSelectionLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
TilesetSelectionLayerTexture.prototype.constructor = TilesetSelectionLayerTexture;

TilesetSelectionLayerTexture.prototype.refreshSelection = function() {
};