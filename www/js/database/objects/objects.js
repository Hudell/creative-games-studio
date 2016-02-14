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
    //If the editCodeLines method was called instead of the editObject, pick the codelines specified there
    if (!!namespace._currentCodeLines && !namespace._currentObject) {
      return namespace._currentCodeLines;
    }

    var selectedProperty = $('#edit-object-property').val();
    var eventData = namespace._currentObject.properties[selectedProperty];

    if (!eventData) {
      eventData = {
        type : 'event',
        value : []
      };
      namespace._currentObject.properties[selectedProperty] = eventData;
    }

    return eventData.value;
  };

  namespace.closeCommandWindowAndRefresh = function(event, increaseSelection) {
    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
    var codeLines = namespace.getCurrentCodeLines();

    if (selectedIndex < 0) {
      selectedIndex = codeLines.length;
    }

    $(event.currentTarget).parents('.popup').parent().dialog('close');
    
    if (!!increaseSelection || increaseSelection === undefined) {
      selectedIndex++;
    }

    namespace.refreshObjectSelectList();

    $('#edit-object-event-value')[0].selectedIndex = selectedIndex;
  };

  namespace.addCommandToScreenObject = function(command) {
    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
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
    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
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
    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
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
        return t("Teleport to map") + ' ' + command.params.mapName + ' ' + t("at") + ' ' + command.params.x + ', ' + command.params.y;
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

  namespace.removeParentProperties = function(objectData) {
    for (var key in objectData.properties) {
      if (!!objectData.properties[key].value) {
        continue;
      }

      var originalOwner = namespace.findPropertyOriginalOwner(objectData, key);
      if (originalOwner !== objectData.name && originalOwner !== '') {
        delete objectData.properties[key];
      }
    }
  };

  namespace.saveObject = function () {
    var name = namespace._currentObject.name;

    namespace.removeParentProperties(namespace._currentObject);

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
      properties : {}
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
      properties : objectData.properties
    };

    if (objectData.inherits !== '') {
      var parentObject = list[objectData.inherits];

      if (!!parentObject) {
        for (var propertyName in parentObject.properties) {
          if (list[objectData.name].properties[propertyName] === undefined) {
            list[objectData.name].properties[propertyName] = parentObject.properties[propertyName];
          }
        }
      }
    }
  };

  namespace.objectExtendsThis = function(objectName, thisName, objectList) {
    if (objectName == thisName) {
      return true;
    }

    objectList = objectList || namespace.getListOfObjects();
    var object = objectList[objectName];

    if (object === undefined) {
      throw new Error(t("Invalid Object"));
    }

    if (object.inherits === '') {
      return false;
    }

    if (object.inherits == thisName) {
      return true;
    } else {
      return namespace.objectExtendsThis(object.inherits, thisName);
    }
  };

  namespace.addBasicTcheObjectToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Object',
      inherits : '',
      properties : {
      }
    }, list);
  };

  namespace.addBasicTcheMapObjectToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'MapObject',
      inherits : 'Object',
      properties : {
        'name' : { type : 'string' },
        'x' : { type : 'number' },
        'y' : { type : 'number' },
        'width' : { type : 'number' },
        'height' : { type : 'number' },
        'autosize' : { type : 'boolean' },
        'ghost' : { type : 'boolean' },
        'sprite' : { type : 'sprite' },
        'xOffset' : { type : 'number' },
        'yOffset' : { type : 'number' },
        'On Activated' : { type : 'event' },
        'On Player Touch' : { type : 'event' },
        'On Mouse Click' : { type : 'event' },
        'On Screen Touch' : { type : 'event' },
        'On Map Loaded' : { type : 'event' }
      }
    }, list);
  };

  namespace.addBasicTcheCreatureToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Creature',
      inherits : 'MapObject',
      properties : {
      }
    }, list);
  };

  namespace.addBasicTcheNPCToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'NPC',
      inherits : 'Creature',
      properties : {}
    }, list);
  };

  namespace.addBasicPlayerToObjectList = function(list) {
    namespace.addTcheObjectToObjectList({
      name : 'Player',
      inherits : 'Creature',
      properties : {
      }
    }, list);
  };

  namespace.getListOfDefaultObjects = function() {
    var list = {};

    namespace.addBasicTcheObjectToObjectList(list);
    namespace.addBasicTcheMapObjectToObjectList(list);
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

  namespace.getFilteredObjectList = function(baseObjectName) {
    var objectList = namespace.getListOfObjects();
    var newList = {};

    for (var key in objectList) {
      if (namespace.objectExtendsThis(key, baseObjectName, objectList)) {
        newList[key] = objectList[key];
      }
    }

    return newList;
  };

  namespace.getListOfMapObjects = function() {
    return namespace.getFilteredObjectList('MapObject');
  };

  namespace.refreshPropertyLabels = function() {
    var options = $('#edit-object-property').find('option');
    var objectName = namespace._currentObject.name;
    var objectData = namespace._currentObject;

    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var propName = option.value;

      var owner = namespace.findPropertyOwner(objectData, propName);
      var displayName = propName;

      if (owner !== objectName && owner !== '') {
        displayName = owner + '.' + propName;
      }

      var originalOwner = namespace.findPropertyOriginalOwner(objectData, propName);
      if (originalOwner !== '' && originalOwner !== owner && originalOwner !== objectName) {
        displayName += ' (' + originalOwner + ')';
      }

      option.innerHTML = displayName;
    }
  };

  //Check if propName is one of the default tiled object properties (the ones that don't go inside the properties list)
  namespace.isDefaultTiledObjectProperty = function(propName) {
    var keywords = ["type", "name", "properties", "id", "x", "y", "width", "height", "rotation", "visible"];

    return keywords.indexOf(propName.toLowerCase()) >= 0;
  };

  namespace.addObjectPropertiesToScreen = function(objectData, showObjectName) {
    var properties = objectData.properties || [];
    for (var propertyName in properties) {
      var owner = namespace.findPropertyOwner(objectData, propertyName);
      var displayName = propertyName;

      if (owner !== objectData.name && owner !== '') {
        displayName = owner + '.' + propertyName;
      } else if (showObjectName === true) {
        displayName = objectData.name + '.' + propertyName;
      }

      var originalOwner = namespace.findPropertyOriginalOwner(objectData, propertyName);
      if (originalOwner !== '' && originalOwner !== owner && originalOwner !== objectData.name) {
        displayName += ' (' + originalOwner + ')';
      }

      //Check if the property was already added
      if ($('#edit-object-property').find('option[value="' + propertyName + '"]').length > 0) {
        continue;
      }

      $('#edit-object-property').append('<option value="' + propertyName + '">' + displayName + '</option>');
    }

    if (objectData.inherits !== '') {
      var parentData = namespace.findObjectData(objectData.inherits);

      if (!!parentData) {
        namespace.addObjectPropertiesToScreen(parentData, true);
      }
    }
  };

  namespace.loadObjectPropertiesToScreen = function(){
    var objectData = namespace._currentObject;

    $('#edit-object-property').html('');
    namespace.addObjectPropertiesToScreen(objectData, false);

    $('#edit-object-property')[0].selectedIndex = 0;
  };

  namespace.findObjectData = function(objectName) {
    var defaultObjects = namespace.getListOfDefaultObjects();

    if (!!defaultObjects[objectName]) {
      return defaultObjects[objectName];
    }

    return STUDIO.gameData.objects[objectName];
  };

  namespace.findAllProperties = function(objectData) {
    var list = {};
    var newObject = objectData;
    while (!!newObject) {
      var properties = newObject.properties || [];

      for (var propertyName in properties) {
        var owner = namespace.findPropertyOwner(newObject, propertyName);

        if (list[propertyName] !== undefined) {
          continue;
        }

        list[propertyName] = namespace.findPropertyData(objectData, propertyName);
      }

      if (newObject.inherits === '') {
        break;
      }

      newObject = namespace.findObjectData(newObject.inherits);
    }

    return list;
  };

  namespace.findPropertyData = function(objectData, propertyName) {
    if (!!objectData.properties[propertyName]) {
      return objectData.properties[propertyName];
    }

    if (objectData.inherits !== '') {
      var parentData = namespace.findObjectData(objectData.inherits);

      if (!!parentData) {
        return namespace.findPropertyData(parentData, propertyName);
      }
    }

    return false;
  };

  namespace.findPropertyOriginalOwner = function(objectData, propertyName) {
    if (objectData.inherits !== '') {
      var parentData = namespace.findObjectData(objectData.inherits);

      if (!!parentData) {
        var owner = namespace.findPropertyOwner(parentData, propertyName);
        if (owner !== '') {
          return owner;
        }
      }
    }

    if (!!objectData.properties[propertyName]) {
      return objectData.name;
    }

    //If this object didn't even had this property, then neither it nor any of it's parents own it.
    return '';
  };

  namespace.findPropertyOwner = function(objectData, propertyName) {
    if (!!objectData.properties[propertyName]) {
      // The current object becomes the owner if it put a value on the property
      if (!!objectData.properties[propertyName].value) {
        return objectData.name;
      }
    }

    //If the current object doesn't have a value on it, check the parents
    if (objectData.inherits !== '') {
      var parentData = namespace.findObjectData(objectData.inherits);

      if (!!parentData) {
        var owner = namespace.findPropertyOwner(parentData, propertyName);
        if (owner !== '') {
          return owner;
        }
      }
    }

    //If no parent object had this property, then this object is the owner even without a value
    if (!!objectData.properties[propertyName]) {
      return objectData.name;
    }

    //If this object didn't even had this property, then neither it or any of it's parents own it.
    return '';    
  };

  namespace.hideAllPropertyChangers = function() {
    $('.property-changer').addClass('hidden');
  };

  namespace.changePropertyValue = function(propName, value) {
    if (!namespace._currentObject.properties[propName]) {
      var propData = namespace.findPropertyData(namespace._currentObject, propName);

      if (!propData) {
        throw new Error(t("Invalid Property"));
      }

      namespace._currentObject.properties[propName] = STUDIO.deepClone(propData);
    }

    namespace._currentObject.properties[propName].value = value;
    namespace.refreshPropertyLabels();
    $('#clear-property-btn').removeClass('hidden');
  };

  namespace.showStringChanger = function(propertyName, propertyData) {
    var value = propertyData.value || '';

    $('#edit-object-string-value').val(value);
    $('#edit-object-string-value').off('change');
    $('#edit-object-string-value').off('keyup');
    $('#edit-object-string-value').off('keypress');
    $('#edit-object-string-value').on('change', function(){
      if ($('#edit-object-string-value').val() != value) {
        namespace.changePropertyValue(propertyName, $('#edit-object-string-value').val());
      }
    });
    $('#edit-object-string-value').on('keypress', function(){
      if ($('#edit-object-string-value').val() != value) {
        namespace.changePropertyValue(propertyName, $('#edit-object-string-value').val());
      }
    });
    $('#edit-object-string-value').on('keyup', function(){
      if ($('#edit-object-string-value').val() != value) {
        namespace.changePropertyValue(propertyName, $('#edit-object-string-value').val());
      }
    });

    $('#string-changer').removeClass('hidden');
  };

  namespace.showNumberChanger = function(propertyName, propertyData) {
    var value = propertyData.value || 0;

    $('#edit-object-number-value').val(value);
    $('#edit-object-number-value').off('change');
    $('#edit-object-number-value').off('keyup');
    $('#edit-object-number-value').off('keypress');
    $('#edit-object-number-value').on('change', function(){
      if ($('#edit-object-number-value').val() != value) {
        var value = parseFloat($('#edit-object-number-value').val());
        namespace.changePropertyValue(propertyName, value);
        $('#edit-object-number-value').val(value);
      }
    });
    $('#edit-object-number-value').on('keypress', function(){
      if ($('#edit-object-number-value').val() != value) {
        var value = parseFloat($('#edit-object-number-value').val());
        namespace.changePropertyValue(propertyName, value);
        $('#edit-object-number-value').val(value);
      }
    });
    $('#edit-object-number-value').on('keyup', function(){
      if ($('#edit-object-number-value').val() != value) {
        var value = parseFloat($('#edit-object-number-value').val());
        namespace.changePropertyValue(propertyName, value);
        $('#edit-object-number-value').val(value);
      }
    });

    $('#number-changer').removeClass('hidden');
  };

  namespace.showEventChanger = function(propertyName, propertyData) {
    // var value = propertyData.value || [];
    namespace.refreshObjectSelectList();
    $('#event-changer').removeClass('hidden');
  };

  namespace.showSpriteChanger = function(propertyName, propertyData) {


    
  };

  namespace.changeProperty = function() {
    namespace.hideAllPropertyChangers();

    var selectedProperty = $('#edit-object-property').val();
    var propertyData = namespace.findPropertyData(namespace._currentObject, selectedProperty);

    if (!propertyData) {
      $('#invalid-property').removeClass('hidden');
      return;
    }

    var owner = namespace.findPropertyOwner(namespace._currentObject, selectedProperty);
    var originalOwner = namespace.findPropertyOriginalOwner(namespace._currentObject, selectedProperty);

    if (originalOwner == namespace._currentObject.name) {
      $('#remove-property-btn').removeClass('hidden');
      if (!!namespace._currentObject.properties[selectedProperty].value) {
        $('#clear-property-btn').removeClass('hidden');
      }
    } else if (owner == namespace._currentObject.name) {
      $('#clear-property-btn').removeClass('hidden');
    }

    switch(propertyData.type) {
      case 'string' :
        namespace.showStringChanger(selectedProperty, propertyData);
        break;
      case 'number' :
        namespace.showNumberChanger(selectedProperty, propertyData);
        break;
      case 'event' :
        namespace.showEventChanger(selectedProperty, propertyData);
        break;
      case 'sprite' :
        namespace.showSpriteChanger(selectedProperty, propertyData);
        break;
    }
  };

  namespace.refreshCodeLinesList = function() {
    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
    namespace.createCodeSelectList('edit-object-event-value', namespace._currentCodeLines);

    if (selectedIndex >= 0) {
      $('#edit-object-event-value')[0].selectedIndex = selectedIndex;
    }
  };

  namespace.refreshObjectSelectList = function(){
    if (!!namespace._currentCodeLines && !namespace._currentObject) {
      namespace.refreshCodeLinesList();
      return;
    }

    var selectedProperty = $('#edit-object-property').val();
    var propertyData = namespace.findPropertyData(namespace._currentObject, selectedProperty);

    if (!propertyData) {
      throw new Error("Invalid Property");
    }

    var selectedIndex = $('#edit-object-event-value')[0].selectedIndex;
    if (propertyData.type == "event") {
      var codeLines = propertyData.value || [];
      namespace.createCodeSelectList('edit-object-event-value', codeLines);
    }

    if (selectedIndex >= 0) {
      $('#edit-object-event-value')[0].selectedIndex = selectedIndex;
    }
  };

  namespace.clearCurrentProperty = function() {
    var selectedProperty = $('#edit-object-property').val();
    var objectData = namespace._currentObject;
    var propertyData = namespace.findPropertyData(objectData, selectedProperty);

    if (!propertyData) {
      throw new Error("Invalid Property");
    }

    if (objectData.properties[selectedProperty].value !== undefined) {
      delete objectData.properties[selectedProperty].value;
    }

    namespace.refreshPropertyLabels();
    namespace.changeProperty();

    $('#clear-property-btn').addClass('hidden');
  };

  namespace.removeCurrentProperty = function() {
    var selectedProperty = $('#edit-object-property').val();
    var objectData = namespace._currentObject;
    var propertyData = namespace.findPropertyData(objectData, selectedProperty);

    if (!propertyData) {
      throw new Error("Invalid Property");
    }

    var originalOwner = namespace.findPropertyOriginalOwner(objectData, selectedProperty);

    if (originalOwner !== objectData.name) {
      throw new Error(t("This property doesn't belong to this object type."));
    }

    if (!!objectData.properties[selectedProperty]) {
      delete objectData.properties[selectedProperty];
    }

    namespace.loadObjectPropertiesToScreen();
    namespace.changeProperty();
  };

  namespace.checkIfParentHasProperty = function(objectData, propName) {
    if (!!objectData.properties[propName]) {
      return true;
    }

    if (objectData.inherits === '') {
      return false;
    }

    var parentData = namespace.findObjectData(objectData.inherits);
    if (!parentData) {
      throw new Error(t("Parent Object Type is Invalid:") + ' ' + objectData.inherits);
    }

    return namespace.checkIfParentHasProperty(parentData, propName);
  };

  namespace.validatePropertyName = function(objectData, propName) {
    var keywords = ["type", "name", "properties", "id"];

    if (keywords.indexOf(propName.toLowerCase()) >= 0) {
      throw new Error(t("The informed property name can't be used."));
    };
    
    if (!!objectData.properties[propName]) {
      throw new Error(t("The informed property name is already being used."));
    }

    if (!!namespace.checkIfParentHasProperty(objectData, propName)) {
      throw new Error(t("The informed property name is already being used in one of the parent objects."));
    }
  };

  namespace.newProperty = function() {
    STUDIO.openPopupForm('new-object-property', t("New Property"), function(){
      var propName = $('#new-property-name').val();

      namespace.validatePropertyName(namespace._currentObject, propName);

      var propType = $('#new-property-type').val();
      var newProp = {
        type : propType
      };

      namespace._currentObject.properties[propName] = newProp;
      namespace.loadObjectPropertiesToScreen();

      $('#edit-object-property').val(propName);
      namespace.changeProperty();
    }, function(){
      //Load
    });
  };

  namespace.editCodeLines = function(codeLines) {
    namespace._currentCodeLines = codeLines;
    namespace._currentObject = undefined;
  };

  namespace.editObject = function(objectName) {
    if (!STUDIO.gameData.objects[objectName]) {
      throw new Error(t("Object not found:") + ' ' + objectName);
    }

    namespace._currentObject = STUDIO.deepClone(STUDIO.gameData.objects[objectName]);
    namespace._currentCodeLines = undefined;
    
    STUDIO.DatabaseManager.openWindow('objects', 'edit-object', function(){
      $('#edit-object-name').val(objectName);
      namespace.loadObjectPropertiesToScreen();

      namespace.changeProperty();

      $('#clear-property-btn').on('click', function(event){
        event.preventDefault();
        namespace.clearCurrentProperty();
      });

      $('#new-property-btn').on('click', function(event){
        event.preventDefault();
        namespace.newProperty();
      });
      // namespace.refreshObjectSelectList();
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
      namespace.addObjectToSelectList(key, element);
    }
  };

  namespace.addObjectToSelectList = function(objectName, element) {
    element.append('<option value="' + objectName + '">' +  objectName + '</option>');
  };

  namespace.fillFilteredObjects = function(selectId, baseClass) {
    var element = $('#' + selectId);
    element.html('');
    element.append('<option value=""></option>');

    var objects = namespace.getFilteredObjectList(baseClass);
    for (var key in objects) {
      namespace.addObjectToSelectList(key, element);
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

  namespace.attachCodeEditionEvents = function() {
    $('#edit-object-add-btn').on('click', function(event){
      event.preventDefault();
      STUDIO.ObjectManager.showObjectOptions();
    });

    $('#edit-object-remove-btn').on('click', function(event){
      event.preventDefault();
      STUDIO.ObjectManager.removeSelectedObjectCommand();
    });

    $('#edit-object-modify-btn').on('click', function(event){
      event.preventDefault();
      STUDIO.ObjectManager.modifySelectedObjectCommand();
    });

    $('#edit-object-event-value').on('dblclick', function(event){
      STUDIO.ObjectManager.showObjectOptions();
    });

    $('#edit-object-event-value').on('keydown', function(event){
      if (event.keyCode == 8 || event.keyCode == 46) {
        STUDIO.ObjectManager.removeSelectedObjectCommand();
      } else if (event.keyCode == 32) {
        STUDIO.ObjectManager.modifySelectedObjectCommand();
      }
    });
  };
})(STUDIO.ObjectManager);