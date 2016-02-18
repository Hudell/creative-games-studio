var STUDIO = {};
(function(){
  var path = require("path");
  var fs = require("fs");
  var gui = require('nw.gui');
  var win = gui.Window.get();
  STUDIO.win = win;
  STUDIO.version = 1;

  STUDIO.gameData = undefined;
  STUDIO.settings = {};
  STUDIO.modifiedMaps = {};
  STUDIO.modified = false;
  STUDIO.translation = null;
  STUDIO._pageCache = {};

  STUDIO.ensureValidSettings = function() {
    STUDIO.settings.folder = STUDIO.settings.folder || "";
    STUDIO.settings.language = STUDIO.settings.language || "";
    STUDIO.settings.tilesetZoomLevel = STUDIO.settings.tilesetZoomLevel || 1;
    STUDIO.settings.mapZoomLevel = STUDIO.settings.mapZoomLevel || 1;

    if (STUDIO.settings.showGrid !== true && STUDIO.settings.showGrid !== false) {
      STUDIO.settings.showGrid = true;
    }

    if (STUDIO.settings.offgridPlacement !== true && STUDIO.settings.offgridPlacement !== false) {
      STUDIO.settings.offgridPlacement = false;
    }

    if (STUDIO.settings.placeObjectsAnywhere !== true && STUDIO.settings.placeObjectsAnywhere !== false) {
      STUDIO.settings.placeObjectsAnywhere = false;
    }

    if (STUDIO.settings.showObjectNames !== true && STUDIO.settings.showObjectNames !== false) {
      STUDIO.settings.showObjectNames = true;
    }

    if (STUDIO.settings.showToolbarOnPlayTest !== true && STUDIO.settings.showToolbarOnPlayTest !== false) {
      STUDIO.settings.showToolbarOnPlayTest = false;
    }
  };

  STUDIO.ensureValidSettings();

  STUDIO.loadTranslation = function(fileName) {
    var fileName = path.join('translation', fileName + '.json');

    try {
      if (fs.existsSync(fileName)) {
        STUDIO.translation = STUDIO.loadJson(fileName);
        if (!STUDIO.translation) {
          STUDIO.translation = false;
        }
      } else {
        STUDIO.translation = false;
      }
    }
    catch(e) {
      STUDIO.translation = false;
    }
  };

  STUDIO.getTranslationMessage = function(key, englishTranslation) {
    if (englishTranslation === undefined || englishTranslation === false) {
      englishTranslation = key;
    }

    var key = key.trim();

    if (!STUDIO.translation) return englishTranslation;
    if (!STUDIO.translation[key]) return englishTranslation;

    return STUDIO.translation[key];
  };

  STUDIO.requestPage = function(pageName, onSuccess, onError) {
    // if (!!STUDIO._pageCache[pageName]) {
    //   var cache = STUDIO._pageCache[pageName];
    //   onSuccess.call(this, cache.result, cache.xhr);
    //   return;
    // }

    var mimeType = "text/html";
    var filePath = path.join('pages', pageName);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filePath);
    if (mimeType && xhr.overrideMimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onload = function(result){
      if (xhr.status < 400) {
        // STUDIO._pageCache[pageName] = {
        //   result : result,
        //   xhr : xhr
        // };

        onSuccess.call(this, result, xhr);
      } else {
        if (!!onError) {
          onError.call(this);
        }
      }
    };
    xhr.onerror = onError;
    xhr.send();
  };

  STUDIO.openDialog = function(element, title, buttons, width, height, onClose) {
    width = width || "auto";

    element.dialog({
      title : title || t('Information'),
      width : width,
      height : height,
      modal : true,
      close: function () {
        $(this).dialog('destroy').remove ();
        if (!!onClose) {
          onClose();
        }
      },
      buttons: buttons || [
        {
          text: "Ok",
          click: function() {
            $( this ).dialog( "close" );
          }
        }
      ]      
    });
  };

  STUDIO.confirmWithCancel = function(message, okCallback, noCallback, title, cancelCallback) {
    STUDIO.customConfirm(message, title || t("Confirmation"), t("Yes"), t("Cancel"), okCallback, cancelCallback, t("No"), noCallback);
  };

  STUDIO.confirm = function(message, okCallback, title, cancelCallback){
    STUDIO.customConfirm(message, title || t("Confirmation"), t("Ok"), t("Cancel"), okCallback, cancelCallback);
  };

  STUDIO.customConfirm = function(message, title, okLabel, cancelLabel, okCallback, cancelCallback, noLabel, noCallback) {
    var buttons = [];
    buttons.push({
      text : okLabel,
      click : function() {
        if (!!okCallback) {
          okCallback();
        }
        $(this).dialog("close");
      }
    });

    if (!!noLabel) {
      buttons.push({
        text : noLabel,
        click : function() {
          if (!!noCallback) {
            noCallback();
          }
          $(this).dialog("close");
        }
      });
    }

    buttons.push({
      text : cancelLabel,
      click : function() {
        if (!!cancelCallback) {
          cancelCallback();
        }
        $(this).dialog("close");
      }        
    });

    STUDIO.openDialog($("<div></div>").html(message), title, buttons);
  };

  STUDIO.deepClone = function(obj) {
    var result;
    if (obj instanceof Array) {
      return obj.map(function(i) { return STUDIO.deepClone(i); });
    } else if (obj && !obj.prototype && (typeof obj == 'object' || obj instanceof Object)) {
      result = {};
      for (var p in obj) {
        result[p] = STUDIO.deepClone(obj[p]);
      }
      return result;
    }
    return obj;
  };

  STUDIO.showMessage = function(message) {
    STUDIO.openDialog($("<div></div>").html(message));
  };

  STUDIO.showError = function(message) {
    console.error(message);
    STUDIO.openDialog($("<div></div>").html(message), t('Error'));
  };

  STUDIO.loadJson = function(fileName) {
    if (!fs.existsSync(fileName)) {
      throw new Error(t("File not found: ") + fileName);
      return;
    }

    var content = fs.readFileSync(fileName, {encoding : 'utf8'});

    return JSON.parse(content);
  };

  STUDIO.saveJson = function(fileName, json) {
    var dir = path.dirname(fileName);
    STUDIO.forceDirSync(dir);

    var content = JSON.stringify(json, null, '  ');
    fs.writeFileSync(fileName, content, {encoding : 'utf8'});
  };

  STUDIO.clearTableRows = function(tableId) {
    $('#' + tableId).children('tbody').html('');
  }

  STUDIO.addRowToTable = function(tableId, data, className, id) {
    var row = '<tr class="' + className + '-row clickable" data-element-id="' + id + '">';

    data.forEach(function(col){
      row += '<td>';
      row += col;
      row += '</td>';
    });

    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
  };

  STUDIO.openPopup = function(popupName, title, callback, buttons, width, height, onClose) {
    STUDIO.requestPage(path.join('popups', popupName + '.html'), function(result, xhr){
      STUDIO.openDialog($('<div></div>').html(xhr.responseText), title, buttons || [
        {
          text: t("Close"),
          click: function() {
            $(this).dialog("close");
          }
        }
      ], width, height, onClose);
      STUDIO.fixLinks();
      STUDIO.applyTranslation();

      if (!!callback) {
        callback();
      }
    });
  };

  STUDIO.openPopupForm = function(popupName, title, okCallback, loadCallback, closeCallback) {
    STUDIO.openPopup(popupName, title, loadCallback || false, [
      {
        text : t("Confirm"),
        click : function(){
          var canClose = true;
          if (!!okCallback) {
            canClose = okCallback() !== false;
          }

          if (canClose) {
            $(this).dialog("close");
          }
        }
      }
    ], undefined, undefined, closeCallback);
  };

  STUDIO.openWindow = function(windowName, callback) {
    if (windowName !== 'new-project') {
      if (!STUDIO.isGameLoaded()) {
        STUDIO.openWindow('new-project');
        STUDIO.showError(t("There's no game loaded."));
        return;
      }
    }

    STUDIO.requestPage(windowName + '.html', function(result, xhr){
      STUDIO._windowName = windowName;

      var id = 'content-wrapper';
      var html = xhr.responseText;
      
      $('#main-sidebar').addClass('hidden');
      $('.database-option-list').addClass('hidden');
      $('.file-manager-option-list').addClass('hidden');

      if (windowName == 'map-editor') {
        id = 'editor-wrapper';
      } else if (STUDIO.getCurrentContext() == 'database') {
        id = 'database-wrapper';
        $('#main-sidebar').removeClass('hidden');
        $('.database-option-list').removeClass('hidden');
      }

      html = '<div id="' + id + '">' + html + '</div>';

      $('#page-wrapper').html(html);
      $('#content-wrapper').height(window.innerHeight - 52);
      $('#database-wrapper').height(window.innerHeight - 52);
      $('.database-option-list').height(window.innerHeight - 52);

      STUDIO.fillSidebar();
      STUDIO.fixLinks();
      STUDIO.createMapMenu();
      STUDIO.applyTranslation();

      if (!!callback) {
        callback();
      }
    });
  };

  STUDIO.openMapEditor = function(mapName, callback) {
    STUDIO.MapEditor.openMapEditor(mapName, callback);
  };

  STUDIO.changeLoadedPath = function(newPath) {
    if (!STUDIO.settings) {
      STUDIO.loadSettings();
    }

    STUDIO.settings.folder = newPath;
    STUDIO.saveSettings();

    STUDIO.changeGamePath(newPath);
  };

  STUDIO.eventOpenWindow = function(event, windowName) {
    event.preventDefault();
    STUDIO.openWindow(windowName);
  };

  STUDIO.closeProject = function(){
    STUDIO.changeLoadedPath('');
    STUDIO.MapEditor.closeProject();
  };

  STUDIO.closeProjectAndRedirect = function() {
    STUDIO.closeProject();
    STUDIO.openWindow('new-project');
  };

  STUDIO.openProject = function(folderPath) {
    if (!fs.existsSync(path.join(folderPath, "game.json"))) {
      STUDIO.showError(t("Game Data not found"));
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'index.html'))) {
      STUDIO.showError(t("Game Index not found"));
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'main.js'))) {
      STUDIO.showError(t("Main Game not found"));
      return;
    }

    STUDIO.loadProject(folderPath);
  };

  STUDIO.saveProject = function() {
    if (!STUDIO.isGameLoaded()) {
      throw new Error(t("There's no game loaded."));
    }

    //If there's any save button visible on screen, click it.
    $('.btn-save').click();
    STUDIO.saveGameData();
    STUDIO.saveMaps();
    STUDIO.copyEngineFiles();
    STUDIO.markAsSaved();
    STUDIO.saveSettings();
  };

  STUDIO.copyEngineFiles = function() {
    var projectFolder = STUDIO.settings.folder;

    STUDIO.buildLibsFile(path.join(projectFolder, 'tche', 'libs.js'));
    STUDIO.buildDebugFile(projectFolder);
  };

  STUDIO.reloadProject = function() {

    location.reload();
  };

  STUDIO.reloadProjectButton = function() {
    if (STUDIO.isGameLoaded() && STUDIO.isGameModified()) {
      STUDIO.customConfirm(t("Unsaved changes will be lost."), t("Attention"), t("No problem."), t("Wait, No."), function(){
        STUDIO.reloadProject();
      });
    } else {
      STUDIO.reloadProject();
    }    
  };

  STUDIO.closeProjectButton = function() {
    if (!STUDIO.isGameLoaded()) {
      throw new Error(t("There's no game loaded."));
    }

    if (STUDIO.isGameModified()) {
      STUDIO.customConfirm(t("Unsaved changes will be lost."), t("Attention"), t("No problem."), t("Wait, No."), function(){
        STUDIO.closeProjectAndRedirect();
      });
    } else {
      STUDIO.closeProjectAndRedirect();
    }
  };

  STUDIO.newProject = function() {
    STUDIO.openWindow('new-project');
  };

  STUDIO.newProjectButton = function(){
    if (STUDIO.isGameModified()) {
      STUDIO.customConfirm(t("Unsaved changes will be lost."), t("Attention"), t("No problem."), t("Wait, No."), function(){
        STUDIO.newProject();
      });
    } else {
      STUDIO.newProject();
    }
  };

  STUDIO.playProject = function() {
    var newWin = gui.Window.open('file://' + STUDIO.settings.folder + '/debug.html', {
      position : 'center',
      title : STUDIO.gameData.name,
      toolbar : STUDIO.settings.showToolbarOnPlayTest
    });

    try {
      newWin.focus();
    }
    catch(e) {
    }

    try {
      newWin.setPosition("center");
    }
    catch(e) {
    }
  };

  STUDIO.playProjectButton = function(){
    if (!STUDIO.isGameLoaded()) {
      throw new Error(t("There's no game loaded."));
    }

    if (STUDIO.isGameModified()) {
      STUDIO.confirmWithCancel(t("Save before running?"), function(){
        STUDIO.saveProject();
        STUDIO.playProject();
      }, function(){
        STUDIO.playProject();
      });
    } else {
      STUDIO.playProject();
    }
  };

  STUDIO.removeFolderContent = function(folderPath) {
    var files;

    try {
      files = fs.readdirSync(folderPath);
    }
    catch(e) {
      console.log(t("Failed to clean folder content"), folderPath);
      STUDIO.showError(t("Failed to clean folder content"));
      return;
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(folderPath, files[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          STUDIO.removeFolderContent(filePath);
          fs.rmdirSync(filePath);
        }
      }
    }
  };

  STUDIO.copyFolderSync = function(folderPath, destinationPath) {
    var files = [];

    //check if folder needs to be created or integrated
    if (!fs.existsSync(destinationPath)) {
      STUDIO.forceDirSync(destinationPath);
    }

    //copy
    if (fs.lstatSync(folderPath).isDirectory() ) {
      files = fs.readdirSync(folderPath);
      files.forEach(function(file) {
        var curSource = path.join(folderPath, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          STUDIO.copyFolderSync(curSource, path.join(destinationPath, file));
        } else {
          STUDIO.copyFileSync(curSource, destinationPath);
        }
      });
    }
  };

  STUDIO.forceDirSync = function(dirPath) {
    var dirname = path.dirname(dirPath);
    if (!fs.existsSync(dirname)) {
      STUDIO.forceDirSync(dirname);
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  STUDIO.copyFileSync = function(source, target) {
    if (source == target) return;

    var targetFile = target;

    var dirname = path.dirname(target);
    if (!fs.existsSync(dirname)) {
      STUDIO.forceDirSync(dirname);
    }

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  };

  STUDIO.loadMaps = function() {
    STUDIO.modifiedMaps = {};
  };

  STUDIO.saveMaps = function() {
    for (var mapName in STUDIO.modifiedMaps) {
      STUDIO.saveMapData(mapName);
    }
  };

  STUDIO.changeMap = function(mapName, mapData) {
    STUDIO.markAsModified();
    STUDIO.modifiedMaps[mapName] = mapData;
    STUDIO.addRecentObject('map', mapName);
  };

  STUDIO.getMapData = function(mapName) {
    if (!!STUDIO.modifiedMaps[mapName]) {
      return STUDIO.modifiedMaps[mapName];
    }

    //If it's null, it's because the map was deleted, so don't load the data from the file
    if (STUDIO.modifiedMaps[mapName] === null) {
      return null;
    }

    var fileName = path.join(STUDIO.settings.folder, 'maps', mapName);
    if (fs.existsSync(fileName)) {
      return STUDIO.loadJson(fileName);
    } else {
      return null;
    }
  };

  STUDIO.saveMapData = function(mapName) {
    var mapData = STUDIO.getMapData(mapName);
    var filePath = path.join(STUDIO.settings.folder, 'maps', mapName);

    if (mapData === null) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        STUDIO.removeRecentObject('map', mapName);
      }
    } else {
      STUDIO.saveJson(filePath, mapData);
      STUDIO.addRecentObject('map', mapName);
    }
  };

  STUDIO.loadProject = function(folderPath) {
    STUDIO.changeLoadedPath(folderPath);
    STUDIO.loadGameData();

    if (STUDIO.isGameLoaded()) {
      STUDIO.loadMaps();
      STUDIO.markAsSaved();

      STUDIO.openLastMap();
    } else {
      STUDIO.openWindow('new-project');
    }
  };

  STUDIO.openLastMap = function() {
    if (STUDIO.isGameLoaded()) {
      if (STUDIO.MapEditor._currentMapName !== '') {
        STUDIO.openMapEditor(STUDIO.MapEditor._currentMapName);
      } else if (STUDIO.gameData._lastMapName !== '') {
        STUDIO.openMapEditor(STUDIO.gameData._lastMapName);
      } else {
        STUDIO.MapEditor.createNewMap();
      }
    } else {
      STUDIO.openWindow('new-project');
      STUDIO.showError(t("There's no game loaded."));
    }
  };

  STUDIO.openProjectDialog = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      STUDIO.openProject(dialog.val());
    });

    dialog.click();
  };

  STUDIO.changeGameTitle = function(newTitle) {
    // $('#gameName').html(newTitle);
  };

  STUDIO.changeGamePath = function(newPath) {
    win.title = t('title', 'Creative Studio') + ' - ' + newPath;
  };

  STUDIO.indexOfObjectOnRecentList = function(type, objectName) {
    if (!STUDIO.gameData) return -1;
    if (!STUDIO.gameData.recentObjects) return -1;

    for (var i = 0; i < STUDIO.gameData.recentObjects.length; i++) {
      var item = STUDIO.gameData.recentObjects[i];
      if (item.type == type && item.name == objectName) {
        return i;
      }
    }

    return -1;
  };

  STUDIO.removeRecentObject = function(type, objectName) {

  };

  STUDIO.addRecentObject = function(type, objectName) {
    if (!STUDIO.gameData) return;
    if (!STUDIO.gameData.recentObjects) {
      STUDIO.gameData.recentObjects = [];
    }

    var index = STUDIO.indexOfObjectOnRecentList(type, objectName);
    if (index < 0 && STUDIO.gameData.recentObjects.length >= 10) {
      index = 0;
    }

    if (index >= 0) {
      STUDIO.gameData.recentObjects.splice(index, 1);
    }

    STUDIO.gameData.recentObjects.push({type : type, name : objectName});
  };

  STUDIO.saveSettings = function() {
    STUDIO.settings.folder = STUDIO.settings.folder || '';
    STUDIO.settings.language = STUDIO.settings.language || '';

    STUDIO.saveJson('settings.json', STUDIO.settings);
  };

  STUDIO.loadSettings = function() {
    try {
      if (fs.existsSync('settings.json')) {
        STUDIO.settings = STUDIO.loadJson('settings.json');
      } else {
        console.log("Settings file not found.");
        STUDIO.settings = {};
      }
    }
    catch(e) {
      STUDIO.changeGamePath("");
      throw e;
    }

    STUDIO.ensureValidSettings();
    STUDIO.changeGamePath(STUDIO.settings.folder);
    STUDIO.loadTranslation(STUDIO.settings.language);
  };

  STUDIO.loadGameData = function() {
    try {
      STUDIO.gameData = STUDIO.loadJson(path.join(STUDIO.settings.folder, 'game.json'));
    }
    catch(e) {
      try{
        STUDIO.changeGameTitle(t("No Game Loaded"));
        STUDIO.closeProject();
      }
      catch(e) {
        console.error(e);
        STUDIO.showError(t("Game Data is missing and another error happened while closing the project."));
        return;
      }

      STUDIO.showError(t("Game Data is missing. The project was unloaded."));
      return;
    }

    STUDIO.validateGameData();
    if (!!STUDIO.gameData && !!STUDIO.gameData.name) {
      STUDIO.changeGameTitle(STUDIO.gameData.name);
    }
  };

  STUDIO.getAllScenes = function() {
    return STUDIO.gameData.tcheScenes.concat(STUDIO.gameData.gameScenes);
  };

  STUDIO.registerEngineScene = function(sceneName) {
    if (STUDIO.gameData.tcheScenes.indexOf(sceneName) < 0) {
      STUDIO.gameData.tcheScenes.push(sceneName);
    }
  };

  STUDIO.buildJSFile = function(filesToLoad, destinationPath) {
    var fullContent = '';

    for (var key in filesToLoad) {
      var fileData = filesToLoad[key].split('/');
      var filePath = 'engine';
      for (var i = 0; i < fileData.length; i++) {
        filePath = path.join(filePath, fileData[i]);
      }

      var content = fs.readFileSync(filePath, {encoding : 'utf8'});

      fullContent += "\n\n" + '// ' + key + "\n";
      fullContent += content;
    }

    fs.writeFileSync(destinationPath, fullContent, {encoding : 'utf8'});
  };

  STUDIO.buildLibsFile = function(destinationPath) {
    var files = {
      'FPS Meter' : 'libs/fpsmeter.min.js',
      'PIXI' : 'libs/pixi.min.js',
      'SoundJs' : 'libs/soundjs-0.6.2.min.js'
    };

    STUDIO.buildJSFile(files, destinationPath);
  };

  STUDIO.buildTcheFile = function(destinationPath) {
    var files = STUDIO.gameData.tcheScripts;
    
    STUDIO.buildJSFile(files, destinationPath);
  };

  STUDIO.buildDebugFile = function(destinationFolder) {
    var html = '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body style="margin: 0; overflow: hidden">';
    var files = STUDIO.gameData.tcheScripts;
    
    function copyFile(filePath) {
      STUDIO.copyFileSync(path.join('engine', filePath), path.join(destinationFolder, 'engine', filePath));
      html += '<script src="engine/' + filePath + '"></script>';
    }

    copyFile('libs/fpsmeter.js');
    copyFile('libs/pixi.js');
    copyFile('libs/soundjs-0.6.2.combined.js');

    for (var key in files) {
      copyFile(files[key]);
    }

    html += '<script src="main.js"></script></body></html>';

    fs.writeFileSync(path.join(destinationFolder, 'debug.html'), html, {encoding : 'utf8'});
  };

  STUDIO.registerAllEngineScripts = function() {
    STUDIO.gameData.tcheScripts = {};

    //Pollyfills
    STUDIO.registerEngineScript('Array.find', 'pollyfills/Array.find.js');

    //Trigger
    STUDIO.registerEngineScript('Trigger', 'libs/Trigger.js');

    //Tche
    STUDIO.registerEngineScript('Tche', 'Tche.js');
    //Helpers
    STUDIO.registerEngineScript('Ajax', 'helpers/Ajax.js');
    STUDIO.registerEngineScript('Clone', 'helpers/Clone.js');
    STUDIO.registerEngineScript('Object', 'helpers/Object.js');
    STUDIO.registerEngineScript('Params', 'helpers/Params.js');
    STUDIO.registerEngineScript('Resolution', 'helpers/Resolution.js');
    STUDIO.registerEngineScript('Validation', 'helpers/Validation.js');
    //Classes
    STUDIO.registerEngineScript('Character', 'classes/Character.js');
    STUDIO.registerEngineScript('CodeInterpreter', 'classes/CodeInterpreter.js');
    STUDIO.registerEngineScript('MapType', 'classes/MapType.js');
    STUDIO.registerEngineScript('ObjectType', 'classes/ObjectType.js');
    STUDIO.registerEngineScript('SkinType', 'classes/SkinType.js');
    STUDIO.registerEngineScript('Sprite', 'classes/Sprite.js');
    STUDIO.registerEngineScript('SpriteType', 'classes/SpriteType.js');
    STUDIO.registerEngineScript('WindowContent', 'classes/WindowContent.js');

    // Sprite Types
    STUDIO.registerEngineScript('Sprite Type - Image', 'spriteTypes/image.js');
    STUDIO.registerEngineScript('Sprite Type - RpgMaker', 'spriteTypes/rpgmaker.js');

    //Map Types
    STUDIO.registerEngineScript('Map Type - Tche', 'mapTypes/tche.js');
    STUDIO.registerEngineScript('Map Type - Tiled', 'mapTypes/tiled.js');

    //Skin Types
    STUDIO.registerEngineScript('Skin Type - RpgMaker', 'skinTypes/rpgmaker.js');

    //Object Types
    STUDIO.registerEngineScript('Object Type - Object', 'objectTypes/object.js');
    STUDIO.registerEngineScript('Object Type - Map Object', 'objectTypes/mapObject.js');
    STUDIO.registerEngineScript('Object Type - Creature', 'objectTypes/creature.js');
    STUDIO.registerEngineScript('Object Type - NPC', 'objectTypes/npc.js');
    STUDIO.registerEngineScript('Object Type - Player', 'objectTypes/player.js');

    //Sprites
    STUDIO.registerEngineScript('Character Sprite', 'sprites/CharacterSprite.js');
    STUDIO.registerEngineScript('Map Sprite', 'sprites/MapSprite.js');
    STUDIO.registerEngineScript('Tche Layer Sprite', 'sprites/TcheLayerSprite.js');
    STUDIO.registerEngineScript('Tche Object Layer Sprite', 'sprites/TcheObjectLayerSprite.js');
    STUDIO.registerEngineScript('Window Sprite', 'sprites/WindowSprite.js');

    // Map Sprites
    STUDIO.registerEngineScript('Tche Map Sprite', 'sprites/maps/TcheMap.js');
    STUDIO.registerEngineScript('Tiled Map Sprite', 'sprites/maps/TiledMap.js');

    // Window Sprites
    STUDIO.registerEngineScript('Choice Window Sprite', 'sprites/windows/ChoiceWindow.js');
    
    // Windows
    STUDIO.registerEngineScript('Message Window', 'windows/WindowMessage.js');
    STUDIO.registerEngineScript('Title Choices Window', 'windows/WindowTitleChoices.js');

    // Managers
    STUDIO.registerEngineScript('Code Manager', 'managers/CodeManager.js');
    STUDIO.registerEngineScript('File Manager', 'managers/FileManager.js');
    STUDIO.registerEngineScript('Input Manager', 'managers/InputManager.js');
    STUDIO.registerEngineScript('Map Manager', 'managers/MapManager.js');
    STUDIO.registerEngineScript('Message Manager', 'managers/MessageManager.js');
    STUDIO.registerEngineScript('Object Type Manager', 'managers/ObjectTypeManager.js');
    STUDIO.registerEngineScript('Resolution Manager', 'managers/ResolutionManager.js');
    STUDIO.registerEngineScript('Scene Manager', 'managers/SceneManager.js');
    STUDIO.registerEngineScript('Skin Manager', 'managers/SkinManager.js');
    STUDIO.registerEngineScript('Sound Manager', 'managers/SoundManager.js');
    STUDIO.registerEngineScript('Sprite Manager', 'managers/SpriteManager.js');
    STUDIO.registerEngineScript('Tile Manager', 'managers/TileManager.js');

    // Scenes
    STUDIO.registerEngineScript('Scene', 'scenes/Scene.js');
    STUDIO.registerEngineScript('Loading Scene', 'scenes/SceneLoading.js');
    STUDIO.registerEngineScript('Launch Scene', 'scenes/SceneLaunch.js');
    STUDIO.registerEngineScript('Map Loading Scene', 'scenes/SceneMapLoading.js');
    STUDIO.registerEngineScript('Map Scene', 'scenes/SceneMap.js');
    STUDIO.registerEngineScript('Window Scene', 'scenes/SceneWindow.js');
    STUDIO.registerEngineScript('Title Scene', 'scenes/SceneTitle.js');

    //Globals

    STUDIO.registerEngineScript('Map', 'globals/Map.js');
    STUDIO.registerEngineScript('Player', 'globals/Player.js');
  };

  STUDIO.registerEngineScript = function(scriptName, scriptPath) {
    if (STUDIO.gameData.tcheScripts[scriptName] === undefined) {
      STUDIO.gameData.tcheScripts[scriptName] = scriptPath;
    }
  };

  STUDIO.keyExists = function(object, key) {
    for (var objectKey in object) {
      if (objectKey.toLowerCase() == key.toLowerCase()) {
        return true;
      }
    }

    return false;
  };

  STUDIO.validateGameData = function() {
    if (!STUDIO.gameData.recentObjects) {
      STUDIO.gameData.recentObjects = [];
    }
    if (!STUDIO.gameData.skins) {
      STUDIO.gameData.skins = {};
    }
    if (!STUDIO.gameData.sprites) {
      STUDIO.gameData.sprites = {};
    }
    if (!STUDIO.gameData.tilesets) {
      STUDIO.gameData.tilesets = {};
    }
    if (!STUDIO.gameData.resolution) {
      STUDIO.gameData.resolution = {};
    }
    if (!STUDIO.gameData.player) {
      STUDIO.gameData.player = {};
    }
    if (!STUDIO.gameData.sounds) {
      STUDIO.gameData.sounds = {};
    }
    if (!STUDIO.gameData.maps) {
      STUDIO.gameData.maps = {};
    }
    if (!STUDIO.gameData.objects) {
      STUDIO.gameData.objects = {};
    }
    if (!STUDIO.gameData.variables) {
      STUDIO.gameData.variables = {};
    }
    if (!STUDIO.gameData.characters) {
      STUDIO.gameData.characters = {};
    }
    if (!STUDIO.gameData.languages) {
      STUDIO.gameData.languages = {};
    }
    if (!STUDIO.gameData.music) {
      STUDIO.gameData.music = {};
    }
    if (!STUDIO.gameData.soundEffects) {
      STUDIO.gameData.soundEffects = {};
    }
    if (!STUDIO.gameData.movies) {
      STUDIO.gameData.movies = {};
    }
    if (!STUDIO.gameData.items) {
      STUDIO.gameData.items = {};
    }
    if (!STUDIO.gameData.animations) {
      STUDIO.gameData.animations = {};
    }
    if (!STUDIO.gameData.faces) {
      STUDIO.gameData.faces = {};
    }
    if (!STUDIO.gameData.jobs) {
      STUDIO.gameData.jobs = {};
    }
    if (!STUDIO.gameData.enemies) {
      STUDIO.gameData.enemies = {};
    }
    if (!STUDIO.gameData.skills) {
      STUDIO.gameData.skills = {};
    }
    if (!STUDIO.gameData.states) {
      STUDIO.gameData.states = {};
    }
    if (!STUDIO.gameData.achievements) {
      STUDIO.gameData.achievements = {};
    }
    if (!STUDIO.gameData.huds) {
      STUDIO.gameData.huds = {};
    }
    if (!STUDIO.gameData.packages) {
      STUDIO.gameData.packages = {};
    }
    if (!STUDIO.gameData.vehicles) {
      STUDIO.gameData.vehicles = {};
    }

    if (!STUDIO.gameData.tcheScenes) {
      STUDIO.gameData.tcheScenes = [];
    }

    if (!STUDIO.gameData.version) {
      STUDIO.gameData.version = STUDIO.version;
    }

    if (!STUDIO.gameData._lastMapName) {
      STUDIO.gameData._lastMapName = '';
    }

    if (!STUDIO.gameData.tcheScripts) {
      STUDIO.gameData.tcheScripts = {};
    }

    if (!STUDIO.gameData.scripts) {
      STUDIO.gameData.scripts = {};
    };

    STUDIO.registerEngineScene('SceneMap');
    STUDIO.registerEngineScene('SceneTitle');

    STUDIO.registerAllEngineScripts();

    if (!STUDIO.gameData.gameScenes) {
      STUDIO.gameData.gameScenes = [];
    }

    STUDIO.gameData.resolution.width = STUDIO.gameData.resolution.width || 640;
    STUDIO.gameData.resolution.height = STUDIO.gameData.resolution.height || 360;
    STUDIO.gameData.resolution.screenWidth = STUDIO.gameData.resolution.screenWidth || 1280;
    STUDIO.gameData.resolution.screenHeight = STUDIO.gameData.resolution.screenHeight || 720;
    STUDIO.gameData.resolution.useDynamicResolution = STUDIO.gameData.resolution.useDynamicResolution || false;
    STUDIO.gameData.name = STUDIO.gameData.name || t("Untitled Project");
    STUDIO.gameData.initialMap = STUDIO.gameData.initialMap || "";
    STUDIO.gameData.initialScene = STUDIO.gameData.initialScene || "SceneTitle";
    STUDIO.gameData.mainSkin = STUDIO.gameData.mainSkin || "system";
  };

  STUDIO.saveGameData = function() {
    STUDIO.gameData.version = STUDIO.version;
    STUDIO.saveJson(path.join(STUDIO.settings.folder, 'game.json'), STUDIO.gameData);
  };

  STUDIO.markAsSaved = function(){
    STUDIO.modified = false;
    $('#save-btn').css('color', '#337ab7');
  };

  STUDIO.markAsModified = function(){
    STUDIO.modified = true;

    $('#save-btn').css('color', 'red');
  };

  STUDIO.isFileImported = function(filePath) {
    var loadedPath = STUDIO.settings.folder;

    return filePath.indexOf(loadedPath) === 0;
  };

  STUDIO.openCodeEditor = function() {
    STUDIO.openWindow('code-editor', function(){
      var el = document.getElementById('code-editor');
      el.innerHTML = '';

      CodeMirror(el);
    });
  };

  STUDIO.isGameLoaded = function(){
    return !!STUDIO.settings.folder && !!STUDIO.gameData;
  };

  STUDIO.isGameModified = function() {
    return STUDIO.isGameLoaded() && STUDIO.modified;
  };

  STUDIO.exit = function(){
    STUDIO.win.close(true);
  };

  STUDIO.updateCounters = function() {
    $('#map-count').html(Object.keys(STUDIO.gameData.maps).length);
    
    $('#variable-count').html(Object.keys(STUDIO.gameData.variables).length);
    $('#object-count').html(Object.keys(STUDIO.gameData.objects).length);
    $('#sprite-count').html(Object.keys(STUDIO.gameData.sprites).length);
    $('#tileset-count').html(Object.keys(STUDIO.gameData.tilesets).length);
    $('#character-count').html(Object.keys(STUDIO.gameData.characters).length);

    $('#language-count').html(Object.keys(STUDIO.gameData.languages).length);
    $('#music-count').html(Object.keys(STUDIO.gameData.music).length);
    $('#sound-count').html(Object.keys(STUDIO.gameData.soundEffects).length);
    $('#movie-count').html(Object.keys(STUDIO.gameData.movies).length);

    $('#item-count').html(Object.keys(STUDIO.gameData.items).length);
    $('#animation-count').html(Object.keys(STUDIO.gameData.animations).length);
    $('#face-count').html(Object.keys(STUDIO.gameData.faces).length);
    $('#skin-count').html(Object.keys(STUDIO.gameData.skins).length);

    $('#class-count').html(Object.keys(STUDIO.gameData.jobs).length);
    $('#enemy-count').html(Object.keys(STUDIO.gameData.enemies).length);
    $('#skill-count').html(Object.keys(STUDIO.gameData.skills).length);
    $('#state-count').html(Object.keys(STUDIO.gameData.states).length);

    $('#achievement-count').html(Object.keys(STUDIO.gameData.achievements).length);
    $('#hud-count').html(Object.keys(STUDIO.gameData.huds).length);
    $('#package-count').html(Object.keys(STUDIO.gameData.packages).length);
    $('#vehicle-count').html(Object.keys(STUDIO.gameData.vehicles).length);
  };

  STUDIO.exitButton = function(){
    if (STUDIO.isGameModified()) {
      STUDIO.confirmWithCancel(t("Save before leaving?"), function(){
        STUDIO.saveProject();
        STUDIO.exit();
      }, function(){
        STUDIO.exit();
      });
    } else {
      STUDIO.exit();
    }
  };

  STUDIO.onLoad = function(){
    $('#index-btn').on('click', function(event) { STUDIO.eventOpenWindow(event, 'index'); });    

    $('#database-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.DatabaseManager.openDatabaseWindow();
    });

    $('#plugins-btn').on('click', function(event) { STUDIO.eventOpenWindow(event, 'plugins'); });
    $('#code-editor-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.openCodeEditor();
    });
    
    $('#open-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.openProjectDialog();
    });
    $('#close-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.closeProjectButton();
    });
    $('#save-btn').on('click', function(event) {
      event.preventDefault();            
      STUDIO.saveProject();
    });
    $('#reload-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.reloadProjectButton();
    });
    $('#new-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.newProjectButton();
    });
    $('#play-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.playProjectButton();
    });

    $('#exit-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.exitButton();
    });

    STUDIO.DatabaseManager.attachEvents();

    STUDIO.loadSettings();
    if (!!STUDIO.settings.folder) {
      STUDIO.loadProject(STUDIO.settings.folder);
    } else {
      STUDIO.openWindow('new-project');
    }

    STUDIO.fillSidebar();

    window.addEventListener('resize', function(){
      $('#content-wrapper').height(window.innerHeight - 52);
      $('#editor-wrapper').height(window.innerHeight - 104);
      $('#database-wrapper').height(window.innerHeight - 52);
      $('.database-option-list').height(window.innerHeight - 52);
      $('.map-editor-tileset').height(window.innerHeight - 104);
    });

    if (win._events !== undefined && win._events.close !== undefined) {
      delete win._events.close;
    }

    win.on('close', function(){
      STUDIO.exitButton();
    });

    STUDIO.applyTranslation();

    $("#error").addClass("hidden");
    $("#wrapper").removeClass("hidden");
  };

  STUDIO.createMapMenu = function() {
    var el = $('#map-menu');
    el.html('');

    if (STUDIO._windowName !== 'map-editor') {
      el.append('<li><a id="current-map-btn" href="#"><i class="fa fa-map-o fa-fw"></i> ' + t("Map Editor") + '</a></li>');
      el.append('<li class="divider"></li>');
    }

    el.append('<li><a id="btn-new-map" href="#"><i class="fa fa-plus fa-fw"></i> ' + t("New Map") + '</a></li>');
    el.append('<li><a id="list-maps-btn" href="#"><i class="fa fa-list fa-fw"></i> ' + t("List Maps") + '</a></li>');

    if (STUDIO._windowName === 'map-editor') {
      el.append('<li class="divider"></li>');
      el.append('<li><a id="current-map-settings-btn" href="#"><i class="fa fa-wrench fa-fw"></i> ' + t("Map Settings") + '</a></li>');
      el.append('<li><a id="delete-current-map-btn" href="#"><i class="fa fa-remove fa-fw"></i> ' + t("Delete Current Map") + '</a></li>');
    }

    $('#current-map-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.openLastMap();
    });

    $('#current-map-settings-btn').on('click', function(event){
      event.preventDefault();
      STUDIO.MapEditor.openMapSettings();
    });
    $('#list-maps-btn').on('click', function(event) { STUDIO.eventOpenWindow(event, 'maps'); });
    $('#btn-new-map').on('click', function(event) {
      event.preventDefault();
      STUDIO.MapEditor.createNewMap();
    });
    $('#delete-current-map-btn').on('click', function(event) {
      event.preventDefault();
      STUDIO.MapEditor.removeCurrentMapConfirmation();
    });
  };

  STUDIO.getCurrentContext = function() {
    var windowName = STUDIO._windowName;
    if (!windowName) {
      return 'index';
    }

    if (windowName == 'map-editor') {
      return 'map-editor';
    }

    if (windowName.indexOf('database') >= 0) {
      return 'database';
    }

    return 'index';
  };

  STUDIO.fillSidebar = function() {
    STUDIO.fillRecentList('history-list');

    $('.recent-link').on('click', function(event){
      event.preventDefault();
      var name = event.currentTarget.dataset.name;
      var type = event.currentTarget.dataset.type;

      STUDIO.editObject(type, name);
    });
  };

  STUDIO.removeFileExtension = function(fileName) {
    if (fileName.indexOf(".") < 0) return fileName;

    var list = fileName.split('.');
    list.pop();

    return list.join('.');
  };

  STUDIO.fillRecentList = function(ulId) {
    if (!STUDIO.gameData) return;
    if (!STUDIO.gameData.recentObjects) return;

    var ul = $('#' + ulId);

    ul.html('');

    var list = STUDIO.gameData.recentObjects;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var icon = 'fa-copy';

      switch (item.type) {
        case 'map' :
          icon = 'fa-globe';
          break;
        case 'skin' :
          icon = 'fa-sticky-note-o';
          break;
        case 'sprite' :
          icon = 'fa-image';
          break;
        case 'object' :
          icon = 'fa-umbrella';
          break;
      }

      var visibleName = item.name;
      if (item.type == 'map') {
        visibleName = STUDIO.removeFileExtension(visibleName);
      }

      ul.append('<li><a class="recent-link" data-type="' + item.type + '" data-name="' + item.name + '" href="#"><i class="menu-option fa ' + icon + ' fa-fw"></i> ' + visibleName + '</a></li>');
    }
  };

  STUDIO.editObject = function(objectType, objectName) {
    switch(objectType) {
      case 'map' :
        STUDIO.editMap(objectName);
        break;
      case 'skin' :
        STUDIO.editSkin(objectName);
        break;
      case 'sprite' :
        STUDIO.editSprite(objectName);
        break;
      case 'object' :
        STUDIO.ObjectManager.editObject(objectName);
        break;
    }
  };

  STUDIO.getImageRelativePath = function(imageFile) {
    var imageRelativePath = imageFile.replace(STUDIO.settings.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    return imageRelativePath;
  };

  STUDIO.fixLinks = function(){
    setTimeout(function(){
      $('a[target=_blank]').on('click', function(){
        require('nw.gui').Shell.openExternal( this.href );
        return false;
      });
    }, 100);
  };

  STUDIO.translateSpans = function() {
    var elements = $('.translation-span');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.innerHTML;

      if (!!key) {
        el.innerHTML = t(key);
        el.className = el.className.replace(/\btranslation-span\b/, '');
      }
    }
  };

  STUDIO.translateTitles = function() {
    var elements = $('.translation-title');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.title;

      if (!!key) {
        el.title = t(key);
        el.className = el.className.replace(/\btranslation-title\b/, '');
      }
    }
  };

  STUDIO.translatePlaceholders = function() {
    var elements = $('.translation-placeholder');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.placeholder;

      if (!!key) {
        el.placeholder = t(key);
        el.className = el.className.replace(/\btranslation-placeholder\b/, '');
      }
    }
  };

  STUDIO.applyTranslation = function() {
    STUDIO.translateSpans();
    STUDIO.translateTitles();
    STUDIO.translatePlaceholders();
  };

  STUDIO.loaded = true;
})();

window.t = STUDIO.getTranslationMessage;