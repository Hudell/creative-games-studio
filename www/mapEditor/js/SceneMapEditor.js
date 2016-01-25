(function(){
  function SceneMapEditor(params) {
    TCHE.SceneMap.call(this, params);
  }

  SceneMapEditor.prototype = Object.create(TCHE.SceneMap.prototype);
  SceneMapEditor.prototype.constructor = SceneMapEditor;

  SceneMapEditor.prototype.update = function(){
    TCHE.MapEditor.update();
    if (TCHE.MapEditor.needsRedraw()) {
      this.recreateLayers();
    }
  };

  SceneMapEditor.prototype.recreateLayers = function() {
    this._mapSprite.refreshLayers();
  };

  SceneMapEditor.prototype.processClick = function(pos) {
    // TCHE.MapEditor.changeTile(pos.x, pos.y);
    // this.recreateLayers();
  };

  TCHE.registerClass('SceneMapEditor', SceneMapEditor);
})();