(function(){
  var path = require("path");

  TCHE.addSkin = function(name, skinData) {
    var data = [];
    data.push(name);
    data.push(skinData.type);

    var image = skinData.image;
    image = '<a href="#" class="skins-view" data-element-id="' + name + '" style="float:right"><i class="fa fa-search fa-fw"></i></a>' + image;

    data.push(image);

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
})();