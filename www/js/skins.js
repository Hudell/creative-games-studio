(function(){
  var path = require("path");

  TCHE.addSkin = function(name, skinData) {
    var data = [];
    data.push(name);
    data.push(skinData.type);

    var imagePath = path.join(TCHE.loadedGame.folder, skinData.image);
    data.push('<img src="' + imagePath + '"/>');

    TCHE.addRowToTable('skins-table', data, 'skins', name);
  };

  TCHE.loadSkins = function() {
    if (!TCHE.gameData.skins) {
      return;
    }

    for (var name in TCHE.gameData.skins) {
      TCHE.addSkin(name, TCHE.gameData.skins[name]);
    }
  };

  TCHE.continueNewSkin = function () {
    var type = $('#skinType').val();
    var windowName = 'new-skin-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.continueImportSkin = function() {
    var type = $('#skinType').val();
    var windowName = 'import-skin-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.removeSkin = function(skinName) {
    delete TCHE.gameData.skins[skinName];
    TCHE.markAsModified();
  };

  TCHE.viewSkinImage = function(skinName) {
    var image = TCHE.gameData.skins[skinName].image;
    var imagePath = path.join(TCHE.loadedGame.folder, image);

    TCHE.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  TCHE.editSkin = function(skinName) {
    if (!TCHE.gameData.skins[skinName]) {
      throw new Error("Skin " + skinName + " not found.");
    }

    var skinData = TCHE.gameData.skins[skinName];
    switch (skinData.type) {
      case 'rpgmaker' :
        TCHE.editRpgMakerSkin(skinName);
        break;
    }
  };

  TCHE.fillSkins = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    element.append('<option value=""></option>');

    var skins = TCHE.gameData.skins;
    for (var key in skins) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  TCHE.fillSkinLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var skins = TCHE.gameData.skins;
    for (var key in skins) {
      element.append('<li><a class="recent-link" data-type="skin" data-name="' + key + '" href="#"><i class="menu-option fa fa-tint fa-fw"></i> ' + key + '</a></li>');
    }
  };
})();