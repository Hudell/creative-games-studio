(function(){
  function SceneMapEditor(params) {
    TCHE.SceneMap.call(this, params);
  }

  SceneMapEditor.prototype = Object.create(TCHE.SceneMap.prototype);
  SceneMapEditor.prototype.constructor = SceneMapEditor;

  SceneMapEditor.prototype.update = function(){
    
  };

  SceneMapEditor.prototype.processClick = function(pos) {

  };

  TCHE.registerClass('SceneMapEditor', SceneMapEditor);
})();