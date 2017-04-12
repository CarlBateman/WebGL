var Pointer = {
  L: false, M: false, R: false,
  X: 0,
  Y: 0,
  Z: 0,

  X1: 0,
  Y1: 0,
  Z1: 0,

  Left: 0,
  Top: 0,

  start: { X: 0, Y: 0 },
  end: { X: 0, Y: 0 },
  self: null,
  canvas: null,

  setState: function (event, state) {
    if (event.which === 1) self.L = state;
    if (event.which === 2) self.M = state;
    if (event.which === 3) self.R = state;
  },

  findPos: function (obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return [curleft, curtop];
    }
  },

  updateXY: function (newX, newY) {
    self.X1 = self.X;
    self.Y1 = self.Y;
    self.X = newX - self.findPos(self.canvas)[0];//+ self.Left
    self.Y = newY - self.findPos(self.canvas)[1];//+ self.Top;
  },

  addEventHandler: function (elem, eventType, handler) {
    if (elem.addEventListener)
      elem.addEventListener(eventType, handler, false);
    else if (elem.attachEvent)
      elem.attachEvent('on' + eventType, handler);
  },

  addEventHandlerCapture: function (elem, eventType, handler) {
    if (elem.addEventListener)
      elem.addEventListener(eventType, handler, true);
    else if (elem.attachEvent)
      elem.attachEvent('on' + eventType, handler);
  },

  initInputHandlers: function (canvas) {
    self = this;
    self.canvas = canvas;

    canvas.oncontextmenu = function () { return false; };

    self.addEventHandler(canvas, 'mousedown', self.handleMouseDown);
    self.addEventHandler(canvas, 'mousewheel', self.handleMouseWheel);
    self.addEventHandler(canvas, 'DOMMouseScroll', self.handleMouseWheel);

    self.addEventHandler(document, 'mousemove', self.handleMouseMove);
    self.addEventHandler(document, 'mouseup', self.handleMouseUp);

    self.addEventHandler(canvas, 'touchstart', self.handleTouchDown);
    self.addEventHandler(canvas, 'touchend', self.handleTouchEnd);
    self.addEventHandlerCapture(canvas, 'touchmove', self.handleTouchMove);
  },

  handleMouseDown: function (event) {
    self.setState(event, true);
    self.start.X = self.X;
    self.start.Y = self.Y;
  },
  handleMouseUp: function (event) {
    self.setState(event, false)
    self.end.X = self.X;
    self.end.Y = self.Y;
  },
  handleMouseMove: function (event) {
    self.updateXY(event.clientX, event.clientY);
  },
  handleMouseWheel: function (event) {
    var event = window.event || event; // old IE support
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    self.Z1 = self.Z;
    self.Z += delta;
  },

  handleTouchMove: function (event) {
    event.preventDefault();
    if (!self.L) {
      return;
    }
    self.updateXY(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
  },
  handleTouchDown: function (event) {
    self.L = true;
    self.updateXY(event.targetTouches[0].pageX, event.targetTouches[0].pageY);
    self.start.X = self.X;
    self.start.Y = self.Y;
  },
  handleTouchEnd: function (event) {
    self.L = false;
    self.end.X = self.X;
    self.end.Y = self.Y;
  }
}