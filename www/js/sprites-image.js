(function(){
  var path = require("path");

  STUDIO.goToImageSpriteImportScreen = function(filePath) {
    STUDIO.showMessage('File will need to be imported.');
  };

  STUDIO.showImageSpritePreview = function(filePath, prefix) {
    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#' + prefix + '-image-sprite-width').val(width);
      $('#' + prefix + '-image-sprite-height').val(height);
    });

    $('#' + prefix + '-image-sprite-image-preview').html(img);
  };

  STUDIO.onChooseImageSpriteToImport = function(filePath) {
    if (STUDIO.isFileImported(filePath)) {
      STUDIO.showMessage('The selected image was already imported.');
      $('#import-image-sprite-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'sprites', baseName);
    $('#import-image-sprite-new-name').val(newPath);

    STUDIO.showImageSpritePreview(filePath, 'import');
  };

  STUDIO.onChooseImageSprite = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToImageSpriteImportScreen(filePath);
      return;
    }

    STUDIO.showImageSpritePreview(filePath, 'new');
  };

  STUDIO.onChooseImageSpriteToEdit = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToImageSpriteImportScreen(filePath);
      return;
    }

    STUDIO.showImageSpritePreview(filePath, 'edit');
  };

  STUDIO.validateImageSpriteData = function(prefix, requireImage) {
    var imageFile = $('#' + prefix + '-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      if (requireImage) {
        throw new Error("Select a file to use.");
      }
    } else {
      if (!STUDIO.isFileImported(imageFile.trim())) {
        throw new Error("The selected image file was not imported.");
      }
    }

    var width = $('#' + prefix + '-image-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#' + prefix + '-image-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }
  };

  STUDIO.saveOldImageSprite = function() {
    var spriteName = $('#edit-image-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error("I forgot what sprite you were modifying, sorry.");
    }

    STUDIO.validateImageSpriteData('edit');

    var data = STUDIO.gameData.sprites[spriteName];

    if (!data) {
      throw new Error("I couldn't find the existing sprite data.");
    }

    var imageFile = $('#edit-image-sprite-image').val().trim();
    var width = $('#edit-image-sprite-width').val();
    var height = $('#edit-image-sprite-height').val();
    var imageRelativePath = STUDIO.getImageRelativePath(imageFile);

    data.type = 'image';
    data.image = imageRelativePath;
    data.width = width;
    data.height = height;

    STUDIO.gameData.sprites[spriteName] = data;

    STUDIO.addRecentObject('sprite', spriteName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };

  STUDIO.removeCurrentImageSprite = function() {
    var skinName = $('#edit-image-sprite-name').val();
    STUDIO.removeSprite(skinName);
  };  

  STUDIO.saveNewImageSprite = function() {
    var spriteName = $('#new-image-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error("You need to give this sprite a name.");
    }

    STUDIO.validateImageSpriteData('new');

    if (STUDIO.gameData.sprites[spriteName] !== undefined) {
      throw new Error("A sprite called " + spriteName + " already exists.");
    }

    var imageFile = $('#new-image-sprite-image').val().trim();
    var width = $('#new-image-sprite-width').val();
    var height = $('#new-image-sprite-height').val();
    var imageRelativePath = STUDIO.getImageRelativePath(imageFile);

    STUDIO.gameData.sprites[spriteName] = {
      "type" : "image",
      "image" : imageRelativePath,
      "width" : width,
      "height" : height
    };

    STUDIO.addRecentObject('sprite', spriteName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };

  STUDIO.importImageSprite = function() {
    var imageFile = $('#import-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (STUDIO.isFileImported(imageFile)) {
      throw new Error("The selected image file was already imported.");
    }

    var width = $('#import-image-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#import-image-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    var newName = $('#import-image-sprite-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error("You need to give this file a new name.");
    }

    var name = $('#import-image-sprite-name').val();
    if (!!name && !!name.trim()) {
      if (STUDIO.gameData.sprites[name] !== undefined) {
        throw new Error("A sprite called " + name + " already exists.");
      }
    }

    var newPath = path.join(STUDIO.settings.folder, newName);
    STUDIO.copyFileSync(imageFile, newPath);

    if (!!name && !!name.trim()) {
      STUDIO.gameData.sprites[name] = {
        "type" : "image",
        "image" : newName,
        "width" : width,
        "height" : height
      };
    }

    STUDIO.markAsModified();    
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };

  STUDIO.loadImageSpriteData = function(spriteName) {
    var spriteData = STUDIO.gameData.sprites[spriteName];
    var fullImagePath = path.join(STUDIO.settings.folder, spriteData.image);

    STUDIO.showImageSpritePreview(fullImagePath, 'edit');
    $('#edit-image-sprite-name').val(spriteName);
  };

  STUDIO.editImageSprite = function(spriteName) {
    STUDIO.DatabaseManager.openWindow('sprites', 'edit-sprite-image', function(){
      STUDIO.loadImageSpriteData(spriteName);
    });
  };  
})();