(function(){
  var path = require("path");

  TCHE.goToRpgMakerSkinImportScreen = function(filePath) {
    TCHE.showMessage('File will need to be imported.');
  };

  TCHE.onChooseRpgMakerSkinToImport = function(filePath) {
    if (TCHE.isFileImported(filePath)) {
      TCHE.showMessage('The selected image was already imported.');
      $('#import-rpgmaker-skin-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'skins', baseName);
    $('#import-rpgmaker-skin-new-name').val(newPath);

    var img = $("<img src='" + filePath + "'>");
    $('#import-rpgmaker-skin-image-preview').html(img);
  };

  TCHE.onChooseRpgMakerSkin = function(filePath) {
    if (!TCHE.isFileImported(filePath)) {
      TCHE.goToRpgMakerSkinImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    $('#new-rpgmaker-skin-image-preview').html(img);
  };

  TCHE.onChooseRpgMakerSkinToEdit = function(filePath) {
    if (!TCHE.isFileImported(filePath)) {
      TCHE.goToRpgMakerSkinImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    $('#edit-rpgmaker-skin-image-preview').html(img);
  };

  TCHE.saveNewRpgMakerSkin = function() {
    var imageFile = $('#new-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to use.");
    }

    if (!TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var skinName = $('#new-rpgmaker-skin-name').val();
    if (!skinName || !skinName.trim) {
      throw new Error("You need to give this skin a name.");
    }

    if (TCHE.gameData.skins[skinName] !== undefined) {
      throw new Error("A Skin called " + skinName + " already exists.");
    }

    var imageRelativePath = imageFile.replace(TCHE.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    TCHE.gameData.skins[skinName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath
    };

    TCHE.markAsModified();
    TCHE.openWindow('skins');
  };

  TCHE.importRpgMakerSkin = function() {
    var imageFile = $('#import-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was already imported.");
    }

    var newName = $('#import-rpgmaker-skin-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error("You need to give this file a new name.");
    }

    var name = $('#import-rpgmaker-skin-name').val();
    if (!!name && !!name.trim()) {
      name = name.trim();
      if (TCHE.gameData.skins[name] !== undefined) {
        throw new Error("A skin called " + name + " already exists.");
      }
    } else {
      name = '';
    }
    
    var newPath = path.join(TCHE.loadedGame.folder, newName);
    TCHE.copyFileSync(imageFile, newPath);

    if (!!name) {
      TCHE.gameData.skins[name] = {
        "type" : "rpgmaker",
        "image" : newName
      };

      TCHE.markAsModified();
    }

    TCHE.openWindow('skins');
  };

  TCHE.saveOldRpgMakerSkin = function(){
    var skinName = $('#edit-rpgmaker-skin-name').val();
    if (!skinName || !skinName.trim) {
      throw new Error("I forgot what skin you were modifying. Try again.");
    }

    var data = TCHE.gameData.skins[skinName];
    if (!data) {
      throw new Error("I couldn't find the existing skin data.");
    }

    var imageFile = $('#edit-rpgmaker-skin-image').val();
    if (!imageFile || !imageFile.trim()) {
      imageFile = path.join(TCHE.loadedGame.folder, data.image);
    }

    if (!TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var imageRelativePath = imageFile.replace(TCHE.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    data.image = imageRelativePath;

    TCHE.gameData.skins[skinName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath
    };

    TCHE.markAsModified();
    TCHE.openWindow('skins');
  };

  TCHE.loadRpgMakerSkinData = function(skinName) {
    var skinData = TCHE.gameData.skins[skinName];
    var fullImagePath = path.join(TCHE.loadedGame.folder, skinData.image);

    var img = $("<img src='" + fullImagePath + "'>");
    $('#edit-rpgmaker-skin-image-preview').html(img);
    
    $('#edit-rpgmaker-skin-name').val(skinName);
    $('#edit-rpgmaker-skin-index-' + skinData.index).prop('checked', 'checked');
  };

  TCHE.editRpgMakerSkin = function(skinName) {
    TCHE.openWindow('edit-skin-rpgmaker', function(){
      TCHE.loadRpgMakerSkinData(skinName);
    });
  };
})();