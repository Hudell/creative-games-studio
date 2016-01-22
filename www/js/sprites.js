(function(){
  var path = require("path");

  TCHE.addSprite = function(name, spriteData) {
    var data = [];
    data.push(name);
    data.push(spriteData.type);

    var imagePath = path.join(TCHE.loadedGame.folder, spriteData.image);
    data.push('<img src="' + imagePath + '"/>');

    data.push(spriteData.imageWidth || spriteData.width || 0);
    data.push(spriteData.imageHeight || spriteData.height || 0);
    data.push(spriteData.index || (spriteData.index === 0 ? 0 : ""));

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
    TCHE.markAsModified();
  };

  TCHE.viewSpriteImage = function(spriteName) {
    var image = TCHE.gameData.sprites[spriteName].image;
    var imagePath = path.join(TCHE.loadedGame.folder, image);

    TCHE.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  TCHE.editSprite = function(spriteName) {
    if (!TCHE.gameData.sprites[spriteName]) {
      throw new Error("Sprite " + spriteName + " not found.");
    }

    var spriteData = TCHE.gameData.sprites[spriteName];
    switch (spriteData.type) {
      case 'rpgmaker' :
        TCHE.editRpgMakerSprite(spriteName);
        break;
    }
  };

  TCHE.fillSprites = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    element.append('<option value=""></option>');

    var sprites = TCHE.gameData.sprites;
    for (var key in sprites) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };
})();