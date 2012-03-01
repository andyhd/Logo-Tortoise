(function () {

  var Logo = this.Logo = {};

  Logo.syntax = function () {
    return {
      end: 0, // "end" is a reserved word
    };
  };

  Logo.interpret = function (input) {
    var context = { level: 0, syntax: Logo.syntax() },
        tokens = input.trim().toLowerCase().split(/\s+/),
        ast = parse(tokens, context);
    if (typeof ast === 'function') {
      ast();
    } else if ('error' in ast) {
      showError(ast.error);
    }
  };

  function parse(tokens, context) {
    var input = tokens.concat(),
        token = tokens.shift(),
        head = {};

    if (token in context.syntax) {
      head = callFunction(token, context, tokens);
      if ('error' in head) {
        head = errorLine(head.error, input);
      }
    } else {
      head = errorLine("I don't know how to \"" + token + '"', input);
    }

    if (typeof head === 'function' && tokens.length) {
      var tail = parse(tokens, context);
      return ('error' in tail)
        ? tail
        : function () { head(); tail(); };
    }

    return head;
  }

  function callFunction(name, context, tokens) {
    var args = {},
        fn = context.syntax[name],
        params = fn.params || [];
    for (var i in params) {
      args[params[i]] = valueOf(tokens.shift(), context);
    }
    if (fn.f) {
      return fn.f(args, context, 'startsBlock' in fn ? tokens : []);
    } else if ('body' in fn) {
      return parse(fn.body, subcontext(context, args));
    }
    return Logo.error("What is this I don't even");
  }

  Logo.error = function (msg) {
    return { error: msg };
  };

  function errorLine(msg, tokens) {
    return { error: msg + ' at "' + tokens.join(' ') + '"' };
  }

  function showError(msg) {
    if (typeof alert !== 'undefined') {
      alert(msg);
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(msg);
    }
  }

  function valueOf(expr, context) {
    return (/^:\w+$/.test(expr) && expr in context)
      ? context[expr]
      : expr;
  }

  function subcontext(a, b) {
    var c = {};
    function copyPairs(l) {
      for (var k in l) {
        if (l.hasOwnProperty(k)) {
          c[k] = l[k];
        }
      }
    };
    copyPairs(a);
    copyPairs(b);
    c.level++;
    return c;
  }

  Logo.isNumeric = function (x) {
    return !isNaN(parseFloat(x)) && isFinite(x);
  };

  Logo.syntax.repeat = {
    params: ['times'],
    startsBlock: true,
    f: function (args, context, tokens) {
      var n = args.times,
          blockLevel = 0,
          blockTokens = [],
          head = {},
          token = undefined;
      if (!Logo.isNumeric(n)) {
        return Logo.error("How many times is " + n + "?");
      }
      while (token = tokens.shift()) {
        switch (token) {
          case '[':
            blockLevel++;
            if (blockLevel > 1) {
              blockTokens.push(token);
            }
            break;
          case ']':
            blockLevel--;
            if (blockLevel < 0) {
              return Logo.error("Closing bracket without opening one");
            }
            if (blockLevel === 0) {
              var block = parse(blockTokens, context);
              head = (typeof block === 'function')
                ? function () { for (var i = parseInt(n); i > 0; i--) { block(); } }
                : block;
              break;
            }
            blockTokens.push(token);
            break;
          default:
            blockTokens.push(token);
        }
      }
      if (blockLevel) {
        return Logo.error("The brackets don't match");
      }
      return head;
    }
  };

})();

Logo.syntax.forward = {
  params: ['distance'],
  f: function (args, context) {
    var distance = args.distance;
    if (!Logo.isNumeric(distance)) {
      return Logo.error("How far is " + distance + "?");
    }
    return function () {
      console.log("forward " + distance);
    };
  }
};

Logo.syntax.to = {
  params: ['verb'],
  startsBlock: true,
  f: function (args, context, tokens) {
    var verb = args.verb,
        inParamList = true,
        params = [],
        blockTokens = [],
        head = {},
        token = undefined;
    if (verb in context.syntax) {
      return Logo.error('I already know how to "' + verb + '"');
    }
    while (token = tokens.shift()) {
      if (inParamList && /^:\w+$/.test(token)) {
        params.push(token);
        continue;
      } else {
        inParamList = false;
      }
      if (token === 'end') {
        context.syntax[verb] = {
          body: blockTokens,
          params: params
        };
        head = function () {};
        break;
      } else {
        blockTokens.push(token);
      }
    }
    if (typeof head !== 'function') {
      return Logo.error("No end to " + verb);
    }
    return head;
  }
};
