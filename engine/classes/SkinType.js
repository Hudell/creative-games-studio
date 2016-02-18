(function(){
  function SkinType(){

  }

  SkinType.loadSkinTexture = function(skinData) {
    return PIXI.Texture.fromImage(skinData.image);
  }

  SkinType.drawSkinFrame = function(content) {
  }

  SkinType.addSkinBackground = function(window, container, skinData) {
  }

  SkinType.drawCursor = function(skinData, contents, x, y) {
  }

  TCHE.SkinType = SkinType;
})();