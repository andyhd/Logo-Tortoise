(function () {

  var Logo = this.Logo = {};

  Logo.syntax = {
    end: 0, // "end" is a reserved word
  };

  Logo.interpret = function (input) {
    var context = { level: 0, syntax: copyPairs(Logo.syntax, {}) },
        tokens = input.trim().toLowerCase().split(/\s+/),
        ast = parse(tokens, context);
    if (typeof ast === 'function') {
      ast();
    } else if ('error' in ast) {
      showError(ast);
    }
  };

  function parse(tokens, context) {
    var input = tokens.concat(),
        token = tokens.shift(),
        head = {};

    // don't complain about nothing to do
    if (!token) {
      return function () {};
    }

    if (token in context.syntax) {
      head = callFunction(token, context, tokens);
      if ('error' in head) {
        head = bubbleError(head, input);
      }
    } else {
      head = bubbleError(Logo.error("I don't know how to \"" + token + '"'), input);
    }

    if (typeof head === 'function' && tokens.length) {
      var tail = parse(tokens, context);
      return ('error' in tail)
        ? tail
        : function () { head(); tail(); };
    }

    return head;
  }
  Logo.parse = parse;

  function callFunction(name, context, tokens) {
    var args = {},
        fn = context.syntax[name],
        params = fn.params || [];
    if (context.level > 10) {
      return Logo.error("Woah woah woah!");
    }
    for (var i in params) {
      args[params[i]] = tokens.shift();
    }
    return fn.f(args, context, 'startsBlock' in fn ? tokens : []);
  }

  Logo.error = function (msg) {
    return { error: msg, stack: [] };
  };

  function bubbleError(error, tokens) {
    error.stack.unshift(tokens.join(' '));
    return { error: error.error, stack: error.stack };
  }

  function showError(ast) {
    Logo.stacktrace = ast.stack;
    if (typeof alert !== 'undefined') {
      throw ast.error;
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(ast.error);
    }
  }

  function valueOf(expr, context) {
    return /^:\w+$/.test(expr) ? (expr in context ? context[expr] : null) : expr;
  }
  Logo.valueOf = valueOf;

  function copyPairs(a, b) {
    for (var k in a) {
      if (a.hasOwnProperty(k)) {
        b[k] = a[k];
      }
    }
    return b;
  }

  function subcontext(a, b) {
    var c = {};
    copyPairs(a, c);
    copyPairs(b, c);
    c.level++;
    return c;
  }
  Logo.subcontext = subcontext;

  Logo.isNumeric = function (x) {
    return !isNaN(parseFloat(x)) && isFinite(x);
  };

  Logo.syntax.repeat = {
    params: ['times'],
    startsBlock: true,
    f: function (args, context, tokens) {
      var n = args.times,
          blockLevel = 1,
          blockTokens = [],
          head = {},
          token = undefined;
      if (!Logo.isNumeric(n)) {
        return Logo.error('How many times is ' + n + '?');
      }
      if (tokens.shift() !== '[') {
        return Logo.error('Please surround what you want me to repeat in brackets [ ]');
      }
      while (token = tokens.shift()) {
        if (token === '[') {
          blockLevel++;
        } else if (token === ']') {
          blockLevel--;
          if (blockLevel < 0) {
            return Logo.error('Closing bracket without opening one');
          }
          if (blockLevel === 0) {
            var block = parse(blockTokens, context);
            head = (typeof block === 'function')
              ? function () { for (var i = parseInt(n); i > 0; i--) { block(); } }
              : block;
            break;
          }
        }
        blockTokens.push(token);
      }
      if (blockLevel) {
        return Logo.error("The brackets don't match");
      }
      return head;
    }
  };

  Logo.eval = function (lhs, tokens, min, context) {
    while (tokens.length && order(tokens[0]) >= min) {
      var op = tokens.shift(),
          rhs = tokens.shift();
      while (order(tokens[0]) >= order(op)) {
        rhs = Logo.eval(rhs, tokens, order(tokens[0]));
      }
      lhs = apply(op, valueOf(lhs, context), valueOf(rhs, context));
    }
    if (typeof lhs === 'string' && Logo.isNumeric(lhs)) {
      lhs = parseFloat(lhs);
    }
    return lhs;
  };

  function order(op) {
    return op in operators ? operators[op].order : 0;
  }

  function apply(op, lhs, rhs) {
    if (Logo.isNumeric(lhs)) lhs = parseFloat(lhs);
    if (Logo.isNumeric(rhs)) rhs = parseFloat(rhs);
    return operators[op].apply(lhs, rhs);
  }

  var operators = {
    '*': { order: 6, apply: function (a, b) { return a * b } },
    '/': { order: 6, apply: function (a, b) { return a / b } },
    '%': { order: 6, apply: function (a, b) { return a % b } },
    '+': { order: 5, apply: function (a, b) { return a + b } },
    '-': { order: 5, apply: function (a, b) { return a - b } },
    '<': { order: 4, apply: function (a, b) { return a < b } },
    '>': { order: 4, apply: function (a, b) { return a > b } },
    '<=': { order: 4, apply: function (a, b) { return a <= b } },
    '>=': { order: 4, apply: function (a, b) { return a >= b } },
    '=': { order: 3, apply: function (a, b) { return a == b } },
    '!=': { order: 3, apply: function (a, b) { return a != b } },
    'and': { order: 2, apply: function (a, b) { return a && b } },
    'or': { order: 1, apply: function (a, b) { return a || b } }
  };

})();

Logo.syntax.print = {
  params: ['value'],
  f: function (args, context) {
    return function () {
      console.log(args.value);
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
        var f = function (args, context) {
          for (var i in args) {
            args[i] = Logo.valueOf(args[i], context);
          }
          return Logo.parse(blockTokens.concat(), Logo.subcontext(context, args));
        };
        context.syntax[verb] = {
          f: f,
          params: params
        };
        head = function () {};
        break;
      } else {
        blockTokens.push(token);
      }
    }
    if (typeof head !== 'function') {
      return Logo.error('No end to ' + verb);
    }
    return head;
  }
};

Logo.syntax.if = {
  startsBlock: true,
  f: function (args, context, tokens) {
    var inExpr = true,
        expr = [],
        blockLevel = 1,
        blockTokens = [],
        head = {},
        token = undefined;
    while (token = tokens.shift()) {
      if (inExpr) {
        if (token !== '[') {
          expr.push(token);
        } else {
          inExpr = false;
        }
        continue;
      }
      if (token === '[') {
        blockLevel++;
      } else if (token === ']') {
        blockLevel--;
        if (blockLevel < 0) {
          return Logo.error('Closing bracket without opening one');
        }
        if (blockLevel === 0) {
          var block = Logo.parse(blockTokens, context);
          head = (typeof block === 'function')
            ? function () { if (Logo.eval(expr.shift(), expr, 0, context)) { block(); } }
            : block;
          break;
        }
      }
      blockTokens.push(token);
    }
    if (blockLevel) {
      return Logo.error("The brackets don't match");
    }
    return head;
  }
};
