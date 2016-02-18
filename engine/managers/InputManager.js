(function(){
  var keyAliases = {};
  var keyStates = {};
  var previousKeyStates = {};
  var triggeredKeys = [];
  var releasedKeys = [];
  var mouseClicked = [];
  var mousePos = {x : 0, y : 0};
  var keyCodes = null;

  var keys = {
    9: 'tab', // tab
    13: 'ok', // enter
    16: 'shift', // shift
    17: 'control', // control
    18: 'control', // alt
    27: 'escape', // escape
    32: 'ok', // space
    33: 'pageup', // pageup
    34: 'pagedown', // pagedown
    37: 'left', // left arrow
    38: 'up', // up arrow
    39: 'right', // right arrow
    40: 'down', // down arrow
    45: 'escape', // insert

    65: 'left', // A
    83: 'down', // S
    68: 'right', // D
    87: 'up', // W

    74: 'ok', // J
    75: 'shift', // K
    85: 'tool', // U
    // 73: 'I', // I

    81: 'pageup', // Q
    69: 'pagedown', // E

    // 76: 'L', // L,
    // 79: 'O', // O,

    // 88: 'escape', // X
    // 90: 'ok', // Z
    96: 'escape', // numpad 0
    98: 'down', // numpad 2
    100: 'left', // numpad 4
    102: 'right', // numpad 6
    104: 'up', // numpad 8

    113 : 'F2'
  };

  function InputManager() {
  };
  
  InputManager.update = function() {
    triggeredKeys = [];
    releasedKeys = [];

    for (var key in keyStates) {
      if (keyStates[key] === previousKeyStates[key]) continue;

      if (keyStates[key]) {
        triggeredKeys.push(key);
      } else {
        releasedKeys.push(key);
      }
    }

    previousKeyStates = TCHE.Clone.shallow(keyStates);

    for (var i = 0; i < triggeredKeys.length; i++) {
      var names = this.getKeyNames(triggeredKeys[i]);

      for (var j = 0; j < names.length; j++) {
        this.fire(names[j], {});
      }
    }
  };

  InputManager.addKeyCode = function(code, name) {
    keys[code] = name;
    keyCodes = null;
  };

  InputManager.addKeyAlias = function(keyName, keyAlias) {
    keyAliases[keyName] = keyAliases[keyName] || [];
    keyAliases[keyName].push(keyAlias);

    keyCodes = null;
  };

  InputManager.isKeyCodePressed = function(keyCode) {
    return !!keyStates[keyCode];
  };

  InputManager.isKeyCodeTriggered = function(keyCode) {
    return triggeredKeys.indexOf(keyCode) >= 0;
  };

  InputManager.isKeyCodeReleased = function(keyCode) {
    return releasedKeys.indexOf(keyCode) >= 0;
  };

  InputManager.generateKeyCodes = function(keyName) {
    var codes = [];

    for (var key in keys) {
      if (keys.hasOwnProperty(key)) {
        if (keys[key].toUpperCase() == keyName.toUpperCase()) {
          codes.push(key);
          continue;
        }

        var thisKeyName = keys[key];
        if (!!keyAliases[thisKeyName] && keyAliases[thisKeyName].indexOf(keyName) >= 0) {
          codes.push(key);
        }
      }
    }

    keyCodes = keyCodes || {};
    keyCodes[keyName] = codes;

    return codes;
  };

  InputManager.getKeyCodes = function(keyName) {
    if (!!keyCodes && !!keyCodes[keyName]) {
      return keyCodes[keyName];
    }

    return this.generateKeyCodes(keyName);
  };

  InputManager.getKeyNames = function(keyCode) {
    var names = [];

    if (!!keys[keyCode]) {
      var name = keys[keyCode];

      names.push(name);
      if (!!keyAliases[name]) {
        names = names.concat(keyAliases[name]);
      }
    }

    return names;
  };

  InputManager.isKeyNamePressed = function(keyName) {
    var codes = this.getKeyCodes(keyName);

    return codes.find(function(key){
      return this.isKeyCodePressed(key);
    }.bind(this)) || false;
  };

  InputManager.isKeyNameReleased = function(keyName) {
    var codes = this.getKeyCodes(keyName);

    return codes.find(function(key){
      return this.isKeyCodeReleased(key);
    }.bind(this)) || false;
  };

  InputManager.isKeyNameTriggered = function(keyName) {
    var codes = this.getKeyCodes(keyName);

    return codes.find(function(key){
      return this.isKeyCodeTriggered(key);
    }.bind(this)) || false;
  };

  InputManager.isKeyPressed = function(keyCodeOrName) {
    if (typeof(keyCodeOrName) == "string") {
      return this.isKeyNamePressed(keyCodeOrName);
    } else {
      return this.isKeyCodePressed(keyCodeOrName);
    }
  };

  InputManager.isKeyTriggered = function(keyCodeOrName) {
    if (typeof(keyCodeOrName) == "string") {
      return this.isKeyNameTriggered(keyCodeOrName);
    } else {
      return this.isKeyCodeTriggered(keyCodeOrName);
    }
  };

  InputManager.isKeyReleased = function(keyCodeOrName) {
    if (typeof(keyCodeOrName) == "string") {
      return this.isKeyNameReleased(keyCodeOrName);
    } else {
      return this.isKeyCodeReleased(keyCodeOrName);
    }
  };

  InputManager.getPressedKeys = function(keys) {
    return Object.keys(keys).filter(function(key){
      return this.isKeyCodePressed(key);
    }.bind(this));
  };

  InputManager.getFirstDirection = function() {
    return ['left', 'right', 'up', 'down'].find(function(direction) {
      return this.isKeyNamePressed(direction);
    }.bind(this)) || '';
  };

  InputManager.getDirection = function() {
    return ['left', 'right', 'up', 'down'].filter(function(direction) {
      return this.isKeyNamePressed(direction);
    }.bind(this)).join('-');
  };

  InputManager.onKeyDown = function(event) {
    if (this.isBlockedKey(event.keyCode)) {
      event.preventDefault();
    }

    keyStates[event.keyCode] = true;
  };

  InputManager.onKeyUp = function(event) {
    keyStates[event.keyCode] = false;
  };

  InputManager.onWindowBlur = function() {
    this.clear();
  };

  InputManager.clear = function() {
    keyStates = {};
    for (var i = 0; i < mouseClicked.length; i++) {
      mouseClicked[i] = false;
    }
    mousePos = {x : 0, y : 0};
  };

  InputManager.isBlockedKey = function(keyCode) {
    switch (keyCode) {
      case 8: // backspace
      case 33: // pageup
      case 34: // pagedown
      case 37: // left arrow
      case 38: // up arrow
      case 39: // right arrow
      case 40: // down arrow
        return true;
      default:
        return false;
    }      
  };

  InputManager.isMouseClicked = function(button) {
    return mouseClicked[button];
  };

  InputManager.isLeftMouseClicked = function() {
    return mouseClicked[0];
  };

  InputManager.isMiddleMouseClicked = function() {
    return mouseClicked[1];
  };

  InputManager.isRightMouseClicked = function() {
    return mouseClicked[2];
  };

  InputManager.currentMousePos = function() {
    return mousePos;
  };

  InputManager.processMouseDown = function(pos, button) {
    mouseClicked[button] = true;
    mousePos = pos;
  };

  InputManager.processMouseOut = function() {
    for (var i = 0; i < mouseClicked.length; i++) {
      mouseClicked[i] = false;
    }
  };

  InputManager.processMouseUp = function(pos, button) {
    mouseClicked[button] = false;
    mousePos = pos;
  };

  InputManager.processMouseMove = function(pos) {
    mousePos = pos;
  };

  document.addEventListener('keydown', InputManager.onKeyDown.bind(InputManager));
  document.addEventListener('keyup', InputManager.onKeyUp.bind(InputManager));
  window.addEventListener('blur', InputManager.onWindowBlur.bind(InputManager));

  TCHE.on("started", function() {
    TCHE.renderer.view.addEventListener("click", function(evt) {
      var pos = getMousePos(this, evt);

      TCHE.SceneManager.processClick(pos);
    });

    TCHE.renderer.view.addEventListener("mousedown", function(evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseDown(pos, evt.button);
    });

    TCHE.renderer.view.addEventListener("mousemove", function(evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseMove(pos);
    });

    TCHE.renderer.view.addEventListener("mouseout", function(evt) {
      TCHE.InputManager.processMouseOut();
    });

    TCHE.renderer.view.addEventListener("mouseup", function(evt) {
      var pos = getMousePos(this, evt);

      TCHE.InputManager.processMouseUp(pos, evt.button);
    });
  });

  function getMousePos(canvas, evt) {
    return TCHE.renderer.plugins.interaction.eventData.data.global;
  }

  TCHE.registerStaticClass('InputManager', InputManager);
})();