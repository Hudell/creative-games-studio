(function(){
  var path = require("path");

  STUDIO.addSkin = function(name, skinData) {
    var data = [];
    data.push(name);
    data.push(skinData.type);

    var imagePath = path.join(STUDIO.loadedGame.folder, skinData.image);
    data.push('<img src="' + imagePath + '"/>');

    STUDIO.addRowToTable('skins-table', data, 'skins', name);
  };

  STUDIO.loadSkins = function() {
    if (!STUDIO.gameData.skins) {
      return;
    }

    for (var name in STUDIO.gameData.skins) {
      STUDIO.addSkin(name, STUDIO.gameData.skins[name]);
    }
  };

  STUDIO.continueNewSkin = function () {
    var type = $('#skinType').val();
    var windowName = 'new-skin-' + type;

    STUDIO.DatabaseManager.openWindow('skins', windowName);
  };

  STUDIO.continueImportSkin = function() {
    var type = $('#skinType').val();
    var windowName = 'import-skin-' + type;

    STUDIO.DatabaseManager.openWindow('skins', windowName);
  };

  STUDIO.removeSkin = function(skinName) {
    delete STUDIO.gameData.skins[skinName];
    STUDIO.markAsModified();
  };

  STUDIO.viewSkinImage = function(skinName) {
    var image = STUDIO.gameData.skins[skinName].image;
    var imagePath = path.join(STUDIO.loadedGame.folder, image);

    STUDIO.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  STUDIO.editSkin = function(skinName) {
    if (!STUDIO.gameData.skins[skinName]) {
      throw new Error("Skin " + skinName + " not found.");
    }

    var skinData = STUDIO.gameData.skins[skinName];
    switch (skinData.type) {
      case 'rpgmaker' :
        STUDIO.editRpgMakerSkin(skinName);
        break;
    }
  };

  STUDIO.fillSkins = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    element.append('<option value=""></option>');

    var skins = STUDIO.gameData.skins;
    for (var key in skins) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  STUDIO.fillSkinLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var skins = STUDIO.gameData.skins;
    for (var key in skins) {
      element.append('<li><a class="recent-link" data-type="skin" data-name="' + key + '" href="#"><i class="menu-option fa fa-sticky-note-o fa-fw"></i> ' + key + '</a></li>');
    }
  };
})();