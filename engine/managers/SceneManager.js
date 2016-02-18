(function(){
  function SceneManager() {
    this._scene = null;
    this._newScene = null;
    this._newSceneParams = null;
  }

  TCHE.reader(SceneManager, 'scene');
  TCHE.reader(SceneManager, 'newScene');

  SceneManager.requestAnimationFrame = function() {
    window.requestAnimationFrame(this.update.bind(this));
  };

  SceneManager._doSceneChange = function() {
    if (this._newScene !== undefined) {
      if (!!this._scene) {
        this._scene.terminate();
        this._scene = undefined;
      }

      if (!!this._newScene) {
        this._scene = new (this._newScene)(this._newSceneParams);
      }
    }

    this._newScene = undefined;
  };

  SceneManager.update = function() {
    TCHE.startFrame();

    this._doSceneChange();

    TCHE.FileManager.update();
    TCHE.InputManager.update();

    if (!!this._scene) {
      this._scene.update();

      TCHE.renderer.render(this._scene);
    }

    TCHE.endFrame();

    //If there's no active scene, then end the game
    if (!!this._scene) {
      this.requestAnimationFrame();
    }
  };

  SceneManager.changeScene = function(newSceneClass, params) {
    this._newScene = newSceneClass;
    this._newSceneParams = params || {};
  };

  SceneManager.start = function(initialScene) {
    this.changeScene(initialScene);
    this.requestAnimationFrame();
  };

  SceneManager.end = function() {
    this.changeScene(null);
  };

  SceneManager.processClick = function(pos) {
    this.scene.processClick(pos);
  };
  
  TCHE.registerStaticClass('SceneManager', SceneManager);
})();