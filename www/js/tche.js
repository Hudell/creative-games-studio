$(function(){
  window.onerror = function(msg, url, line, col, error) {
    TCHE.openDialog($("<div></div>").html(error.message), 'Error');
    return false;
  };
});

var TCHE = {};
(function(){
  var path = require("path");
  var fs = require("fs");
  var gui = require('nw.gui');
  var win = gui.Window.get();
  TCHE.win = win;


  TCHE.gameData = undefined;
  TCHE.loadedGame = {
    folder : "",
    recentObjects : []
  };
  TCHE.modified = false;

  TCHE.requestPage = function(pageName, onSuccess, onError) {
    var mimeType = "text/html";
    var filePath = path.join('pages', pageName);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filePath);
    if (mimeType && xhr.overrideMimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onload = function(result){
      if (xhr.status < 400) {
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

  TCHE.openDialog = function(element, title, buttons) {
    element.dialog({
      title : title || "Information",
      width : 'auto',
      modal : true,
      close: function () {
        $(this).dialog('destroy').remove ();
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

  TCHE.confirm = function(message, okCallback, title, cancelCallback){
    TCHE.customConfirm(message, title || "Confirmation", "Ok", "Cancel", okCallback, cancelCallback);
  };

  TCHE.customConfirm = function(message, title, okLabel, cancelLabel, okCallback, cancelCallback) {
    TCHE.openDialog($("<div></div>").html(message), title, [
      {
        text : okLabel,
        click : function() {
          if (!!okCallback) {
            okCallback();
          }
          $(this).dialog("close");
        }
      },
      {
        text : cancelLabel,
        click : function() {
          if (!!cancelCallback) {
            cancelCallback();
          }
          $(this).dialog("close");
        }        
      }
    ]);
  };

  TCHE.deepClone = function(obj) {
    var result;
    if (obj instanceof Array) {
      return obj.map(function(i) { return TCHE.deepClone(i); });
    } else if (obj && !obj.prototype && (typeof obj == 'object' || obj instanceof Object)) {
      result = {};
      for (var p in obj) {
        result[p] = TCHE.deepClone(obj[p]);
      }
      return result;
    }
    return obj;
  };

  TCHE.showMessage = function(message) {
    TCHE.openDialog($("<div></div>").html(message));
  };

  TCHE.showError = function(message) {
    console.error(message);
    TCHE.openDialog($("<div></div>").html(message), 'Error');
  };

  TCHE.loadJson = function(fileName) {
    if (!fs.existsSync(fileName)) {
      throw new Error("File not found: " + fileName);
      return;
    }

    var content = fs.readFileSync(fileName, {encoding : 'utf8'});

    return JSON.parse(content);
  };

  TCHE.saveJson = function(fileName, json) {
    var dir = path.dirname(fileName);
    TCHE.forceDirSync(dir);

    var content = JSON.stringify(json, null, '  ');
    fs.writeFileSync(fileName, content, {encoding : 'utf8'});
  };

  TCHE.clearTableRows = function(tableId) {
    $('#' + tableId).children('tbody').html('');
  }

  TCHE.addRowToTable = function(tableId, data, className, id) {
    var row = '<tr class="' + className + '-row clickable" data-element-id="' + id + '">';

    data.forEach(function(col){
      row += '<td>';
      row += col;
      row += '</td>';
    });

    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
  };

  TCHE.openPopup = function(popupName, title, callback, buttons) {
    TCHE.requestPage(path.join('popups', popupName + '.html'), function(result, xhr){
      TCHE.openDialog($('<div></div>').html(xhr.responseText), title, buttons || [
        {
          text: "Close",
          click: function() {
            $(this).dialog("close");
          }
        }
      ]);
      TCHE.fixLinks();

      if (!!callback) {
        callback();
      }
    });
  };

  TCHE.openPopupForm = function(popupName, title, okCallback, loadCallback) {
    TCHE.openPopup(popupName, title, loadCallback || false, [
      {
        text : "Confirm",
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
    ]);
  };

  TCHE.openWindow = function(windowName, callback) {
    if (windowName !== 'new-project') {
      if (!TCHE.isGameLoaded()) {
        TCHE.openWindow('new-project');

        if (windowName !== 'index') {
          TCHE.showError("There's no game loaded.");
          return;
        } else {
          return;
        }
      }
    }

    TCHE.requestPage(windowName + '.html', function(result, xhr){
      TCHE._windowName = windowName;
      $('#page-wrapper').html(xhr.responseText);

      TCHE.fillSidebar();
      TCHE.fixLinks();

      if (!!callback) {
        callback();
      }
    });

    $('#' + windowName + '-btn').addClass('active');
  };

  TCHE.changeLoadedPath = function(newPath) {
    if (!TCHE.loadedGame) {
      TCHE.loadLoadedGameInfo();
    }

    TCHE.loadedGame.folder = newPath;
    TCHE.saveLoadedGame();

    TCHE.changeGamePath(newPath);
  };

  TCHE.eventOpenWindow = function(event, windowName) {
    event.preventDefault();
    TCHE.openWindow(windowName);
  };

  TCHE.closeProject = function(){
    TCHE.changeLoadedPath('');
  };

  TCHE.openProject = function(folderPath) {
    if (!fs.existsSync(path.join(folderPath, "game.json"))) {
      TCHE.showError("Game Data not found");
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'index.html'))) {
      TCHE.showError("Game Index not found");
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'main.js'))) {
      TCHE.showError("Main Game not found");
      return;
    }

    TCHE.loadProject(folderPath);
  };

  TCHE.saveProject = function() {
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    //If there's any save button visible on screen, click it.
    $('.btn-save').click();
    TCHE.saveGameData();
    TCHE.copyEngineFiles();
    TCHE.markAsSaved();
    TCHE.saveLoadedGame();
  };

  TCHE.copyEngineFiles = function() {
    var projectFolder = TCHE.loadedGame.folder;

    TCHE.copyFolderSync(path.join('emptyGame', 'tche'), path.join(projectFolder, 'tche'));
  };

  TCHE.reloadProject = function() {
    location.reload();
  };

  TCHE.reloadProjectButton = function() {
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    if (TCHE.isGameModified()) {
      TCHE.customConfirm("Unsaved changes will be lost.", "Attention", "No problem.", "Wait, No.", function(){
        TCHE.reloadProject();
      });
    } else {
      TCHE.reloadProject();
    }    
  };

  TCHE.newProject = function() {
    TCHE.openWindow('new-project');
  };

  TCHE.newProjectButton = function(){
    if (TCHE.isGameModified()) {
      TCHE.customConfirm("Unsaved changes will be lost.", "Attention", "No problem.", "Wait, No.", function(){
        TCHE.newProject();
      });
    } else {
      TCHE.newProject();
    }
  };

  TCHE.playProject = function() {
    var newWin = gui.Window.open('file://' + TCHE.loadedGame.folder + '/index.html?debug', {
      position : 'center',
      title : TCHE.gameData.name,
      toolbar : true
    });
  };

  TCHE.playProjectButton = function(){
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    if (TCHE.isGameModified()) {
      TCHE.confirm("Save before running?", function(){
        TCHE.saveProject();
        TCHE.playProject();
      });
    } else {
      TCHE.playProject();
    }
  };

  TCHE.removeFolderContent = function(folderPath) {
    var files;

    try {
      files = fs.readdirSync(folderPath);
    }
    catch(e) {
      console.log("Failed to clean folder content", folderPath);
      TCHE.showError("Failed clean folder content");
      return;
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(folderPath, files[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          TCHE.removeFolderContent(filePath);
          fs.rmdirSync(filePath);
        }
      }
    }
  };

  TCHE.copyFolderSync = function(folderPath, destinationPath) {
    var files = [];

    //check if folder needs to be created or integrated
    if (!fs.existsSync(destinationPath)) {
      TCHE.forceDirSync(destinationPath);
    }

    //copy
    if (fs.lstatSync(folderPath).isDirectory() ) {
      files = fs.readdirSync(folderPath);
      files.forEach(function(file) {
        var curSource = path.join(folderPath, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          TCHE.copyFolderSync(curSource, path.join(destinationPath, file));
        } else {
          TCHE.copyFileSync(curSource, destinationPath);
        }
      });
    }
  };

  TCHE.forceDirSync = function(dirPath) {
    var dirname = path.dirname(dirPath);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  TCHE.copyFileSync = function(source, target) {
    if (source == target) return;

    var targetFile = target;

    var dirname = path.dirname(target);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  };

  TCHE.loadProject = function(folderPath) {
    TCHE.changeLoadedPath(folderPath);
    TCHE.loadGameData();
    TCHE.markAsSaved();
  };

  TCHE.openProjectDialog = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      TCHE.openProject(dialog.val());
    });

    dialog.click();
  };

  TCHE.changeGameTitle = function(newTitle) {
    // $('#gameName').html(newTitle);
  };

  TCHE.changeGamePath = function(newPath) {
    win.title = 'TCHE Editor - ' + newPath;
  };

  TCHE.indexOfObjectOnRecentList = function(type, objectName) {
    for (var i = 0; i < TCHE.loadedGame.recentObjects.length; i++) {
      var item = TCHE.loadedGame.recentObjects[i];
      if (item.type == type && item.name == objectName) {
        return i;
      }
    }

    return -1;
  };

  TCHE.addRecentObject = function(type, objectName) {
    var index = TCHE.indexOfObjectOnRecentList(type, objectName);
    if (index < 0 && TCHE.loadedGame.recentObjects.length >= 10) {
      index = 0;
    }

    if (index >= 0) {
      TCHE.loadedGame.recentObjects.splice(index, 1);
    }

    TCHE.loadedGame.recentObjects.push({type : type, name : objectName});
  };

  TCHE.saveLoadedGame = function() {
    TCHE.saveJson('loadedGame.json', TCHE.loadedGame);
  };

  TCHE.loadLoadedGameInfo = function() {
    try {
      TCHE.loadedGame = TCHE.loadJson('loadedGame.json');
    }
    catch(e) {
      TCHE.changeGamePath("");
      throw e;
    }

    TCHE.loadedGame.recentObjects = TCHE.loadedGame.recentObjects || [];
    TCHE.changeGamePath(TCHE.loadedGame.folder);
  };

  TCHE.loadGameData = function() {
    try {
      TCHE.gameData = TCHE.loadJson(path.join(TCHE.loadedGame.folder, 'game.json'));
    }
    catch(e) {
      try{
        TCHE.changeGameTitle('No Game Loaded');
        TCHE.closeProject();
      }
      catch(e) {
        console.error(e);
        TCHE.showError("Game Data is missing and another error happened while closing the project.");
        return;
      }

      TCHE.showError("Game Data is missing. The project was unloaded.");
      return;
    }

    TCHE.validateGameData();
    if (!!TCHE.gameData && !!TCHE.gameData.name) {
      TCHE.changeGameTitle(TCHE.gameData.name);
    }

    TCHE.openWindow('index');
  };

  TCHE.getAllScenes = function() {
    return TCHE.gameData.tcheScenes.concat(TCHE.gameData.gameScenes);
  };

  TCHE.registerEngineScene = function(sceneName) {
    if (TCHE.gameData.tcheScenes.indexOf(sceneName) < 0) {
      TCHE.gameData.tcheScenes.push(sceneName);
    }
  };

  TCHE.validateGameData = function() {
    if (!TCHE.gameData.skins) {
      TCHE.gameData.skins = {};
    }
    if (!TCHE.gameData.sprites) {
      TCHE.gameData.sprites = {};
    }
    if (!TCHE.gameData.resolution) {
      TCHE.gameData.resolution = {};
    }
    if (!TCHE.gameData.player) {
      TCHE.gameData.player = {};
    }
    if (!TCHE.gameData.sounds) {
      TCHE.gameData.sounds = {};
    }
    if (!TCHE.gameData.maps) {
      TCHE.gameData.maps = {};
    }
    if (!TCHE.gameData.objects) {
      TCHE.gameData.objects = {};
    }
    if (!TCHE.gameData.variables) {
      TCHE.gameData.variables = {};
    }
    if (!TCHE.gameData.characters) {
      TCHE.gameData.characters = {};
    }
    if (!TCHE.gameData.languages) {
      TCHE.gameData.languages = {};
    }
    if (!TCHE.gameData.music) {
      TCHE.gameData.music = {};
    }
    if (!TCHE.gameData.soundEffects) {
      TCHE.gameData.soundEffects = {};
    }
    if (!TCHE.gameData.movies) {
      TCHE.gameData.movies = {};
    }
    if (!TCHE.gameData.items) {
      TCHE.gameData.items = {};
    }
    if (!TCHE.gameData.animations) {
      TCHE.gameData.animations = {};
    }
    if (!TCHE.gameData.faces) {
      TCHE.gameData.faces = {};
    }
    if (!TCHE.gameData.jobs) {
      TCHE.gameData.jobs = {};
    }
    if (!TCHE.gameData.enemies) {
      TCHE.gameData.enemies = {};
    }
    if (!TCHE.gameData.skills) {
      TCHE.gameData.skills = {};
    }
    if (!TCHE.gameData.states) {
      TCHE.gameData.states = {};
    }
    if (!TCHE.gameData.achievements) {
      TCHE.gameData.achievements = {};
    }
    if (!TCHE.gameData.huds) {
      TCHE.gameData.huds = {};
    }
    if (!TCHE.gameData.packages) {
      TCHE.gameData.packages = {};
    }
    if (!TCHE.gameData.vehicles) {
      TCHE.gameData.vehicles = {};
    }

    if (!TCHE.gameData.tcheScenes) {
      TCHE.gameData.tcheScenes = [];
    }

    TCHE.registerEngineScene('SceneMap');
    TCHE.registerEngineScene('SceneTitle');

    if (!TCHE.gameData.gameScenes) {
      TCHE.gameData.gameScenes = [];
    }

    TCHE.gameData.resolution.width = TCHE.gameData.resolution.width || 640;
    TCHE.gameData.resolution.height = TCHE.gameData.resolution.height || 360;
    TCHE.gameData.resolution.screenWidth = TCHE.gameData.resolution.screenWidth || 640;
    TCHE.gameData.resolution.screenHeight = TCHE.gameData.resolution.screenHeight || 360;
    TCHE.gameData.name = TCHE.gameData.name || "Untitled Project";
    TCHE.gameData.initialMap = TCHE.gameData.initialMap || "";
    TCHE.gameData.initialScene = TCHE.gameData.initialScene || "SceneTitle";
    TCHE.gameData.mainSkin = TCHE.gameData.mainSkin || "system";
  };

  TCHE.saveGameData = function() {
    TCHE.saveJson(path.join(TCHE.loadedGame.folder, 'game.json'), TCHE.gameData);
  };

  TCHE.markAsSaved = function(){
    TCHE.modified = false;
    $('#save-btn').css('color', '#337ab7');
  };

  TCHE.markAsModified = function(){
    TCHE.modified = true;

    $('#save-btn').css('color', 'red');
  };

  TCHE.isFileImported = function(filePath) {
    var loadedPath = TCHE.loadedGame.folder;

    return filePath.indexOf(loadedPath) === 0;
  };

  TCHE.isGameLoaded = function(){
    return !!TCHE.loadedGame.folder && !!TCHE.gameData;
  };

  TCHE.isGameModified = function() {
    return TCHE.isGameLoaded() && TCHE.modified;
  };

  TCHE.exit = function(){
    TCHE.win.close();
  };

  TCHE.updateCounters = function() {
    $('#map-count').html(Object.keys(TCHE.gameData.maps).length);
    
    $('#variable-count').html(Object.keys(TCHE.gameData.variables).length);
    $('#object-count').html(Object.keys(TCHE.gameData.objects).length);
    $('#sprite-count').html(Object.keys(TCHE.gameData.sprites).length);
    $('#character-count').html(Object.keys(TCHE.gameData.characters).length);

    $('#language-count').html(Object.keys(TCHE.gameData.languages).length);
    $('#music-count').html(Object.keys(TCHE.gameData.music).length);
    $('#sound-count').html(Object.keys(TCHE.gameData.soundEffects).length);
    $('#movie-count').html(Object.keys(TCHE.gameData.movies).length);

    $('#item-count').html(Object.keys(TCHE.gameData.items).length);
    $('#animation-count').html(Object.keys(TCHE.gameData.animations).length);
    $('#face-count').html(Object.keys(TCHE.gameData.faces).length);
    $('#skin-count').html(Object.keys(TCHE.gameData.skins).length);

    $('#class-count').html(Object.keys(TCHE.gameData.jobs).length);
    $('#enemy-count').html(Object.keys(TCHE.gameData.enemies).length);
    $('#skill-count').html(Object.keys(TCHE.gameData.skills).length);
    $('#state-count').html(Object.keys(TCHE.gameData.states).length);

    $('#achievement-count').html(Object.keys(TCHE.gameData.achievements).length);
    $('#hud-count').html(Object.keys(TCHE.gameData.huds).length);
    $('#package-count').html(Object.keys(TCHE.gameData.packages).length);
    $('#vehicle-count').html(Object.keys(TCHE.gameData.vehicles).length);
  };

  TCHE.exitButton = function(){
    if (TCHE.isGameModified()) {
      TCHE.confirm("Save before leaving?", function(){
        TCHE.saveProject();
        TCHE.exit();
      });
    } else {
      TCHE.exit();
    }
  };

  TCHE.onLoad = function(){
    $('#index-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'index'); });
    
    $('#maps-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'maps'); });
    $('#objects-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'objects'); });
    $('#variables-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'variables'); });
    $('#sprites-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sprites'); });
    $('#characters-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'characters'); });
    
    $('#languages-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'languages'); });
    $('#music-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'music'); });
    $('#sounds-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sounds'); });
    $('#movies-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'movies'); });
    
    $('#items-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'items'); });
    $('#animations-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'animations'); });
    $('#faces-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'faces'); });
    $('#skins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'skins'); });

    $('#classes-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'classes'); });
    $('#enemies-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'enemies'); });
    $('#skills-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'skills'); });
    $('#states-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'states'); });
    
    $('#achievements-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'achievements'); });
    $('#huds-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'huds'); });
    $('#packages-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'packages'); });
    $('#vehicles-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'vehicles'); });

    $('#plugins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'plugins'); });
    
    $('#settings-player-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-player'); });
    $('#settings-game-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-game'); });
    $('#settings-steam-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-steam'); });
    $('#settings-time-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-time'); });

    $('#open-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.openProjectDialog();
    });
    $('#save-btn').on('click', function(event) {
      event.preventDefault();            
      TCHE.saveProject();
    });
    $('#reload-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.reloadProjectButton();
    });
    $('#new-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.newProjectButton();
    });
    $('#play-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.playProjectButton();
    });

    $('#exit-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.exitButton();
    });

    TCHE.openWindow('index');

    TCHE.loadLoadedGameInfo();
    if (!!TCHE.loadedGame.folder) {
      TCHE.loadGameData();
    }

    TCHE.fillSidebar();
    TCHE.win.maximize();
  };

  TCHE.getCurrentContext = function() {
    var windowName = TCHE._windowName;
    if (!windowName) {
      return 'index';
    }

    if (windowName.indexOf('map') >= 0) {
      return 'maps';
    }

    if (windowName.indexOf('object') >= 0) {
      return 'objects';
    }

    if (windowName.indexOf('sprite') >= 0) {
      return 'sprites';
    }

    if (windowName.indexOf('skin') >= 0) {
      return 'skins';
    }

    return 'index';
  };

  TCHE.addListToContextArea = function(listId, listCaption, listIcon) {
    var html = '<ul class="nav"><li><a id="' + listId + '-btn" href="#"><i class="fa fa-fw ' + listIcon + '"></i> ' + listCaption + '<span class="fa arrow"></span></a><ul class="nav nav-second-level" id="' + listId + '"></ul></li></ul>';
    $('#context-content').append(html);
  };

  TCHE.fillContextContent = function() {
    var context = TCHE.getCurrentContext();

    $('#context-content').html('');
    switch(context) {
      case 'index' :
      case 'maps' :
        TCHE.addListToContextArea('context-map-list', 'Maps', 'fa-globe');
        TCHE.fillMapLinks('context-map-list');
        $('#context-map-list-btn').on('click', function(event){
          event.preventDefault();
          TCHE.openWindow('maps');
        });
        break;

      case 'sprites' :
        TCHE.addListToContextArea('context-sprite-list', 'Sprites', 'fa-image');
        TCHE.fillSpriteLinks('context-sprite-list');
        $('#context-sprite-list-btn').on('click', function(event){
          event.preventDefault();
          TCHE.openWindow('sprites');
        });
        break;

      case 'skins' :
        TCHE.addListToContextArea('context-skin-list', 'Skins', 'fa-tint');
        TCHE.fillSkinLinks('context-skin-list');
        $('#context-skin-list-btn').on('click', function(event){
          event.preventDefault();
          TCHE.openWindow('skins');
        });
        break;

      case 'objects' :
        TCHE.addListToContextArea('context-object-list', 'Objects', 'fa-umbrella');
        TCHE.ObjectManager.fillObjectLinks('context-object-list');
        $('#context-object-list-btn').on('click', function(event){
          event.preventDefault();
          TCHE.openWindow('objects');
        });
        break;
    }
  };

  TCHE.fillSidebar = function() {
    TCHE.fillRecentList('map-editor-map-list');
    TCHE.fillContextContent();

    $('.recent-link').on('click', function(event){
      event.preventDefault();
      var name = event.currentTarget.dataset.name;
      var type = event.currentTarget.dataset.type;

      TCHE.editObject(type, name);
    });
  };

  TCHE.fillRecentList = function(ulId) {
    var ul = $('#' + ulId);

    ul.html('');

    var list = TCHE.loadedGame.recentObjects;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var icon = 'fa-copy';

      switch (item.type) {
        case 'map' :
          icon = 'fa-globe';
          break;
        case 'skin' :
          icon = 'fa-tint';
          break;
        case 'sprite' :
          icon = 'fa-image';
          break;
        case 'object' :
          icon = 'fa-umbrella';
          break;
      }

      ul.append('<li><a class="recent-link" data-type="' + item.type + '" data-name="' + item.name + '" href="#"><i class="menu-option fa ' + icon + ' fa-fw"></i> ' + item.name + '</a></li>');
    }
  };

  TCHE.editObject = function(objectType, objectName) {
    switch(objectType) {
      case 'map' :
        TCHE.editMap(objectName);
        break;
      case 'skin' :
        TCHE.editSkin(objectName);
        break;
      case 'sprite' :
        TCHE.editSprite(objectName);
        break;
      case 'object' :
        TCHE.ObjectManager.editObject(objectName);
        break;
    }
  };

  TCHE.fixLinks = function(){
    setTimeout(function(){
      $('a[target=_blank]').on('click', function(){
        require('nw.gui').Shell.openExternal( this.href );
        return false;
      });
    }, 100);
  };
})();