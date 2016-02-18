(function(){
  function SceneLaunch() {

  }

  SceneLaunch.prototype = Object.create(TCHE.SceneLoading.prototype);
  SceneLaunch.prototype.constructor = SceneLaunch;

  SceneLaunch.prototype.update = function() {
    TCHE.SceneLoading.prototype.update.call(this);

    if (TCHE.FileManager.isLoaded()) {
      TCHE.ResolutionManager.updateResolution();
      TCHE.ObjectTypeManager.loadCustomObjectTypes();

      if (TCHE.Params.param('debug')) {
        TCHE.Validation.checkBasicFiles();
      }

      TCHE.fire("ready");
      
      var initialScene = TCHE.data.game.initialScene;
      if (!TCHE[initialScene]) {
        initialScene = TCHE.SceneTitle;
      } else {
        initialScene = TCHE[initialScene];
      }

      var params = {};

      if (initialScene == TCHE.SceneMap || initialScene.prototype instanceof TCHE.SceneMap) {
        params.mapName = TCHE.data.game.initialMap;
      }

      TCHE.SceneManager.changeScene(initialScene, params);
    }
  };
  
  TCHE.registerClass('SceneLaunch', SceneLaunch);
})();