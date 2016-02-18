(function(){
  function SceneWindow() {
    this.initialize();
  }

  SceneWindow.prototype = Object.create(TCHE.Scene.prototype);
  SceneWindow.prototype.constructor = SceneWindow;

  TCHE.registerClass('SceneWindow', SceneWindow);
})();