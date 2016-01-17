(function(){
  var path = require("path");

  TCHE.addSprite = function(name, spriteData) {
    var data = [];
    data.push(name);
    data.push(spriteData.type);

    var image = spriteData.image;
    image = '<a href="#" class="sprites-view" data-element-id="' + name + '" style="float:right"><i class="fa fa-search fa-fw"></i></a>' + image;

    data.push(image);
    data.push(spriteData.imageWidth || spriteData.width || 0);
    data.push(spriteData.imageHeight || spriteData.height || 0);
    data.push(spriteData.index || "");

    TCHE.addRowToTable('sprites-table', data, 'sprites', name);
  };

  TCHE.loadSprites = function() {
    if (!TCHE.gameData.sprites) {
      return;
    }

    for (var name in TCHE.gameData.sprites) {
      TCHE.addSprite(name, TCHE.gameData.sprites[name]);
    }
  };

  TCHE.continueNewSprite = function () {
    var type = $('#spriteType').val();
    var windowName = 'new-sprite-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.continueImportSprite = function() {
    var type = $('#spriteType').val();
    var windowName = 'import-sprite-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.removeSprite = function(spriteName) {
    delete TCHE.gameData.sprites[spriteName];
    TCHE.saveGameData();
  };

  TCHE.viewSpriteImage = function(spriteName) {
    var image = TCHE.gameData.sprites[spriteName].image;
    var imagePath = path.join(TCHE.currentGamePath, image);

    TCHE.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };
})();
