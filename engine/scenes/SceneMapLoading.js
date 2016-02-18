(function(){
  function SceneMapLoading(params) {
    this.initialize(params);
  }

  SceneMapLoading.prototype = Object.create(TCHE.SceneLoading.prototype);
  SceneMapLoading.prototype.constructor = SceneMapLoading;

  SceneMapLoading.prototype.initialize = function(params) {
    TCHE.SceneLoading.prototype.initialize.call(this);
    this._mapName = params.mapName;

    TCHE.FileManager.loadMapFiles(params.mapName);
  };

  SceneMapLoading.update = function() {
    TCHE.SceneLoading.prototype.update.call(this);

    if (TCHE.FileManager.isLoaded()) {
      TCHE.fire("mapLoaded");
      TCHE.SceneManager.changeScene(TCHE.SceneMap, {mapName : this._mapName});
    }
  };
  
  TCHE.registerClass('SceneMapLoading', SceneMapLoading);
})();