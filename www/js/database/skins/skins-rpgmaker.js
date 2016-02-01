(function(){
  var path = require("path");

  STUDIO.goToRpgMakerSkinImportScreen = function(filePath) {
    STUDIO.showMessage('File will need to be imported.');
  };

  STUDIO.onChooseRpgMakerSkinToImport = function(filePath) {
    if (STUDIO.isFileImported(filePath)) {
      STUDIO.showMessage('The selected image was already imported.');
      $('#import-rpgmaker-skin-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'skins', baseName);
    $('#import-rpgmaker-skin-new-name').val(newPath);

    var img = $("<img src='" + filePath + "'>");
    $('#import-rpgmaker-skin-image-preview').html(img);
  };

  STUDIO.onChooseRpgMakerSkin = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToRpgMakerSkinImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    $('#new-rpgmaker-skin-image-preview').html(img);
  };

  STUDIO.onChooseRpgMakerSkinToEdit = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToRpgMakerSkinImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    $('#edit-rpgmaker-skin-image-preview').html(img);
  };

  STUDIO.saveNewRpgMakerSkin = function() {
    var imageFile = $('#new-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to use.");
    }

    if (!STUDIO.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var skinName = $('#new-rpgmaker-skin-name').val();
    if (!skinName || !skinName.trim) {
      throw new Error("You need to give this skin a name.");
    }

    if (STUDIO.gameData.skins[skinName] !== undefined) {
      throw new Error("A Skin called " + skinName + " already exists.");
    }

    var imageRelativePath = imageFile.replace(STUDIO.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    STUDIO.gameData.skins[skinName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath
    };

    STUDIO.addRecentObject('skin', skinName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('skins', 'skins');
  };

  STUDIO.importRpgMakerSkin = function() {
    var imageFile = $('#import-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (STUDIO.isFileImported(imageFile)) {
      throw new Error("The selected image file was already imported.");
    }

    var newName = $('#import-rpgmaker-skin-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error("You need to give this file a new name.");
    }

    var name = $('#import-rpgmaker-skin-name').val();
    if (!!name && !!name.trim()) {
      name = name.trim();
      if (STUDIO.gameData.skins[name] !== undefined) {
        throw new Error("A skin called " + name + " already exists.");
      }
    } else {
      name = '';
    }
    
    var newPath = path.join(STUDIO.loadedGame.folder, newName);
    STUDIO.copyFileSync(imageFile, newPath);

    if (!!name) {
      STUDIO.gameData.skins[name] = {
        "type" : "rpgmaker",
        "image" : newName
      };

      STUDIO.markAsModified();
    }

    STUDIO.DatabaseManager.openWindow('skins', 'skins');
  };

  STUDIO.saveOldRpgMakerSkin = function(){
    var skinName = $('#edit-rpgmaker-skin-name').val();
    if (!skinName || !skinName.trim) {
      throw new Error("I forgot what skin you were modifying. Try again.");
    }

    var data = STUDIO.gameData.skins[skinName];
    if (!data) {
      throw new Error("I couldn't find the existing skin data.");
    }

    var imageFile = $('#edit-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      imageFile = path.join(STUDIO.loadedGame.folder, data.image);
    }

    if (!STUDIO.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var imageRelativePath = imageFile.replace(STUDIO.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    data.image = imageRelativePath;

    STUDIO.gameData.skins[skinName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath
    };

    STUDIO.addRecentObject('skin', skinName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('skins', 'skins');
  };

  STUDIO.loadRpgMakerSkinData = function(skinName) {
    var skinData = STUDIO.gameData.skins[skinName];
    var fullImagePath = path.join(STUDIO.loadedGame.folder, skinData.image);

    var img = $("<img src='" + fullImagePath + "'>");
    $('#edit-rpgmaker-skin-image-preview').html(img);
    
    $('#edit-rpgmaker-skin-name').val(skinName);
    $('#edit-rpgmaker-skin-index-' + skinData.index).prop('checked', 'checked');
  };

  STUDIO.removeCurrentRpgMakerSkin = function() {
    var skinName = $('#edit-rpgmaker-skin-name').val();
    STUDIO.removeSkin(skinName);
  };

  STUDIO.editRpgMakerSkin = function(skinName) {
    STUDIO.DatabaseManager.openWindow('skins', 'edit-skin-rpgmaker', function(){
      STUDIO.loadRpgMakerSkinData(skinName);
    });
  };
})();