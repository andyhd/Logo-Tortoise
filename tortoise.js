var tortoise = function (element) {

  var canvas = element[0];
  canvas.width = element.width();
  canvas.height = element.height();
  var pendown = true,
      c = canvas.getContext('2d');

  Logo.syntax.penup = {
    f: function (args, context) {
      return function () { pendown = false; };
    }
  };
  Logo.syntax.pu = Logo.syntax.penup;

  Logo.syntax.pendown = {
    f: function (args, context) {
      return function () { pendown = true; };
    }
  };
  Logo.syntax.pd = Logo.syntax.pendown;

  Logo.syntax.forward = {
    params: ['distance'],
    f: function (args, context) {
      var distance = Logo.valueOf(args.distance, context);
      if (!Logo.isNumeric(distance)) {
        return Logo.error("How far forward is " + args.distance + "?");
      }
      return function () {
        var y = parseInt(distance);
        if (pendown) {
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(0, -y);
          c.strokeStyle = 'rgba(255, 255, 255, 1)';
          c.stroke();
        }
        c.translate(0, -y);
      };
    }
  };
  Logo.syntax.fd = Logo.syntax.forward;

  function turn(value, direction, context) {
    var degrees = Logo.valueOf(value, context);
    if (direction === "left") {
      degrees = -degrees;
    }
    if (!Logo.isNumeric(degrees)) {
      return Logo.error("I don't know how to turn " + degrees + " degrees to the " + direction + "!");
    }
    return function () {
      c.rotate((parseInt(degrees) % 360) * Math.PI / 180);
    };
  }

  Logo.syntax.left = {
    params: ['degrees'],
    f: function (args, context) {
      return turn(args.degrees, "left", context);
    }
  };
  Logo.syntax.lt = Logo.syntax.left;

  Logo.syntax.right = {
    params: ['degrees'],
    f: function (args, context) {
      return turn(args.degrees, "right", context);
    }
  };
  Logo.syntax.rt = Logo.syntax.right;

  function drawTortoise() {
    c.strokeStyle = 'rgba(0,239,0,1)';
    c.moveTo(0, 0);
    c.beginPath();
    c.arc(0, 0, 8, 0, Math.PI * 2, false);
    c.stroke();
    c.moveTo(0, -9.5);
    c.beginPath();
    c.arc(0, -11, 3, 0, Math.PI * 2, false);
    for (var y = 1; y > -2; y--) {
      for (var x = 1; x > -2; x--) {
        if (Math.abs(x + y) != 1) {
          c.moveTo(x * 8, y * 8);
          c.lineTo(x * 6, y * 6);
        }
      }
    }
    c.stroke();
    c.moveTo(0, 0);
  }

  function clearTortoise() {
    c.moveTo(0,0);
    c.clearRect(-15, -15, 30, 30);
  }

  function reset() {
    var x = canvas.width / 2,
        y = canvas.height / 2;
    c.restore();
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.save();
    c.translate(x,y);
    pendown = true;
  }

  return {

    pendown: pendown,

    context: c,

    run: function (input) {
      clearTortoise();
      Logo.interpret(input);
      drawTortoise();
    },

    clear: function () {
      reset();
      drawTortoise();
    }

  };

};
