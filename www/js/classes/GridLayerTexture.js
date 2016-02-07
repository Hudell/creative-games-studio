function GridLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

GridLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
GridLayerTexture.prototype.constructor = GridLayerTexture;

GridLayerTexture.prototype.refreshGrid = function() {
  this.clear();

  if (STUDIO.MapEditor._showGrid) {
    var mapData = STUDIO.MapEditor._currentMapData;
    var mapColumns = mapData.width;
    var mapRows = mapData.height;

    var size = STUDIO.MapEditor.getFakeTileSize();
    this.drawGrid(size.width, size.height, mapColumns, mapRows);
  } else {
    this.render(new PIXI.Container());
  }
};

GridLayerTexture.prototype.drawGrid = function(tileWidth, tileHeight, columns, rows) {
  var graphics = new PIXI.Graphics();

  for (var x = 0; x < columns; x++) {
    for (var y = 0; y < rows; y++) {
      this.drawGridRect(graphics, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    }
  }

  this.render(graphics);
};

GridLayerTexture.prototype.drawGridRect = function(graphics, x, y, w, h, color, alpha, length) {
  color = color || 0x333333;
  alpha = alpha || 0.4;
  length = length || 1;

  graphics.beginFill(color, alpha);
  graphics.drawRect(x, y, w, length);
  graphics.drawRect(x, y + h - length, w, length);
  graphics.drawRect(x + w - length, y, length, h);
  graphics.drawRect(x, y, length, h);

  graphics.endFill();
};