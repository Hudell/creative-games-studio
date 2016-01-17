(function(){
  var path = require("path");

  TCHE.goToRpgMakerSpriteImportScreen = function(filePath) {
    TCHE.showMessage('File will need to be imported.');
  };

  TCHE.onChooseRpgMakerSpriteToImport = function(filePath) {
    if (TCHE.isFileImported(filePath)) {
      TCHE.showMessage('The selected image was already imported.');
      $('#import-rpgmaker-sprite-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'sprites', baseName);
    $('#import-rpgmaker-sprite-new-name').val(newPath);

    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#import-rpgmaker-sprite-width').val(width);
      $('#import-rpgmaker-sprite-height').val(height);
    });

    $('#import-rpgmaker-sprite-image-preview').html(img);
  };

  TCHE.onChooseRpgMakerSprite = function(filePath) {
    if (!TCHE.isFileImported(filePath)) {
      TCHE.goToRpgMakerSpriteImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#new-rpgmaker-sprite-width').val(width);
      $('#new-rpgmaker-sprite-height').val(height);
    });

    $('#new-rpgmaker-sprite-image-preview').html(img);
  };

  TCHE.onChooseRpgMakerSpriteToEdit = function(filePath) {
    if (!TCHE.isFileImported(filePath)) {
      TCHE.goToRpgMakerSpriteImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#edit-rpgmaker-sprite-width').val(width);
      $('#edit-rpgmaker-sprite-height').val(height);
    });

    $('#edit-rpgmaker-sprite-image-preview').html(img);
  };

  TCHE.saveNewRpgMakerSprite = function() {
    var imageFile = $('#new-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to use.");
    }

    if (!TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var spriteName = $('#new-rpgmaker-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error("You need to give this sprite a name.");
    }

    var width = $('#new-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#new-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    var index = $('input[name="new-rpgmaker-sprite-index"]:checked').val();
    if (!index || isNaN(index) || index < 0 || index >= 8) {
      throw new Error("Invalid Index.");
    }

    if (TCHE.gameData.sprites[spriteName] !== undefined) {
      throw new Error("A sprite called " + spriteName + " already exists.");
    }

    var imageRelativePath = imageFile.replace(TCHE.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    TCHE.gameData.sprites[spriteName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath,
      "imageWidth" : width,
      "imageHeight" : height,
      "index" : index
    };

    TCHE.markAsModified();
    TCHE.openWindow('sprites');
  };

  TCHE.importRpgMakerSprite = function() {
    var imageFile = $('#import-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was already imported.");
    }

    var width = $('#import-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#import-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    var newName = $('#import-rpgmaker-sprite-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error("You need to give this file a new name.");
    }

    for (var i = 0; i < 8; i++) {
      var name = $('#import-rpgmaker-sprite-name-' + i).val();
      if (!name || !name.trim()) {
        continue;
      }

      if (TCHE.gameData.sprites[name] !== undefined) {
        throw new Error("A sprite called " + name + " already exists.");
      }
    }

    var newPath = path.join(TCHE.loadedGame.folder, newName);
    TCHE.copyFileSync(imageFile, newPath);

    for (var i = 0; i < 8; i++) {
      var name = $('#import-rpgmaker-sprite-' + i).val();
      if (!name || !name.trim()) {
        continue;
      }

      TCHE.gameData.sprites[name] = {
        "type" : "rpgmaker",
        "image" : newName,
        "imageWidth" : width,
        "imageHeight" : height,
        "index" : i
      };      
    }

    TCHE.markAsModified();
    TCHE.openWindow('sprites');
  };


  TCHE.saveOldRpgMakerSprite = function(){
    var spriteName = $('#edit-rpgmaker-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error("I forgot what sprite you were modifying. Try again.");
    }

    var data = TCHE.gameData.sprites[spriteName];
    if (!data) {
      throw new Error("I couldn't find the existing sprite data.");
    }

    var imageFile = $('#edit-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      imageFile = path.join(TCHE.loadedGame.folder, data.image);
    }

    if (!TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var width = $('#edit-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#edit-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    var index = $('input[name="edit-rpgmaker-sprite-index"]:checked').val();
    if (!index || isNaN(index) || index < 0 || index >= 8) {
      throw new Error("Invalid Index.");
    }

    var imageRelativePath = imageFile.replace(TCHE.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    data.image = imageRelativePath;
    data.imageWidth = width;
    data.imageHeight = height;
    data.index = index;

    TCHE.gameData.sprites[spriteName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath,
      "imageWidth" : width,
      "imageHeight" : height,
      "index" : index
    };

    TCHE.markAsModified();
    TCHE.openWindow('sprites');
  };

  TCHE.loadRpgMakerSpriteData = function(spriteName) {
    var spriteData = TCHE.gameData.sprites[spriteName];

    var fullImagePath = path.join(TCHE.loadedGame.folder, spriteData.image);

    var img = $("<img src='" + fullImagePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#edit-rpgmaker-sprite-width').val(width);
      $('#edit-rpgmaker-sprite-height').val(height);
    });
    $('#edit-rpgmaker-sprite-image-preview').html(img);
    
    $('#edit-rpgmaker-sprite-name').val(spriteName);
    $('input[name="edit-rpgmaker-sprite-index"]').attr('checked', null);
    $('#edit-rpgmaker-sprite-index-' + spriteData.index).attr('checked', 'checked');


  };

  TCHE.editRpgMakerSprite = function(spriteName) {
    TCHE.openWindow('edit-sprite-rpgmaker', function(){
      TCHE.loadRpgMakerSpriteData(spriteName);
    });
  };
})();