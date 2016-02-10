(function(){
  var path = require("path");

  STUDIO.addSprite = function(name, spriteData) {
    var data = [];
    data.push(name);
    data.push(spriteData.type);

    var imagePath = path.join(STUDIO.settings.folder, spriteData.image);
    data.push('<img src="' + imagePath + '"/>');

    data.push(spriteData.imageWidth || spriteData.width || 0);
    data.push(spriteData.imageHeight || spriteData.height || 0);
    data.push(spriteData.index || (spriteData.index === 0 ? 0 : ""));

    STUDIO.addRowToTable('sprites-table', data, 'sprites', name);
  };

  STUDIO.loadSprites = function() {
    if (!STUDIO.gameData.sprites) {
      return;
    }

    for (var name in STUDIO.gameData.sprites) {
      STUDIO.addSprite(name, STUDIO.gameData.sprites[name]);
    }
  };

  STUDIO.continueNewSprite = function () {
    var type = $('#spriteType').val();
    var windowName = 'new-sprite-' + type;

    STUDIO.DatabaseManager.openWindow('sprites', windowName);
  };

  STUDIO.continueImportSprite = function() {
    var type = $('#spriteType').val();
    var windowName = 'import-sprite-' + type;

    STUDIO.DatabaseManager.openWindow('sprites', windowName);
  };

  STUDIO.removeSprite = function(spriteName) {
    delete STUDIO.gameData.sprites[spriteName];
    STUDIO.markAsModified();
  };

  STUDIO.viewSpriteImage = function(spriteName) {
    var image = STUDIO.gameData.sprites[spriteName].image;
    var imagePath = path.join(STUDIO.settings.folder, image);

    STUDIO.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  STUDIO.editSprite = function(spriteName) {
    if (!STUDIO.gameData.sprites[spriteName]) {
      throw new Error(t("Sprite not found:") + ' ' + spriteName);
    }

    var spriteData = STUDIO.gameData.sprites[spriteName];
    switch (spriteData.type) {
      case 'rpgmaker' :
        STUDIO.editRpgMakerSprite(spriteName);
        break;
      case 'image' :
        STUDIO.editImageSprite(spriteName);
        break;
    }
  };

  STUDIO.fillSprites = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    element.append('<option value=""></option>');

    var sprites = STUDIO.gameData.sprites;
    for (var key in sprites) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  STUDIO.fillSpriteLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var sprites = STUDIO.gameData.sprites;
    for (var key in sprites) {
      element.append('<li><a class="recent-link" data-type="sprite" data-name="' + key + '" href="#"><i class="menu-option fa fa-image fa-fw"></i> ' + key + '</a></li>');
    }
  };
})();