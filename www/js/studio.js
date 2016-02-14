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

    STUDIO.copyFolderSync(path.join('emptyGame', 'tche'), path.join(projectFolder, 'tche'));
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
    var newWin = gui.Window.open('file://' + STUDIO.settings.folder + '/index.html?debug', {
      position : 'center',
      title : STUDIO.gameData.name,
      toolbar : false
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
      fs.unlinkSync(filePath);
      STUDIO.removeRecentObject('map', mapName);
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

    STUDIO.registerEngineScene('SceneMap');
    STUDIO.registerEngineScene('SceneTitle');

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