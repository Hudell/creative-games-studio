STUDIO.ObjectManager = {};

(function(namespace){
  var path = require("path");

  namespace.addObject = function(selector, name, objectData) {
    var data = [];
    data.push(name);
    data.push('Object');

    STUDIO.addRowToTable(selector, data, 'object', name);
  };

  namespace.loadObjects = function(selector) {
    if (!STUDIO.gameData.objects) {
      return;
    }

    for (var name in STUDIO.gameData.objects) {
      namespace.addObject(selector, name, STUDIO.gameData.objects[name]);
    }
  };

  namespace.addCodeLineToSelect = function(selectId, index, codeLine) {
    var type = '';
    if (!!codeLine) {
      type = codeLine.code;
    }

    var line = '<option value="' + type + '">';
    if (!!codeLine) {
      line += namespace.getObjectCommandDescription(codeLine);
    }

    line += '</option>';

    $('#' + selectId).append(line);
  };

  namespace.getCurrentCodeLines = function() {
    var selectedEvent = $('#edit-object-event').val();
    var eventData = namespace._currentObject.events[selectedEvent];

    if (!eventData) {
      eventData = {
        codeLines : []
      };
      namespace._currentObject.events[selectedEvent] = eventData;
    }

    return eventData.codeLines;
  };

  namespace.closeCommandWindowAndRefresh = function(event, increaseSelection) {
    var selectedIndex = $('#edit-object-list')[0].selectedIndex;
    var codeLines = namespace.getCurrentCodeLines();

    if (selectedIndex < 0) {
      selectedIndex = codeLines.length;
    }

    $(event.currentTarget).parents('.popup').parent().dialog('close');
    
    if (!!increaseSelection || increaseSelection === undefined) {
      selectedIndex++;
    }

    namespace.refreshObjectSelectList();

    $('#edit-object-list')[0].selectedIndex = selectedIndex;
  };

  namespace.addCommandToScreenObject = function(command) {
    var selectedIndex = $('#edit-object-list')[0].selectedIndex;
    var codeLines = namespace.getCurrentCodeLines();

    if (selectedIndex >= 0 && selectedIndex < codeLines.length) {
      codeLines.splice(selectedIndex, 0, command);
    } else {
      codeLines.push(command);
    }
  };

  namespace.registerObjectCommandEvents = function() {
    $('#code-command-exit').on('click', function(event){
      event.preventDefault();
      namespace.addCommandToScreenObject({
        code : 'exit'
      });
      namespace.closeCommandWindowAndRefresh(event);
    });

    $('#code-command-wait').on('click', function(event){
      event.preventDefault();
      namespace.addCommandToScreenObject({
        code : 'wait'
      });
      namespace.closeCommandWindowAndRefresh(event);
    });

    $('#code-command-teleport').on('click', function(event){
      event.preventDefault();

      STUDIO.openPopupForm('code-command-teleport', t("Teleport"), function(){
        var mapName = $('#code-command-teleport-map').val();
        var x = $('#code-command-teleport-x').val();
        var y = $('#code-command-teleport-y').val();

        if (!mapName || !mapName.trim()) {
          throw new Error(t("Please select a map to teleport to."));
        }
        if (x !== 0 && (!x || isNaN(x))) {
          throw new Error(t("Invalid X position."));
        }
        
        if (y !== 0 && (!y || isNaN(y))) {
          throw new Error(t("Invalid Y position."));
        }

        namespace.addCommandToScreenObject({
          code : 'teleport',
          params : {
            mapName : mapName,
            x : x,
            y : y
          }
        });
        namespace.closeCommandWindowAndRefresh(event);
      }, function(){
        STUDIO.fillMaps('code-command-teleport-map');        
      });

    });
  };

  namespace.checkIfObjectOwnVariableExists = function(ownVariableName) {
    if (!namespace._currentObject) {
      return false;
    }
  };

  namespace.removeSelectedObjectCommand = function() {
    var selectedIndex = $('#edit-object-list')[0].selectedIndex;
    var codeLines = namespace.getCurrentCodeLines();

    if (selectedIndex >= 0 && selectedIndex < codeLines.length) {
      codeLines.splice(selectedIndex, 1);
    }

    namespace.refreshObjectSelectList();
  };

  namespace.getTeleportParams = function(){
    var mapName = $('#code-command-teleport-map').val();
    var x = $('#code-command-teleport-x').val();
    var y = $('#code-command-teleport-y').val();

    if (!mapName || !mapName.trim()) {
      throw new Error(t("Please select a map to teleport to."));
    }
    if (x !== 0 && (!x || isNaN(x))) {
      throw new Error(t("Invalid X position."));
    }
    
    if (y !== 0 && (!y || isNaN(y))) {
      throw new Error(t("Invalid Y position."));
    }

    return {
      mapName : mapName,
      x : x,
      y : y
    };
  };

  namespace.modifyCommand = function(command) {
    switch(command.code) {
      case 'teleport' :
        STUDIO.openPopupForm('code-command-teleport', t("Teleport"), function(){
          command.params = namespace.getTeleportParams();
          namespace.closeCommandWindowAndRefresh(event);
        }, function(){
          STUDIO.fillMaps('code-command-teleport-map');
          
          $('#code-command-teleport-map').val(command.params.mapName);
          $('#code-command-teleport-x').val(command.params.x);
          $('#code-command-teleport-y').val(command.params.y);
        });

        break;
    }
  };

  namespace.modifySelectedObjectCommand = function(){
    var selectedIndex = $('#edit-object-list')[0].selectedIndex;
    var codeLines = namespace.getCurrentCodeLines();
    if (selectedIndex >= 0 && selectedIndex < codeLines.length) {
      var command = codeLines[selectedIndex];
      namespace.modifyCommand(command);
    }
  };

  namespace.getObjectCommandDescription = function(command) {
    if (!command || !command.code) return '';

    switch (command.code) {
      case 'wait' :
        return t("Wait");
      case 'exit' :
        return t("Exit Code Block");
      case 'teleport' :
        return t("Teleport to map") + command.params.mapName + t("at") + command.params.x + ', ' + command.params.y;
      default :
        return '';
    }
  };

  namespace.showObjectOptions = function() {
    STUDIO.openPopup('code-command-list', t("Add Command"), function(){
      namespace.registerObjectCommandEvents();
    });
  };

  namespace.createCodeSelectList = function(selectId, object) {
    $('#' + selectId).html('');

    for (var i = 0; i < object.length; i++) {
      namespace.addCodeLineToSelect(selectId, i + 1, object[i]);
    }
    
    namespace.addCodeLineToSelect(selectId, object.length + 1, null);
  };

  namespace.saveObject = function () {
    var name = namespace._currentObject.name;
    STUDIO.gameData.objects[name] = namespace._currentObject;
    STUDIO.addRecentObject('object', name);
    
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('objects', 'objects');
  };

  namespace.removeCurrentObject = function() {
    var name = $('#edit-object-name').val();
    namespace.removeObject(name);
  };

  namespace.removeObject = function(objectName) {
    delete STUDIO.gameData.objects[objectName];
    STUDIO.markAsModified();
  };

  namespace.continueNewObject = function() {
    var name = $('#new-object-name').val();
    if (!name || !name.trim()) {
      throw new Error(t("Please give this object a name."));
    }

    if (STUDIO.gameData.objects[name] !== undefined) {
      throw new Error(t("An object with that name already exists."));
    }

    var objectType = $('#objectType').val();
    if (!objectType || !objectType.trim()) {
      throw new Error(t("Please choose an object type."));
    }

    var objectData = {
      name : name,
      inherits : objectType,
      events : {}
    };

    STUDIO.gameData.objects[name] = objectData;
    STUDIO.markAsModified();

    namespace.editObject(name);
  };

  namespace.addTcheObjectToObjectList = function(objectData, list) {
    if (list[objectData.name] !== undefined) return;
    
    if (list[objectData.inherits] === undefined && objectData.inherits !== '') {
      var parent = STUDIO.gameData.objects[objectData.inherits];
      if (!parent) return;

      namespace.addTcheObjectToObjectList(parent, list);
    }

    list[objectData.name] = {
      name : objectData.name,
      inherits : objectData.inherits,
      events : []
    };

    for (var eventName in objectData.events) {
      list[objectData.name].events.push(eventName);
    }

    if (objectData.inherits !== '') {
      var parentObject = list[objectData.inherits];

      if (!!parentObject) {
        for (var i = 0; i < parentObject.events.length; i++) {
          var eventName = parentObject.events[i];

          if (list[objectData.name].events.indexOf(eventName) < 0) {
            list[objectData.name].events.push(eventName);
          }
        }
      }
    }
  };

  namespace.addBasicTcheObjectToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Object',
      inherits : '',
      events : {
        'On Block Player' : true
        // 'When Player Approach' : true,
        // 'When Player Touch' : true,
        // 'When Player Trigger' : true,
        // 'When Player Walks' : true,
        // 'When Player Enter Map' : true,
        // 'When Player Leave Map' : true,
        // 'Every Frame' : true,
        // 'Every 10 Frames' : true
      }
    }, list);
  };

  namespace.addBasicTcheCreatureToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Creature',
      inherits : 'Object',
      events : {
        // 'On Walk' : true,
        // 'On Approach Player' : true
      }
    }, list);
  };

  namespace.addBasicTcheNPCToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'NPC',
      inherits : 'Creature',
      events : {}
    }, list);
  };

  namespace.addBasicPlayerToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Player',
      inherits : 'Creature',
      events : {
        // 'On Key Press' : true,
        // 'On Mouse Click' : true,
        // 'On Screen Touch' : true
      }
    }, list);
  };

  namespace.getListOfDefaultObjects = function() {
    var list = {};

    namespace.addBasicTcheObjectToObjectList(list);
    namespace.addBasicTcheCreatureToObjectList(list);
    namespace.addBasicTcheNPCToObjectList(list);
    namespace.addBasicPlayerToObjectList(list);

    return list;
  };

  namespace.getListOfObjects = function() {
    var list = namespace.getListOfDefaultObjects();

    for (var key in STUDIO.gameData.objects) {
      namespace.addTcheObjectToObjectList(STUDIO.gameData.objects[key], list);
    }

    return list;
  };

  namespace.loadObjectEventsToScreen = function(){
    var objectList = namespace.getListOfObjects();
    var objectName = namespace._currentObject.name;
    var objectData = objectList[objectName] || {};
    var events = objectData.events || [];

    $('#edit-object-event').html('');
    for (var i = 0; i < events.length; i++) {
      $('#edit-object-event').append('<option value="' + events[i] + '">' + events[i] + '</option>');
    }

    $('#edit-object-event')[0].selectedIndex = 0;
  };

  namespace.refreshObjectSelectList = function(){
    var selectedEvent = $('#edit-object-event').val();
    var eventData = namespace._currentObject.events[selectedEvent];

    if (!eventData) {
      eventData = {
        codeLines : []
      };
      namespace._currentObject.events[selectedEvent] = eventData;
    }

    var selectedIndex = $('#edit-object-list')[0].selectedIndex;
    namespace.createCodeSelectList('edit-object-list', eventData.codeLines);

    if (selectedIndex >= 0) {
      $('#edit-object-list')[0].selectedIndex = selectedIndex;
    }
  };

  namespace.editObject = function(objectName) {
    if (!STUDIO.gameData.objects[objectName]) {
      throw new Error(t("Object not found:") + ' ' + objectName);
    }

    namespace._currentObject = STUDIO.deepClone(STUDIO.gameData.objects[objectName]);
    STUDIO.DatabaseManager.openWindow('objects', 'edit-object', function(){
      $('#edit-object-name').val(objectName);
      namespace.loadObjectEventsToScreen();
      namespace.refreshObjectSelectList();
    });
  };

  namespace.fillObjectTypes = function(selectId) {
    var list = namespace.getListOfObjects();

    var element = $('#' + selectId);
    element.html('');

    for (var key in list) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  namespace.fillObjects = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    element.append('<option value=""></option>');

    var objects = STUDIO.gameData.objects;
    for (var key in objects) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  namespace.fillObjectLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var objects = STUDIO.gameData.objects;
    for (var key in objects) {
      element.append('<li><a class="recent-link" data-type="object" data-name="' + key + '" href="#"><i class="menu-option fa fa-umbrella fa-fw"></i> ' + key + '</a></li>');
    }
  };
})(STUDIO.ObjectManager);