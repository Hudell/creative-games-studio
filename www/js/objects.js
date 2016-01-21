TCHE.ObjectManager = {};

(function(namespace){
  var path = require("path");

  namespace.addObject = function(selector, name, objectData) {
    var data = [];
    data.push(name);
    data.push('Object');

    TCHE.addRowToTable(selector, data, 'object', name);
  };

  namespace.loadObjects = function(selector) {
    if (!TCHE.gameData.objects) {
      return;
    }

    for (var name in TCHE.gameData.objects) {
      namespace.addObject(selector, name, TCHE.gameData.objects[name]);
    }
  };

  namespace.addCodeLineToSelect = function(selectId, index, codeLine) {
    var type = '';
    if (!!codeLine) {
      type = codeLine.object;
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
        object : 'exit'
      });

      namespace.closeCommandWindowAndRefresh(event);
    });

    $('#code-command-wait').on('click', function(event){
      event.preventDefault();

      namespace.addCommandToScreenObject({
        object : 'wait'
      });

      namespace.closeCommandWindowAndRefresh(event);
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

  namespace.modifySelectedObjectCommand = function(){

  };

  namespace.getObjectCommandDescription = function(command) {
    if (!command || !command.object) return '';

    switch (command.object) {
      case 'wait' :
        return 'Wait';
      case 'exit' :
        return 'Exit Code Block';
      default :
        return '';
    }
  };

  namespace.showObjectOptions = function() {
    TCHE.openPopup('code-command-list', 'Add Command', function(){
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
    TCHE.gameData.objects[name] = namespace._currentObject;
    TCHE.markAsModified();
  };

  namespace.removeObject = function(objectName) {
    delete TCHE.gameData.objects[objectName];
    TCHE.markAsModified();
  };

  namespace.continueNewObject = function() {
    var name = $('#new-object-name').val();
    if (!name || !name.trim()) {
      throw new Error("Please give this object a name.");
    }

    if (TCHE.gameData.objects[name] !== undefined) {
      throw new Error("An object called " + name + " already exists.");
    }

    var objectType = $('#objectType').val();
    if (!objectType || !objectType.trim()) {
      throw new Error("Please choose an object type.");
    }

    var objectData = {
      name : name,
      inherits : objectType,
      events : {}
    };

    TCHE.gameData.objects[name] = objectData;
    TCHE.markAsModified();

    namespace.editObject(name);
  };

  namespace.addTcheObjectToObjectList = function(objectData, list) {
    if (list[objectData.name] !== undefined) return;
    
    if (list[objectData.inherits] === undefined && objectData.inherits !== '') {
      var parent = TCHE.gameData.objects[objectData.inherits];
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
        'When Player Approach' : true,
        'When Player Touch' : true,
        'When Player Trigger' : true,
        'When Player Walks' : true,
        'When Player Enter Map' : true,
        'When Player Leave Map' : true,
        'Every Frame' : true,
        'Every 10 Frames' : true
      }
    }, list);
  };

  namespace.addBasicTcheCreatureToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Creature',
      inherits : 'Object',
      events : {
        'On Walk' : true,
        'On Approach Player' : true
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
        'On Key Press' : true,
        'On Mouse Click' : true,
        'On Screen Touch' : true
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

    for (var key in TCHE.gameData.objects) {
      namespace.addTcheObjectToObjectList(TCHE.gameData.objects[key], list);
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
    if (!TCHE.gameData.objects[objectName]) {
      throw new Error("Object " + objectName + " not found.");
    }

    namespace._currentObject = TCHE.deepClone(TCHE.gameData.objects[objectName]);
    TCHE.openWindow('edit-object', function(){
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

    var objects = TCHE.gameData.objects;
    for (var key in objects) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };
})(TCHE.ObjectManager);