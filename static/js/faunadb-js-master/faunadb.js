(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.faunadb = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var query = require('./src/query')
var util = require('./src/_util')
var parseJSON = require('./src/_json').parseJSON

module.exports = util.mergeObjects(
  {
    Client: require('./src/Client'),
    Expr: require('./src/Expr'),
    PageHelper: require('./src/PageHelper'),
    RequestResult: require('./src/RequestResult'),

    clientLogger: require('./src/clientLogger'),
    errors: require('./src/errors'),
    values: require('./src/values'),
    query: query,
    parseJSON: parseJSON,
  },
  query
)

},{"./src/Client":12,"./src/Expr":13,"./src/PageHelper":14,"./src/RequestResult":15,"./src/_json":20,"./src/_util":21,"./src/clientLogger":22,"./src/errors":23,"./src/query":24,"./src/values":26}],2:[function(require,module,exports){
/*globals self, window */
"use strict"

/*eslint-disable @mysticatea/prettier */
const { AbortController, AbortSignal } =
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window :
    /* otherwise */ undefined
/*eslint-enable @mysticatea/prettier */

module.exports = AbortController
module.exports.AbortSignal = AbortSignal
module.exports.default = AbortController

},{}],3:[function(require,module,exports){
(function (global){
/*globals require, self, window */
"use strict"

const ac = require("./dist/abort-controller")

/*eslint-disable @mysticatea/prettier */
const g =
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window :
    typeof global !== "undefined" ? global :
    /* otherwise */ undefined
/*eslint-enable @mysticatea/prettier */

if (g) {
    if (typeof g.AbortController === "undefined") {
        g.AbortController = ac.AbortController
    }
    if (typeof g.AbortSignal === "undefined") {
        g.AbortSignal = ac.AbortSignal
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./dist/abort-controller":2}],4:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
var __self__ = (function (root) {
function F() {
this.fetch = false;
this.DOMException = root.DOMException
}
F.prototype = root;
return new F();
})(typeof self !== 'undefined' ? self : this);
(function(self) {

var irrelevant = (function (exports) {

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  return exports;

}({}));
})(__self__);
delete __self__.fetch.polyfill
exports = __self__.fetch // To enable: import fetch from 'cross-fetch'
exports.default = __self__.fetch // For TypeScript consumers without esModuleInterop.
exports.fetch = __self__.fetch // To enable: import {fetch} from 'cross-fetch'
exports.Headers = __self__.Headers
exports.Request = __self__.Request
exports.Response = __self__.Response
module.exports = exports

},{}],7:[function(require,module,exports){
'use strict';

module.exports = annotate;

function annotate(fn) {

  if (typeof fn !== 'function') {
    throw new Error('Could not parse function signature for injection dependencies: Object is not a function');
  }

  if (!fn.length) return [];

  var injects = /^()\(?([^)=]*)\)? *=>/.exec(fn + '') ||
                /^[^(]+([^ \(]*) *\(([^\)]*)\)/.exec(fn + '');

  if (!injects) {
    throw new Error('Could not parse function signature for injection dependencies: ' + fn + '');
  }

  var argumentString = injects[2]

  // Strip multi-line comments:
  // Uses the lazy-quantifier (.*?): http://www.rexegg.com/regex-quantifiers.html#lazy_solution
  .replace(/\/\*[\S\s]*?\*\//g, ' ')

  // Strip single-line comments:
  .replace(/\/\/.*/g, ' ');

  function groupSubArguments(_, type, keys) {
    return type + keys.split(',')
    .map(function (arg) {
      return arg && arg.trim();
    })
    .filter(Boolean)
    .join('@');
  }

  argumentString = argumentString.replace(/(\{)([^}]*)\}/g, groupSubArguments);
  argumentString = argumentString.replace(/(\[)([^}]*)\]/g, groupSubArguments);

  return argumentString.split(',')
  .map(function (arg) {
    return arg && arg.trim();
  })
  .map(function (arg) {
    if (arg[0] === '{') {
      return arg.substring(1).split('@');
    }
    if (arg[0] === '[') {
      return { items: arg.substring(1).split('@') };
    }
    return arg;
  })
  .filter(Boolean);

}

},{}],8:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
module.exports={
  "name": "faunadb",
  "version": "4.3.0",
  "apiVersion": "4",
  "description": "FaunaDB Javascript driver for Node.JS and Browsers",
  "homepage": "https://fauna.com",
  "repository": "fauna/faunadb-js",
  "license": "MPL-2.0",
  "keywords": [
    "database",
    "fauna",
    "official",
    "driver"
  ],
  "bugs": {
    "url": "https://github.com/fauna/faunadb-js/issues"
  },
  "files": [
    "index.d.ts",
    "src/",
    "dist/",
    "tools/printReleaseNotes.js"
  ],
  "main": "index.js",
  "scripts": {
    "doc": "jsdoc -c ./jsdoc.json",
    "browserify": "browserify index.js --standalone faunadb -o dist/faunadb.js",
    "browserify-min": "browserify index.js --standalone faunadb | terser -c -m --keep-fnames --keep-classnames -o dist/faunadb-min.js",
    "prettify": "prettier --write \"{src,test}/**/*.{js,ts}\"",
    "test": "jest --env=node --verbose=false --forceExit ./test",
    "semantic-release": "semantic-release",
    "wp": "webpack",
    "postinstall": "node ./tools/printReleaseNotes",
    "postupdate": "node ./tools/printReleaseNotes",
    "load-test": "node ./tools/loadTest"
  },
  "types": "index.d.ts",
  "dependencies": {
    "abort-controller": "^3.0.0",
    "base64-js": "^1.2.0",
    "boxen": "^5.0.1",
    "btoa-lite": "^1.0.0",
    "chalk": "^4.1.1",
    "cross-fetch": "^3.0.6",
    "dotenv": "^8.2.0",
    "fn-annotate": "^1.1.3",
    "object-assign": "^4.1.0",
    "util-deprecate": "^1.0.2"
  },
  "devDependencies": {
    "browserify": "^16.2.2",
    "eslint": "^5.3.0",
    "eslint-config-prettier": "^6.5.0",
    "eslint-plugin-prettier": "^3.1.1",
    "husky": ">=1",
    "ink-docstrap": "^1.2.1",
    "jest": "^24.9.0",
    "jsdoc": "^3.6.3",
    "lint-staged": ">=8",
    "prettier": "1.18.2",
    "semantic-release": "^17.1.2",
    "terser": "^4.3.9",
    "webpack": "^5.23.0",
    "webpack-cli": "^4.5.0",
    "yargs": "^16.2.0"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,css,json,md}": [
      "prettier --write",
      "git add"
    ],
    "*.js": [
      "eslint --fix",
      "git add"
    ]
  },
  "release": {
    "branches": [
      "master"
    ]
  },
  "browser": {
    "http2": false,
    "http": false,
    "https": false,
    "os": false,
    "util": false,
    "boxen": false,
    "chalk": false
  }
}

},{}],12:[function(require,module,exports){
'use strict'

var packageJson = require('../package.json')
var PageHelper = require('./PageHelper')
var RequestResult = require('./RequestResult')
var errors = require('./errors')
var http = require('./_http')
var json = require('./_json')
var query = require('./query')
var stream = require('./stream')
var util = require('./_util')
var values = require('./values')

/**
 * The callback that will be executed after every completed request.
 *
 * @callback Client~observerCallback
 * @param {RequestResult} res
 */

/**
 * **WARNING: This is an experimental feature. There are no guarantees to
 * its API stability and/or service availability. DO NOT USE IT IN
 * PRODUCTION**.
 *
 * Creates a subscription to the result of the given read-only expression. When
 * executed, the expression must only perform reads and produce a single
 * streamable type, such as a reference or a version. Expressions that attempt
 * to perform writes or produce non-streamable types will result in an error.
 * Otherwise, any expression can be used to initiate a stream, including
 * user-defined function calls.
 *
 * The subscription returned by this method does not issue any requests until
 * the {@link module:stream~Subscription#start} method is called. Make sure to
 * subscribe to the events of interest, otherwise the received events are simply
 * ignored. For example:
 *
 * ```
 * client.stream(document.ref)
 *   .on('version', version => console.log(version))
 *   .on('error', error => console.log(error))
 *   .start()
 * ```
 *
 * Please note that streams are not temporal, meaning that there is no option to
 * configure its starting timestamp. The stream will, however, state its initial
 * subscription time via the {@link module:stream~Subscription#event:start}
 * event. A common programming mistake is to read a document, then initiate a
 * subscription. This approach can miss events that occurred between the initial
 * read and the subscription request. To prevent event loss, make sure the
 * subscription has started before performing a data load. The following example
 * buffer events until the document's data is loaded:
 *
 * ```
 * var buffer = []
 * var loaded = false
 *
 * client.stream(document.ref)
 *   .on('start', ts => {
 *     loadData(ts).then(data => {
 *       processData(data)
 *       processBuffer(buffer)
 *       loaded = true
 *     })
 *   })
 *   .on('version', version => {
 *     if (loaded) {
 *       processVersion(version)
 *     } else {
 *       buffer.push(version)
 *     }
 *   })
 *   .start()
 * ```
 *
 * The reduce boilerplate, the `document` helper implements a similar
 * functionality, except it discards events prior to the document's snapshot
 * time. The expression given to this helper must be a reference as it
 * internally runs a {@link module:query~Get} call with it. The example above
 * can be rewritten as:
 *
 * ```
 * client.stream.document(document.ref)
 *   .on('snapshot', data => processData(data))
 *   .on('version', version => processVersion(version))
 *   .start()
 * ```
 *
 * Be aware that streams are not available in all browsers. If the client can't
 * initiate a stream, an error event with the {@link
 * module:errors~StreamsNotSupported} error will be emmited.
 *
 * To stop a subscription, call the {@link module:stream~Subscription#close}
 * method:
 *
 * ```
 * var subscription = client.stream(document.ref)
 *   .on('version', version => processVersion(version))
 *   .start()
 *
 * // ...
 * subscription.close()
 * ```
 *
 * @param {module:query~ExprArg} expression
 *   The expression to subscribe to. Created from {@link module:query}
 *   functions.
 *
 * @param {?module:stream~Options} options
 *   Object that configures the stream.
 *
 * @property {function} document
 *  A document stream helper. See {@link Client#stream} for more information.
 *
 * @see module:stream~Subscription
 *
 * @function
 * @name Client#stream
 * @returns {module:stream~Subscription} A new subscription instance.
 */

/**
 * A client for interacting with FaunaDB.
 *
 * Users will mainly call the {@link Client#query} method to execute queries, or
 * the {@link Client#stream} method to subscribe to streams.
 *
 * See the [FaunaDB Documentation](https://fauna.com/documentation) for detailed examples.
 *
 * All methods return promises containing a JSON object that represents the FaunaDB response.
 * Literal types in the response object will remain as strings, Arrays, and objects.
 * FaunaDB types, such as {@link Ref}, {@link SetRef}, {@link FaunaTime}, and {@link FaunaDate} will
 * be converted into the appropriate object.
 *
 * (So if a response contains `{ "@ref": "collections/frogs/123" }`,
 * it will be returned as `new Ref("collections/frogs/123")`.)
 *
 * @constructor
 * @param {?Object} options
 *   Object that configures this FaunaDB client.
 * @param {?string} options.domain
 *   Base URL for the FaunaDB server.
 * @param {?{ string: string }} options.headers
 *   Base URL for the FaunaDB server.
 * @param {?('http'|'https')} options.scheme
 *   HTTP scheme to use.
 * @param {?number} options.port
 *   Port of the FaunaDB server.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @param {?number} options.timeout Read timeout in seconds.
 * @param {?Client~observerCallback} options.observer
 *   Callback that will be called after every completed request.
 * @param {?boolean} options.keepAlive
 *   Configures http/https keepAlive option (ignored in browser environments)
 * @param {?fetch} options.fetch
 *   a fetch compatible [API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for making a request
 * @param {?number} options.queryTimeout
 *   Sets the maximum amount of time (in milliseconds) for query execution on the server
 * @param {?number} options.http2SessionIdleTime
 *   Sets the maximum amount of time (in milliseconds) an HTTP2 session may live
 *   when there's no activity. Must either be a non-negative integer, or Infinity to allow the
 *   HTTP2 session to live indefinitely (use `Client#close` to manually terminate the client).
 *   Only applicable for NodeJS environment (when http2 module is used). Default is 500ms;
 *   can also be configured via the FAUNADB_HTTP2_SESSION_IDLE_TIME environment variable
 *   which has the highest priority and overrides the option passed into the Client constructor.
 */
function Client(options) {
  var http2SessionIdleTime = getHttp2SessionIdleTime()

  options = util.applyDefaults(options, {
    domain: 'db.fauna.com',
    scheme: 'https',
    port: null,
    secret: null,
    timeout: 60,
    observer: null,
    keepAlive: true,
    headers: {},
    fetch: undefined,
    queryTimeout: null,
    http2SessionIdleTime: http2SessionIdleTime.value,
  })

  if (http2SessionIdleTime.shouldOverride) {
    options.http2SessionIdleTime = http2SessionIdleTime.value
  }

  this._observer = options.observer
  this._http = new http.HttpClient(options)
  this.stream = stream.StreamAPI(this)
}

/**
 * Current API version.
 *
 * @type {string}
 */
Client.apiVersion = packageJson.apiVersion

/**
 * Executes a query via the FaunaDB Query API.
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi),
 * and the query functions in this documentation.
 * @param expression {module:query~ExprArg}
 *   The query to execute. Created from {@link module:query} functions.
 * @param {?Object} options
 *   Object that configures the current query, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.query = function(expression, options) {
  return this._execute('POST', '', query.wrap(expression), null, options)
}

/**
 * Returns a {@link PageHelper} for the given Query expression.
 * This provides a helpful API for paginating over FaunaDB responses.
 * @param expression {Expr}
 *   The Query expression to paginate over.
 * @param params {Object}
 *   Options to be passed to the paginate function. See [paginate](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 * @param options {?Object}
 *   Object that configures the current pagination queries, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @returns {PageHelper} A PageHelper that wraps the provided expression.
 */
Client.prototype.paginate = function(expression, params, options) {
  params = util.defaults(params, {})
  options = util.defaults(options, {})

  return new PageHelper(this, expression, params, options)
}

/**
 * Sends a `ping` request to FaunaDB.
 * @return {external:Promise<string>} Ping response.
 */
Client.prototype.ping = function(scope, timeout) {
  return this._execute('GET', 'ping', null, { scope: scope, timeout: timeout })
}

/**
 * Get the freshest timestamp reported to this client.
 * @returns {number} the last seen transaction time
 */
Client.prototype.getLastTxnTime = function() {
  return this._http.getLastTxnTime()
}

/**
 * Sync the freshest timestamp seen by this client.
 *
 * This has no effect if staler than currently stored timestamp.
 * WARNING: This should be used only when coordinating timestamps across
 *          multiple clients. Moving the timestamp arbitrarily forward into
 *          the future will cause transactions to stall.
 * @param time {number} the last seen transaction time
 */
Client.prototype.syncLastTxnTime = function(time) {
  this._http.syncLastTxnTime(time)
}

/**
 * Closes the client session and cleans up any held resources.
 * By default, it will wait for any ongoing requests to complete on their own;
 * streaming requests are terminated forcibly. Any subsequent requests will
 * error after the .close method is called.
 * Should be used at application termination in order to release any open resources
 * and allow the process to terminate e.g. when the custom http2SessionIdleTime parameter is used.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Specifying this property will force any ongoing
 * requests to terminate instead of gracefully waiting until they complete.
 * This may result in an ERR_HTTP2_STREAM_CANCEL error for NodeJS.
 * @returns {Promise<void>}
 */
Client.prototype.close = function(opts) {
  return this._http.close(opts)
}

Client.prototype._execute = function(method, path, data, query, options) {
  query = util.defaults(query, null)

  if (
    path instanceof values.Ref ||
    util.checkInstanceHasProperty(path, '_isFaunaRef')
  ) {
    path = path.value
  }

  if (query !== null) {
    query = util.removeUndefinedValues(query)
  }

  var startTime = Date.now()
  var self = this
  var body =
    ['GET', 'HEAD'].indexOf(method) >= 0 ? undefined : JSON.stringify(data)

  return this._http
    .execute(
      Object.assign({}, options, {
        path: path,
        query: query,
        method: method,
        body: body,
      })
    )
    .then(function(response) {
      var endTime = Date.now()
      var responseObject = json.parseJSON(response.body)
      var result = new RequestResult(
        method,
        path,
        query,
        body,
        data,
        response.body,
        responseObject,
        response.status,
        response.headers,
        startTime,
        endTime
      )
      self._handleRequestResult(response, result, options)

      return responseObject['resource']
    })
}

Client.prototype._handleRequestResult = function(response, result, options) {
  var txnTimeHeaderKey = 'x-txn-time'

  if (response.headers[txnTimeHeaderKey] != null) {
    this.syncLastTxnTime(parseInt(response.headers[txnTimeHeaderKey], 10))
  }

  var observers = [this._observer, options && options.observer]

  observers.forEach(observer => {
    if (typeof observer == 'function') {
      observer(result, this)
    }
  })

  errors.FaunaHTTPError.raiseForStatusCode(result)
}

function getHttp2SessionIdleTime() {
  var fromEnv = util.getEnvVariable('FAUNADB_HTTP2_SESSION_IDLE_TIME')
  var parsed =
    // Allow either "Infinity" or parsable integer string.
    fromEnv === 'Infinity' ? Infinity : parseInt(fromEnv, 10)
  var useEnvVar = !isNaN(parsed)

  return {
    shouldOverride: useEnvVar,
    value: useEnvVar ? parsed : 500,
  }
}

module.exports = Client

},{"../package.json":11,"./PageHelper":14,"./RequestResult":15,"./_http":19,"./_json":20,"./_util":21,"./errors":23,"./query":24,"./stream":25,"./values":26}],13:[function(require,module,exports){
'use strict'

var util = require('./_util')

/**
 * A representation of a FaunaDB Query Expression. Generally, you shouldn't need
 * to use this class directly; use the Query helpers defined in {@link module:query}.
 *
 * @param {Object} obj The object that represents a Query to be treated as an Expression.
 * @constructor
 */
function Expr(obj) {
  this.raw = obj
}

Expr.prototype._isFaunaExpr = true

Expr.prototype.toJSON = function() {
  return this.raw
}

Expr.prototype.toFQL = function() {
  return exprToString(this.raw)
}

var varArgsFunctions = [
  'Do',
  'Call',
  'Union',
  'Intersection',
  'Difference',
  'Equals',
  'Add',
  'BitAnd',
  'BitOr',
  'BitXor',
  'Divide',
  'Max',
  'Min',
  'Modulo',
  'Multiply',
  'Subtract',
  'LT',
  'LTE',
  'GT',
  'GTE',
  'And',
  'Or',
]

// FQL function names come across the wire as all lowercase letters
// (like the key of this object). Not all are properly snake-cased
// on the Core side, which causes improper capitalizations.
//
// JS Driver patch: https://faunadb.atlassian.net/browse/FE-540
// Core update: https://faunadb.atlassian.net/browse/ENG-2110

var specialCases = {
  containsstrregex: 'ContainsStrRegex',
  endswith: 'EndsWith',
  findstr: 'FindStr',
  findstrregex: 'FindStrRegex',
  gt: 'GT',
  gte: 'GTE',
  is_nonempty: 'is_non_empty',
  lowercase: 'LowerCase',
  lt: 'LT',
  lte: 'LTE',
  ltrim: 'LTrim',
  ngram: 'NGram',
  rtrim: 'RTrim',
  regexescape: 'RegexEscape',
  replacestr: 'ReplaceStr',
  replacestrregex: 'ReplaceStrRegex',
  startswith: 'StartsWith',
  substring: 'SubString',
  titlecase: 'TitleCase',
  uppercase: 'UpperCase',
}

/**
 *
 * @param {Expr} expression A FQL expression
 * @returns {Boolean} Returns true for valid expressions
 * @private
 */
function isExpr(expression) {
  return (
    expression instanceof Expr ||
    util.checkInstanceHasProperty(expression, '_isFaunaExpr')
  )
}

/**
 *
 * @param {Object} obj An object to print
 * @returns {String} String representation of object
 * @private
 */
function printObject(obj) {
  return (
    '{' +
    Object.keys(obj)
      .map(function(k) {
        return '"' + k + '"' + ': ' + exprToString(obj[k])
      })
      .join(', ') +
    '}'
  )
}

/**
 *
 * @param {Array} arr An array to print
 * @param {Function} toStr Function used for stringification
 * @returns {String} String representation of array
 * @private
 */
function printArray(arr, toStr) {
  return arr
    .map(function(item) {
      return toStr(item)
    })
    .join(', ')
}

/**
 *
 * @param {String} fn A snake-case FQL function name
 * @returns {String} The correpsonding camel-cased FQL function name
 * @private
 */
function convertToCamelCase(fn) {
  // For FQL functions with special formatting concerns, we
  // use the specialCases object above to define their casing.
  if (fn in specialCases) fn = specialCases[fn]

  return fn
    .split('_')
    .map(function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    .join('')
}

var exprToString = function(expr, caller) {
  // If expr is a Expr, we want to parse expr.raw instead
  if (isExpr(expr)) {
    if ('value' in expr) return expr.toString()
    expr = expr.raw
  }

  // Return early to avoid extra work if null
  if (expr === null) {
    return 'null'
  }

  // Return stringified value if expression is not an Object or Array
  switch (typeof expr) {
    case 'string':
      return JSON.stringify(expr)
    case 'symbol':
    case 'number':
    case 'boolean':
      return expr.toString()
    case 'undefined':
      return 'undefined'
  }

  // Handle expression Arrays
  if (Array.isArray(expr)) {
    var array = printArray(expr, exprToString)
    return varArgsFunctions.indexOf(caller) != -1 ? array : '[' + array + ']'
  }

  // Parse expression Objects
  if ('match' in expr) {
    var matchStr = exprToString(expr['match'])
    var terms = expr['terms'] || []

    if (isExpr(terms)) terms = terms.raw

    if (Array.isArray(terms) && terms.length == 0)
      return 'Match(' + matchStr + ')'

    if (Array.isArray(terms)) {
      return (
        'Match(' + matchStr + ', [' + printArray(terms, exprToString) + '])'
      )
    }

    return 'Match(' + matchStr + ', ' + exprToString(terms) + ')'
  }

  if ('paginate' in expr) {
    var exprKeys = Object.keys(expr)
    if (exprKeys.length === 1) {
      return 'Paginate(' + exprToString(expr['paginate']) + ')'
    }

    var expr2 = Object.assign({}, expr)
    delete expr2['paginate']

    return (
      'Paginate(' +
      exprToString(expr['paginate']) +
      ', ' +
      printObject(expr2) +
      ')'
    )
  }

  if ('let' in expr && 'in' in expr) {
    var letExpr = ''

    if (Array.isArray(expr['let']))
      letExpr = '[' + printArray(expr['let'], printObject) + ']'
    else letExpr = printObject(expr['let'])

    return 'Let(' + letExpr + ', ' + exprToString(expr['in']) + ')'
  }

  if ('object' in expr) return printObject(expr['object'])

  if ('merge' in expr) {
    if (expr.lambda) {
      return (
        'Merge(' +
        exprToString(expr.merge) +
        ', ' +
        exprToString(expr.with) +
        ', ' +
        exprToString(expr.lambda) +
        ')'
      )
    }

    return (
      'Merge(' + exprToString(expr.merge) + ', ' + exprToString(expr.with) + ')'
    )
  }

  if ('lambda' in expr) {
    return (
      'Lambda(' +
      exprToString(expr['lambda']) +
      ', ' +
      exprToString(expr['expr']) +
      ')'
    )
  }

  if ('filter' in expr) {
    return (
      'Filter(' +
      exprToString(expr['collection']) +
      ', ' +
      exprToString(expr['filter']) +
      ')'
    )
  }

  if ('call' in expr) {
    return (
      'Call(' +
      exprToString(expr['call']) +
      ', ' +
      exprToString(expr['arguments']) +
      ')'
    )
  }

  if ('map' in expr) {
    return (
      'Map(' +
      exprToString(expr['collection']) +
      ', ' +
      exprToString(expr['map']) +
      ')'
    )
  }

  if ('foreach' in expr) {
    return (
      'Foreach(' +
      exprToString(expr['collection']) +
      ', ' +
      exprToString(expr['foreach']) +
      ')'
    )
  }

  var keys = Object.keys(expr)
  var fn = keys[0]
  fn = convertToCamelCase(fn)

  // The filter prevents zero arity functions from having a null argument
  // This only works under the assumptions
  // that there are no functions where a single 'null' argument makes sense.
  var args = keys
    .filter(k => expr[k] !== null || keys.length > 1)
    .map(k => exprToString(expr[k], fn))
    .join(', ')

  return fn + '(' + args + ')'
}

Expr.toString = exprToString

module.exports = Expr

},{"./_util":21}],14:[function(require,module,exports){
'use strict'

var query = require('./query')
var objectAssign = require('object-assign')

/**
 * A FaunaDB Lambda expression to be passed into one of the collection
 * functions: Map or Filter.
 *
 * @callback PageHelper~collectionFunction
 * @param {any} var
 *   The variable passed in by FaunaDB when this Lambda
 *   function is executed.
 * @return {Expr}
 *   The FaunaDB query expression to be returned by this Lambda.
 */

/**
 * @callback PageHelper~eachFunction
 * @param {Object} page
 *   A page returned by FaunaDB's Paginate function.
 */

/**
 * A wrapper that provides a helpful API for consuming FaunaDB pages.
 *
 * Generally this is constructed through the {@link Client#paginate} method.
 *
 * The {@link PageHelper#map} and {@link PageHelper#filter} methods will wrap the underlying query with a Map
 * and Filter query function, respectively. These will be executed on the server when a promise-returning function
 * is called.
 *
 * The {@link PageHelper#each} and {@link PageHelper#eachReverse} functions dispatch queries to FaunaDB, and return Promises
 * representing the completion of those queries. The callbacks provided to these functions are executed locally when the
 * queries return.
 *
 * The {@link PageHelper#nextPage} and {@link PageHelper#previousPage} functions also dispatch queries to FaunaDB,
 * but return their responses in a wrapped Promise.
 *
 * @param {Client} client
 *   The FaunaDB client used to paginate.
 * @param {Object} set
 *   The set to paginate.
 * @param {?Object} params
 *   Parameters to be passed to the FaunaDB Paginate function.
 * @param {?Object} options
 *   Object that configures the current pagination, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @constructor
 */
function PageHelper(client, set, params, options) {
  if (params === undefined) {
    params = {}
  }

  if (options === undefined) {
    options = {}
  }

  this.reverse = false
  this.params = {}

  this.before = undefined
  this.after = undefined

  objectAssign(this.params, params)

  var cursorParams = this.params.cursor || this.params

  if ('before' in cursorParams) {
    this.before = cursorParams.before
    delete cursorParams.before
  } else if ('after' in cursorParams) {
    this.after = cursorParams.after
    delete cursorParams.after
  }

  this.options = {}
  objectAssign(this.options, options)

  this.client = client
  this.set = set

  /**
   * @member {Array.<Function>}
   * @type {Array.<Function>}
   * @private
   */
  this._faunaFunctions = []
}

/**
 * Wraps the set to be paginated with a FaunaDB Map function.
 * As this function is executed on the server, the `lambda` param must
 * return a valid query expression.
 *
 * @param {PageHelper~collectionFunction} lambda
 *   The Lambda expression to be passed into the Map function.
 * @return {PageHelper}
 *
 */
PageHelper.prototype.map = function(lambda) {
  var rv = this._clone()
  rv._faunaFunctions.push(function(q) {
    return query.Map(q, lambda)
  })
  return rv
}

/**
 * Wraps the set to be paginated with a FaunaDB Filter funciton.
 * As this function is executed on the server, the `lambda` param must
 * return a valid query expression.
 *
 * @param {PageHelper~collectionFunction} lambda
 *   The lambda expression to be passed into the Filter function.
 * @return {PageHelper}
 */
PageHelper.prototype.filter = function(lambda) {
  var rv = this._clone()
  rv._faunaFunctions.push(function(q) {
    return query.Filter(q, lambda)
  })
  return rv
}

/**
 * Executes the provided function for each page.
 *
 * @param {PageHelper~eachFunction} lambda
 *   A function to be executed for each page.
 * @returns {external:Promise.<void>}
 */
PageHelper.prototype.each = function(lambda) {
  return this._retrieveNextPage(this.after, false).then(
    this._consumePages(lambda, false)
  )
}

/**
 * Executes the provided function for each page, in the reverse direction.
 * @param {PageHelper~eachFunction} lambda
 * @returns {external:Promise.<void>}
 */
PageHelper.prototype.eachReverse = function(lambda) {
  return this._retrieveNextPage(this.before, true).then(
    this._consumePages(lambda, true)
  )
}

/**
 * Queries for the previous page from the current cursor point; this mutates
 * the state of the PageHelper when the query completes, updating the internal
 * cursor state to that of the returned page.
 *
 * @returns {external:Promise.<object>}
 */
PageHelper.prototype.previousPage = function() {
  var self = this
  return this._retrieveNextPage(this.before, true).then(
    this._adjustCursors.bind(self)
  )
}

/**
 * Queries for the next page from the current cursor point; this mutates
 * the state of the PageHelper when the query completes, updating the internal
 * cursor state to that of the returned page.
 *
 * @returns {external:Promise.<object>}
 */
PageHelper.prototype.nextPage = function() {
  var self = this
  return this._retrieveNextPage(this.after, false).then(
    this._adjustCursors.bind(self)
  )
}

PageHelper.prototype._adjustCursors = function(page) {
  if (page.after !== undefined) {
    this.after = page.after
  }

  if (page.before !== undefined) {
    this.before = page.before
  }

  return page.data
}

PageHelper.prototype._consumePages = function(lambda, reverse) {
  var self = this
  return function(page) {
    var data = []
    page.data.forEach(function(item) {
      if (item.document) {
        item.instance = item.document
      }
      if (item.value && item.value.document) {
        item.value.instance = item.value.document
      }
      data.push(item)
    })
    lambda(data)

    var nextCursor
    if (reverse) {
      nextCursor = page.before
    } else {
      nextCursor = page.after
    }

    if (nextCursor !== undefined) {
      return self
        ._retrieveNextPage(nextCursor, reverse)
        .then(self._consumePages(lambda, reverse))
    } else {
      return Promise.resolve()
    }
  }
}

/**
 *
 * @returns {external:Promise.<Object>}
 * @private
 */
PageHelper.prototype._retrieveNextPage = function(cursor, reverse) {
  var opts = {}
  objectAssign(opts, this.params)
  var cursorOpts = opts.cursor || opts

  if (cursor !== undefined) {
    if (reverse) {
      cursorOpts.before = cursor
    } else {
      cursorOpts.after = cursor
    }
  } else {
    if (reverse) {
      cursorOpts.before = null
    }
  }

  var q = query.Paginate(this.set, opts)

  if (this._faunaFunctions.length > 0) {
    this._faunaFunctions.forEach(function(lambda) {
      q = lambda(q)
    })
  }

  return this.client.query(q, this.options)
}

/**
 * @private
 * @returns {PageHelper}
 */
PageHelper.prototype._clone = function() {
  return Object.create(PageHelper.prototype, {
    client: { value: this.client },
    set: { value: this.set },
    _faunaFunctions: { value: this._faunaFunctions },
    before: { value: this.before },
    after: { value: this.after },
  })
}

module.exports = PageHelper

},{"./query":24,"object-assign":8}],15:[function(require,module,exports){
'use strict'

/**
 * A structure containing the request and response context for a given FaunaDB request.
 * Provided to an observer function optionally defined in the {@link Client} constructor.
 *
 * @param {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} method
 *   The HTTP method used in the request.
 * @param {string} path
 *   The path that was queried. Relative to the client's domain.
 * @param {string} query
 *   URL query parameters. Only set if `method` is "GET".
 * @param {Object} requestRaw
 *   The JSON request string.
 * @param {Object} requestContent
 *   The request data.
 * @param {string} responseRaw
 *   The unparsed response data, as a string.
 * @param {object | FaunaHttpErrorResponseContent} responseContent
 *   The response data parsed as JSON.
 * @param {number} statusCode
 *   The HTTP response status code.
 * @param {object} responseHeaders
 *   The HTTP headers returned in the response.
 * @param {number} startTime
 *   The time the request was issued by the client.
 * @param {number} endTime
 *   The time the response was received by the client.
 * @constructor
 */
function RequestResult(
  method,
  path,
  query,
  requestRaw,
  requestContent,
  responseRaw,
  responseContent,
  statusCode,
  responseHeaders,
  startTime,
  endTime
) {
  /** @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} */
  this.method = method

  /** @type {string} */
  this.path = path

  /**
   * URL query. Null unless `method == 'get'`.
   * *Not* related to {@link Client.query}.
   * @type {object}
   */
  this.query = query

  /** @type {string} */
  this.requestRaw = requestRaw

  /** @type {object} */
  this.requestContent = requestContent

  /** @type {string} */
  this.responseRaw = responseRaw

  /**
   * Parsed value returned by the server.
   * Includes "resource" wrapper dict, or may be an FaunaHttpErrorResponseContent instead
   * @type {object | FaunaHttpErrorResponseContent}
   */
  this.responseContent = responseContent

  /** @type {number} */
  this.statusCode = statusCode

  /** @type {object} */
  this.responseHeaders = responseHeaders

  /** @type {number} */
  this.startTime = startTime

  /** @type {number} */
  this.endTime = endTime
}

/**
 * `this.endTime - this.startTime`: Time taken in milliseconds.
 * @type {number}
 */
Object.defineProperty(RequestResult.prototype, 'timeTaken', {
  get: function() {
    return this.endTime - this.startTime
  },
})

module.exports = RequestResult

},{}],16:[function(require,module,exports){
'use strict'
var util = require('../_util')

/**
 * Thrown by HttpClient when request hits specified timeout.
 *
 * @param {?string} message
 * @extends Error
 * @constructor
 */
function TimeoutError(message) {
  Error.call(this)

  this.message = message || 'Request aborted due to timeout'
  this.isTimeoutError = true
}

util.inherits(TimeoutError, Error)

/**
 * Thrown by HttpClient when request is aborted via Signal interface.
 *
 * @param {?string} message
 * @extends Error
 * @constructor
 */
function AbortError(message) {
  Error.call(this)

  this.message = message || 'Request aborted'
  this.isAbortError = true
}

util.inherits(AbortError, Error)

module.exports = {
  TimeoutError: TimeoutError,
  AbortError: AbortError,
}

},{"../_util":21}],17:[function(require,module,exports){
'use strict'
require('abort-controller/polyfill')
var util = require('../_util')
var faunaErrors = require('../errors')
var errors = require('./errors')

/**
 * Http client adapter built around fetch API.
 *
 * @constructor
 * @param {?object} options FetchAdapter options.
 * @param {?boolean} options.keepAlive Whether use keep-alive connection.
 * @param {?boolean} options.isHttps Whether use https connection.
 * @param {?function} options.fetch Fetch compatible API.
 * @private
 */
function FetchAdapter(options) {
  options = options || {}

  /**
   * Identifies a type of adapter.
   *
   * @type {string}
   */
  this.type = 'fetch'
  /**
   * Indicates whether the .close method has been called.
   *
   * @type {boolean}
   * @private
   */
  this._closed = false
  this._fetch = util.resolveFetch(options.fetch)
  /**
   * A map that tracks ongoing requests to be able to cancel them when
   * the .close method is called.
   *
   * @type {Map<Object, Object>}
   * @private
   */
  this._pendingRequests = new Map()

  if (util.isNodeEnv() && options.keepAlive) {
    this._keepAliveEnabledAgent = new (options.isHttps
      ? require('https')
      : require('http')
    ).Agent({ keepAlive: true })
  }
}

/**
 * Issues http requests using fetch API.
 *
 * @param {object} options Request options.
 * @param {string} options.origin Request origin.
 * @param {string} options.path Request path.
 * @param {?object} options.query Request query.
 * @param {string} options.method Request method.
 * @param {?object} options.headers Request headers.
 * @param {?string} options.body Request body utf8 string.
 * @params {?object} options.streamConsumer Stream consumer.
 * @param {?object} options.signal Abort signal object.
 * @param {?number} options.timeout Request timeout.
 * @returns {Promise} Request result.
 */
FetchAdapter.prototype.execute = function(options) {
  if (this._closed) {
    return Promise.reject(
      new faunaErrors.ClientClosed(
        'The Client has already been closed',
        'No subsequent requests can be issued after the .close method is called. ' +
          'Consider creating a new Client instance'
      )
    )
  }

  var self = this
  var timerId = null
  var isStreaming = options.streamConsumer != null
  // Use timeout only if no signal provided
  var useTimeout = !options.signal && !!options.timeout
  var ctrl = new AbortController()
  var pendingRequest = {
    isStreaming: isStreaming,
    isAbortedByClose: false,
    // This callback can be set during the .close method call to be notified
    // on request ending to resolve .close's Promise only after all of the requests complete.
    onComplete: null,
  }

  self._pendingRequests.set(ctrl, pendingRequest)

  var onComplete = function() {
    self._pendingRequests.delete(ctrl)

    if (options.signal) {
      options.signal.removeEventListener('abort', onAbort)
    }

    if (pendingRequest.onComplete) {
      pendingRequest.onComplete()
    }
  }

  var onSettle = function() {
    if (timerId) {
      clearTimeout(timerId)
    }
  }

  var onResponse = function(response) {
    onSettle()

    var headers = responseHeadersAsObject(response.headers)
    var processStream = isStreaming && response.ok

    // Regular request - return text content immediately.
    if (!processStream) {
      onComplete()

      return response.text().then(function(content) {
        return {
          body: content,
          headers: headers,
          status: response.status,
        }
      })
    }

    attachStreamConsumer(response, options.streamConsumer, onComplete)

    return {
      // Syntactic stream representation.
      body: '[stream]',
      headers: headers,
      status: response.status,
    }
  }

  var onError = function(error) {
    onSettle()
    onComplete()

    return Promise.reject(
      remapIfAbortError(error, function() {
        if (!isStreaming && pendingRequest.isAbortedByClose) {
          return new faunaErrors.ClientClosed(
            'The request is aborted due to the Client#close ' +
              'call with the force=true option'
          )
        }

        return useTimeout ? new errors.TimeoutError() : new errors.AbortError()
      })
    )
  }

  var onAbort = function() {
    ctrl.abort()
  }

  if (useTimeout) {
    timerId = setTimeout(function() {
      timerId = null
      ctrl.abort()
    }, options.timeout)
  }

  if (options.signal) {
    options.signal.addEventListener('abort', onAbort)
  }

  return this._fetch(
    util.formatUrl(options.origin, options.path, options.query),
    {
      method: options.method,
      headers: options.headers,
      body: options.body,
      agent: this._keepAliveEnabledAgent,
      signal: ctrl.signal,
    }
  )
    .then(onResponse)
    .catch(onError)
}

/**
 * Moves to the closed state, aborts streaming requests.
 * Aborts non-streaming requests if force is true,
 * waits until they complete otherwise.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Whether to force resources clean up.
 * @returns {Promise<void>}
 */
FetchAdapter.prototype.close = function(opts) {
  opts = opts || {}

  this._closed = true

  var promises = []

  var abortOrWait = function(pendingRequest, ctrl) {
    var shouldAbort = pendingRequest.isStreaming || opts.force

    if (shouldAbort) {
      pendingRequest.isAbortedByClose = true

      return ctrl.abort()
    }

    promises.push(
      new Promise(function(resolve) {
        pendingRequest.onComplete = resolve
      })
    )
  }

  this._pendingRequests.forEach(abortOrWait)

  var noop = function() {}

  return Promise.all(promises).then(noop)
}

/**
 * Attaches streamConsumer specifically either for browser or NodeJS.
 * Minimum browser compatibility based on current code:
 * Chrome                52
 * Edge                  79
 * Firefox               65
 * IE                    NA
 * Opera                 39
 * Safari                10.1
 * Android Webview       52
 * Chrome for Android    52
 * Firefox for Android   65
 * Opera for Android     41
 * Safari on iOS         10.3
 * Samsung Internet      6.0
 *
 * @param {object} response Fetch response.
 * @param {object} consumer StreamConsumer.
 * @param {function} onComplete Callback fired when the stream ends or errors.
 * @private
 */
function attachStreamConsumer(response, consumer, onComplete) {
  var onError = function(error) {
    onComplete()
    consumer.onError(remapIfAbortError(error))
  }

  if (util.isNodeEnv()) {
    response.body
      .on('error', onError)
      .on('data', consumer.onData)
      .on('end', function() {
        onComplete()
        // To simulate how browsers behave in case of "end" event.
        consumer.onError(new TypeError('network error'))
      })

    return
  }

  // ATTENTION: The following code is meant to run in browsers and is not
  // covered by current test automation. Manual testing on major browsers
  // is required after making changes to it.
  try {
    var reader = response.body.getReader()
    var decoder = new TextDecoder('utf-8')

    function pump() {
      return reader.read().then(function(msg) {
        if (!msg.done) {
          var chunk = decoder.decode(msg.value, { stream: true })

          consumer.onData(chunk)

          return pump()
        }

        onComplete()
        // In case a browser hasn't thrown the "network error" on stream's end
        // we need to force it in order to provide a way to handle stream's
        // ending.
        consumer.onError(new TypeError('network error'))
      })
    }

    pump().catch(onError)
  } catch (err) {
    throw new faunaErrors.StreamsNotSupported(
      'Please, consider providing a Fetch API-compatible function ' +
        'with streamable response bodies. ' +
        err
    )
  }
}

/**
 * Remaps an AbortError thrown by fetch to HttpClient's one
 * for timeout and abort use-cases.
 *
 * @param {Error} error Error object.
 * @param {?function} errorFactory A factory called to construct an abort error.
 * @returns {Error} Remapped or original error.
 * @private
 */
function remapIfAbortError(error, errorFactory) {
  var isAbortError = error && error.name === 'AbortError'

  if (!isAbortError) {
    return error
  }

  if (errorFactory) {
    return errorFactory()
  }

  return new errors.AbortError()
}

/**
 * Converts fetch Headers object into POJO.
 *
 * @param {object} headers Fetch Headers object.
 * @returns {object} Response headers as a plain object.
 * @private
 */
function responseHeadersAsObject(headers) {
  var result = {}

  for (var header of headers.entries()) {
    var key = header[0]
    var value = header[1]

    result[key] = value
  }

  return result
}

module.exports = FetchAdapter

},{"../_util":21,"../errors":23,"./errors":16,"abort-controller/polyfill":3,"http":5,"https":5}],18:[function(require,module,exports){
'use strict'
var http2 = require('http2')
var errors = require('./errors')
var faunaErrors = require('../errors')
var util = require('../_util')

var STREAM_PREFIX = 'stream::'

/**
 * Http client adapter built around NodeJS http2 module.
 *
 * @constructor
 * @param {object} options Http2Adapter options.
 * @param {number} options.http2SessionIdleTime The time (in milliseconds) that
 * an HTTP2 session may live when there's no activity.
 * @private
 */
function Http2Adapter(options) {
  /**
   * Identifies a type of adapter.
   *
   * @type {string}
   */
  this.type = 'http2'
  /**
   * Serves for reusing http2 sessions between multiple calls.
   *
   * @type {object}
   * @private
   */
  this._sessionMap = {}
  /**
   * The time (in ms) that an HTTP2 session may live when there's no activity.
   *
   * @type {number}
   * @private
   */
  this._http2SessionIdleTime = options.http2SessionIdleTime
  /**
   * Indicates whether the .close method has been called.
   *
   * @type {boolean}
   * @private
   */
  this._closed = false
}

/**
 * Resolves ClientHttp2Session to be reused across multiple requests.
 *
 * @param {string} origin Request origin to connect to.
 * @param {?boolean} isStreaming Whether it's a streaming request. A separate session
 * is created for streaming requests to avoid shared resources with regular
 * ones for the purpose of reliability.
 * @returns {object} An interface to operate with HTTP2 session.
 */
Http2Adapter.prototype._resolveSessionFor = function(origin, isStreaming) {
  var sessionKey = isStreaming ? STREAM_PREFIX + origin : origin

  if (this._sessionMap[sessionKey]) {
    return this._sessionMap[sessionKey]
  }

  var self = this
  var timerId = null
  var ongoingRequests = 0

  var cleanup = function() {
    self._cleanupSessionFor(origin, isStreaming)
  }

  var clearInactivityTimeout = function() {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  var setInactivityTimeout = function() {
    clearInactivityTimeout()

    if (self._http2SessionIdleTime === Infinity) {
      return
    }

    var onTimeout = function() {
      timerId = null

      if (ongoingRequests === 0) {
        cleanup()
      }
    }

    timerId = setTimeout(onTimeout, self._http2SessionIdleTime)
  }

  var close = function(force) {
    clearInactivityTimeout()

    var shouldDestroy = force || isStreaming

    if (shouldDestroy) {
      session.destroy()

      return Promise.resolve()
    }

    return new Promise(function(resolve) {
      session.close(resolve)
    })
  }

  var onRequestStart = function() {
    ++ongoingRequests
    clearInactivityTimeout()
  }

  var onRequestEnd = function() {
    --ongoingRequests

    var noOngoingRequests = ongoingRequests === 0
    var isSessionClosed = self._closed || session.closed || session.destroyed

    if (noOngoingRequests && !isSessionClosed) {
      setInactivityTimeout()
    }
  }

  var session = http2
    .connect(origin)
    .once('error', cleanup)
    .once('goaway', cleanup)
  var sessionInterface = {
    session: session,
    close: close,
    onRequestStart: onRequestStart,
    onRequestEnd: onRequestEnd,
  }

  this._sessionMap[sessionKey] = sessionInterface

  return sessionInterface
}

/**
 * Performs cleanup for broken session.
 *
 * @param {string} origin Request origin to connect to.
 * @param {?boolean} isStreaming Whether it's a streaming request.
 * @returns {void}
 */
Http2Adapter.prototype._cleanupSessionFor = function(origin, isStreaming) {
  var sessionKey = isStreaming ? STREAM_PREFIX + origin : origin

  if (this._sessionMap[sessionKey]) {
    this._sessionMap[sessionKey].session.close()
    delete this._sessionMap[sessionKey]
  }
}

/**
 * Issues http requests using http2 module.
 *
 * @param {object} options Request options.
 * @param {string} options.origin Request origin.
 * @param {string} options.path Request path.
 * @param {?object} options.query Request query.
 * @param {string} options.method Request method.
 * @param {?object} options.headers Request headers.
 * @param {?string} options.body Request body utf8 string.
 * @params {?object} options.streamConsumer Stream consumer.
 * @param {?object} options.signal Abort signal object.
 * @param {?number} options.timeout Request timeout.
 * @returns {Promise} Request result.
 */
Http2Adapter.prototype.execute = function(options) {
  if (this._closed) {
    return Promise.reject(
      new faunaErrors.ClientClosed(
        'The Client has already been closed',
        'No subsequent requests can be issued after the .close method is called. ' +
          'Consider creating a new Client instance'
      )
    )
  }

  var self = this
  var isStreaming = options.streamConsumer != null

  return new Promise(function(resolvePromise, rejectPromise) {
    var isPromiseSettled = false
    var isCanceled = false

    var resolve = function(value) {
      isPromiseSettled = true
      resolvePromise(value)
    }

    // If an error has occurred after the Promise is settled
    // we need to call streamConsumer.onError instead of reject function.
    // Possible scenario is aborting request when stream is already being consumed.
    var rejectOrOnError = function(error) {
      var remapped = remapHttp2Error(error)

      if (isPromiseSettled && isStreaming) {
        return options.streamConsumer.onError(remapped)
      }

      isPromiseSettled = true
      rejectPromise(remapped)
    }

    var onSettled = function() {
      sessionInterface.onRequestEnd()

      if (options.signal) {
        options.signal.removeEventListener('abort', onAbort)
      }
    }

    var onError = function(error) {
      onSettled()
      rejectOrOnError(error)
    }

    var onAbort = function() {
      isCanceled = true
      onSettled()
      request.close(http2.constants.NGHTTP2_CANCEL)
      rejectOrOnError(new errors.AbortError())
    }

    var onTimeout = function() {
      isCanceled = true
      onSettled()
      request.close(http2.constants.NGHTTP2_CANCEL)
      rejectOrOnError(new errors.TimeoutError())
    }

    var onResponse = function(responseHeaders) {
      var status = responseHeaders[http2.constants.HTTP2_HEADER_STATUS]
      var isOkStatus = status >= 200 && status < 400
      var processStream = isOkStatus && isStreaming
      var responseBody = ''

      var onData = function(chunk) {
        if (processStream) {
          return options.streamConsumer.onData(chunk)
        }

        responseBody += chunk
      }

      var onEnd = function() {
        if (!isCanceled) {
          onSettled()
        }

        if (!processStream) {
          return resolve({
            body: responseBody,
            headers: responseHeaders,
            status: status,
          })
        }

        // Call .onError with TypeError only if the request hasn't been canceled
        // and the Client hasn't been closed in order to align on how
        // FetchAdapter works - it throws the TypeError due to underlying fetch API mechanics.
        if (!isCanceled && !self._closed) {
          options.streamConsumer.onError(new TypeError('network error'))
        }
      }

      if (processStream) {
        resolve({
          // Syntactic stream representation.
          body: '[stream]',
          headers: responseHeaders,
          status: status,
        })
      }

      request.on('data', onData).on('end', onEnd)
    }

    try {
      var pathname =
        (options.path[0] === '/' ? options.path : '/' + options.path) +
        util.querystringify(options.query, '?')
      var requestHeaders = Object.assign({}, options.headers, {
        [http2.constants.HTTP2_HEADER_PATH]: pathname,
        [http2.constants.HTTP2_HEADER_METHOD]: options.method,
      })
      var sessionInterface = self._resolveSessionFor(
        options.origin,
        isStreaming
      )
      var request = sessionInterface.session
        .request(requestHeaders)
        .setEncoding('utf8')
        .on('error', onError)
        .on('response', onResponse)

      sessionInterface.onRequestStart()

      // Set up timeout only if no signal provided.
      if (!options.signal && options.timeout) {
        request.setTimeout(options.timeout, onTimeout)
      }

      if (options.signal) {
        options.signal.addEventListener('abort', onAbort)
      }

      if (options.body != null) {
        request.write(options.body)
      }

      request.end()
    } catch (error) {
      self._cleanupSessionFor(options.origin, isStreaming)
      rejectOrOnError(error)
    }
  })
}

/**
 * Moves to the closed state, cleans up ongoing HTTP2 sessions if any.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Whether to force resources clean up.
 * @returns {Promise<void>}
 */
Http2Adapter.prototype.close = function(opts) {
  opts = opts || {}

  this._closed = true

  var noop = function() {}

  return Promise.all(
    Object.values(this._sessionMap).map(function(sessionInterface) {
      return sessionInterface.close(opts.force)
    })
  ).then(noop)
}

/**
 * Remaps internal NodeJS error into ClientClosed one.
 *
 * @private
 * @param {Error} error Error object.
 * @returns {Error} Remapped error.
 */
function remapHttp2Error(error) {
  var shouldRemap =
    error.code === 'ERR_HTTP2_GOAWAY_SESSION' ||
    error.code === 'ERR_HTTP2_STREAM_CANCEL'

  if (shouldRemap) {
    return new faunaErrors.ClientClosed(
      'The request is aborted due to the Client#close call'
    )
  }

  return error
}

module.exports = Http2Adapter

},{"../_util":21,"../errors":23,"./errors":16,"http2":5}],19:[function(require,module,exports){
(function (process,global){
'use strict'
var packageJson = require('../../package.json')
const { getBrowserOsDetails } = require('../_util')
var util = require('../_util')
var errors = require('./errors')

/**
 * The driver's internal HTTP client.
 *
 * @constructor
 * @param {Object} options Same as the {@link Client} options.
 * @private
 */
function HttpClient(options) {
  var isHttps = options.scheme === 'https'

  // If the port is a falsy value - replace it with default one.
  if (!options.port) {
    options.port = isHttps ? 443 : 80
  }

  // HTTP2 adapter is applicable only if it's NodeJS env and
  // no fetch API override provided (to preserve backward-compatibility).
  var useHttp2Adapter = !options.fetch && util.isNodeEnv() && isHttp2Supported()

  this._adapter = useHttp2Adapter
    ? new (require('./http2Adapter'))({
        http2SessionIdleTime: options.http2SessionIdleTime,
      })
    : new (require('./fetchAdapter'))({
        isHttps: isHttps,
        fetch: options.fetch,
        keepAlive: options.keepAlive,
      })
  this._baseUrl = options.scheme + '://' + options.domain + ':' + options.port
  this._secret = options.secret
  this._headers = Object.assign({}, options.headers, getDefaultHeaders())
  this._queryTimeout = options.queryTimeout
  this._lastSeen = null
  this._timeout = Math.floor(options.timeout * 1000)
}

/**
 * Returns last seen transaction time.
 *
 * @returns {number} The last seen transaction time.
 */
HttpClient.prototype.getLastTxnTime = function() {
  return this._lastSeen
}

/**
 * Sets the last seen transaction if the given timestamp is greater than then
 * know last seen timestamp.
 *
 * @param {number} time transaction timestamp.
 */
HttpClient.prototype.syncLastTxnTime = function(time) {
  if (this._lastSeen == null || this._lastSeen < time) {
    this._lastSeen = time
  }
}

/**
 * Cleans up any held resources.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Whether to force resources clean up.
 * @returns {Promise<void>}
 */
HttpClient.prototype.close = function(opts) {
  return this._adapter.close(opts)
}

/**
 * Executes an HTTP request.
 *
 * @param {?object} options Request parameters.
 * @param {?string} options.method Request method.
 * @param {?string} options.path Request path.
 * @param {?string} options.body Request body.
 * @param {?object} options.query Request query.
 * @params {?object} options.streamConsumer Stream consumer, if presented
 * the request will be "streamed" into streamConsumer.onData function.
 * @params {function} options.streamConsumer.onData Function called with a chunk of data.
 * @params {function} options.streamConsumer.onError Function called
 * when an error occurred.
 * when the stream is ended.
 * @param {?object} options.signal Abort signal object.
 * @param {?object} options.fetch Fetch API compatible function.
 * @param {?object} options.secret FaunaDB secret.
 * @param {?object} options.queryTimeout FaunaDB query timeout.
 * @returns {Promise} The response promise.
 */
HttpClient.prototype.execute = function(options) {
  options = options || {}

  var invalidStreamConsumer =
    options.streamConsumer &&
    (typeof options.streamConsumer.onData !== 'function' ||
      typeof options.streamConsumer.onError !== 'function')

  if (invalidStreamConsumer) {
    return Promise.reject(new TypeError('Invalid "streamConsumer" provided'))
  }

  var secret = options.secret || this._secret
  var queryTimeout = options.queryTimeout || this._queryTimeout
  var headers = this._headers

  headers['Authorization'] = secret && secretHeader(secret)
  headers['X-Last-Seen-Txn'] = this._lastSeen
  headers['X-Query-Timeout'] = queryTimeout

  return this._adapter.execute({
    origin: this._baseUrl,
    path: options.path || '/',
    query: options.query,
    method: options.method || 'GET',
    headers: util.removeNullAndUndefinedValues(headers),
    body: options.body,
    signal: options.signal,
    timeout: this._timeout,
    streamConsumer: options.streamConsumer,
  })
}

function secretHeader(secret) {
  return 'Bearer ' + secret
}

/** @ignore */
function getDefaultHeaders() {
  var driverEnv = {
    driver: ['javascript', packageJson.version].join('-'),
  }

  var isServiceWorker

  try {
    isServiceWorker = global instanceof ServiceWorkerGlobalScope
  } catch (error) {
    isServiceWorker = false
  }

  try {
    if (util.isNodeEnv()) {
      driverEnv.runtime = ['nodejs', process.version].join('-')
      driverEnv.env = util.getNodeRuntimeEnv()
      var os = require('os')
      driverEnv.os = [os.platform(), os.release()].join('-')
    } else if (isServiceWorker) {
      driverEnv.runtime = 'Service Worker'
    } else {
      driverEnv.runtime = util.getBrowserDetails()
      driverEnv.env = 'browser'
      driverEnv.os = getBrowserOsDetails()
    }
  } catch (_) {}

  var headers = {
    'X-FaunaDB-API-Version': packageJson.apiVersion,
  }

  // TODO: api cors must be enabled to accept header X-Driver-Env
  if (util.isNodeEnv()) {
    headers['X-Driver-Env'] = Object.keys(driverEnv)
      .map(key => [key, driverEnv[key].toLowerCase()].join('='))
      .join('; ')
  }
  return headers
}

function isHttp2Supported() {
  try {
    require('http2')

    return true
  } catch (_) {
    return false
  }
}

module.exports = {
  HttpClient: HttpClient,
  TimeoutError: errors.TimeoutError,
  AbortError: errors.AbortError,
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../package.json":11,"../_util":21,"./errors":16,"./fetchAdapter":17,"./http2Adapter":18,"_process":9,"http2":5,"os":5}],20:[function(require,module,exports){
'use strict'

var values = require('./values')

function toJSON(object, pretty) {
  pretty = typeof pretty !== 'undefined' ? pretty : false

  if (pretty) {
    return JSON.stringify(object, null, '  ')
  } else {
    return JSON.stringify(object)
  }
}

function parseJSON(json) {
  return JSON.parse(json, json_parse)
}

/*
 * Parses a line-separated JSON stream. For backwards compatibility with
 * concatenated JSON objects, it attempts to parse the received content as a
 * JSON object. Failures should occur when partial or multiple line-separated
 * JSON objects are received. Upon a parsing failure, attempt paring the
 * received content as line-separated JSON objects.
 *
 * See https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON
 * See https://en.wikipedia.org/wiki/JSON_streaming#Concatenated_JSON
 *
 * @private
 */
function parseJSONStreaming(content) {
  var values = []

  try {
    values.push(parseJSON(content))
    content = '' // whole content parsed
  } catch (err) {
    while (true) {
      var pos = content.indexOf('\n') + 1 // include \n
      if (pos <= 0) {
        break
      }
      var slice = content.slice(0, pos).trim()
      if (slice.length > 0) {
        // discards empty slices due to leading \n
        values.push(parseJSON(slice))
      }
      content = content.slice(pos)
    }
  }

  return {
    values: values,
    buffer: content,
  }
}

function json_parse(_, val) {
  if (typeof val !== 'object' || val === null) {
    return val
  } else if ('@ref' in val) {
    var ref = val['@ref']

    if (!('collection' in ref) && !('database' in ref)) {
      return values.Native.fromName(ref['id'])
    }

    var col = json_parse('collection', ref['collection'])
    var db = json_parse('database', ref['database'])

    return new values.Ref(ref['id'], col, db)
  } else if ('@obj' in val) {
    return val['@obj']
  } else if ('@set' in val) {
    return new values.SetRef(val['@set'])
  } else if ('@ts' in val) {
    return new values.FaunaTime(val['@ts'])
  } else if ('@date' in val) {
    return new values.FaunaDate(val['@date'])
  } else if ('@bytes' in val) {
    return new values.Bytes(val['@bytes'])
  } else if ('@query' in val) {
    return new values.Query(val['@query'])
  } else {
    return val
  }
}

module.exports = {
  toJSON: toJSON,
  parseJSON: parseJSON,
  parseJSONStreaming: parseJSONStreaming,
}

},{"./values":26}],21:[function(require,module,exports){
(function (process,global){
'use strict'

var packageJson = require('../package.json')
var chalk = require('chalk')
var boxen = require('boxen')

var crossGlobal =
  typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
    ? globalThis
    : typeof global !== 'undefined'
    ? global
    : self

/**
 * Inherit the prototype methods from one constructor into another.
 * Source: https://github.com/kaelzhang/node-util-inherits
 * @param {function} ctor Constructor function which needs to inherit the prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 * @private
 */
function inherits(ctor, superCtor) {
  if (ctor === undefined || ctor === null) {
    throw new TypeError(
      'The constructor to "inherits" must not be null or undefined'
    )
  }

  if (superCtor === undefined || superCtor === null) {
    throw new TypeError(
      'The super constructor to "inherits" must not be null or undefined'
    )
  }

  if (superCtor.prototype === undefined) {
    throw new TypeError(
      'The super constructor to "inherits" must have a prototype'
    )
  }

  ctor.super_ = superCtor
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  })
}

/**
 * Determines if the current environment is a NodeJS environment.
 * @private
 */
function isNodeEnv() {
  return (
    typeof window === 'undefined' &&
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  )
}

/**
 * Resolves environment variable if available.
 *
 * @param {string} envKey A name of env variable.
 * @return {void|string} Returns requested env variable or void.
 * @private
 */
function getEnvVariable(envKey) {
  var areEnvVarsAvailable = !!(
    typeof process !== 'undefined' &&
    process &&
    process.env
  )

  if (areEnvVarsAvailable && process.env[envKey] != null) {
    return process.env[envKey]
  }
}

/**
 * JavaScript Client Detection
 * @private
 */
function getBrowserDetails() {
  var browser = navigator.appName
  var browserVersion = '' + parseFloat(navigator.appVersion)
  var nameOffset, verOffset, ix

  // Opera
  if ((verOffset = navigator.userAgent.indexOf('Opera')) != -1) {
    browser = 'Opera'
    browserVersion = navigator.userAgent.substring(verOffset + 6)
    if ((verOffset = navigator.userAgent.indexOf('Version')) != -1) {
      browserVersion = navigator.userAgent.substring(verOffset + 8)
    }
  }
  // MSIE
  else if ((verOffset = navigator.userAgent.indexOf('MSIE')) != -1) {
    browser = 'Microsoft Internet Explorer'
    browserVersion = navigator.userAgent.substring(verOffset + 5)
  }

  //IE 11 no longer identifies itself as MS IE, so trap it
  //http://stackoverflow.com/questions/17907445/how-to-detect-ie11
  else if (
    browser == 'Netscape' &&
    navigator.userAgent.indexOf('Trident/') != -1
  ) {
    browser = 'Microsoft Internet Explorer'
    browserVersion = navigator.userAgent.substring(verOffset + 5)
    if ((verOffset = navigator.userAgent.indexOf('rv:')) != -1) {
      browserVersion = navigator.userAgent.substring(verOffset + 3)
    }
  }

  // Chrome
  else if ((verOffset = navigator.userAgent.indexOf('Chrome')) != -1) {
    browser = 'Chrome'
    browserVersion = navigator.userAgent.substring(verOffset + 7)
  }
  // Safari
  else if ((verOffset = navigator.userAgent.indexOf('Safari')) != -1) {
    browser = 'Safari'
    browserVersion = navigator.userAgent.substring(verOffset + 7)
    if ((verOffset = navigator.userAgent.indexOf('Version')) != -1) {
      browserVersion = navigator.userAgent.substring(verOffset + 8)
    }

    // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
    //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
    //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
    //  can be keyed on to detect it.
    if (navigator.userAgent.indexOf('CriOS') != -1) {
      //Chrome on iPad spoofing Safari...correct it.
      browser = 'Chrome'
      //Don't believe there is a way to grab the accurate version number, so leaving that for now.
    }
  }
  // Firefox
  else if ((verOffset = navigator.userAgent.indexOf('Firefox')) != -1) {
    browser = 'Firefox'
    browserVersion = navigator.userAgent.substring(verOffset + 8)
  }
  // Other browsers
  else if (
    (nameOffset = navigator.userAgent.lastIndexOf(' ') + 1) <
    (verOffset = navigator.userAgent.lastIndexOf('/'))
  ) {
    browser = navigator.userAgent.substring(nameOffset, verOffset)
    browserVersion = navigator.userAgent.substring(verOffset + 1)
    if (browser.toLowerCase() == browser.toUpperCase()) {
      browser = navigator.appName
    }
  }
  // trim the browser version string
  if ((ix = browserVersion.indexOf(';')) != -1)
    browserVersion = browserVersion.substring(0, ix)
  if ((ix = browserVersion.indexOf(' ')) != -1)
    browserVersion = browserVersion.substring(0, ix)
  if ((ix = browserVersion.indexOf(')')) != -1)
    browserVersion = browserVersion.substring(0, ix)

  return [browser, browserVersion].join('-')
}

function getBrowserOsDetails() {
  var os = 'unknown'
  var clientStrings = [
    { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
    { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
    { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
    { s: 'Windows Vista', r: /Windows NT 6.0/ },
    { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
    { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
    { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
    { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
    { s: 'Windows 98', r: /(Windows 98|Win98)/ },
    { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
    { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: 'Windows CE', r: /Windows CE/ },
    { s: 'Windows 3.11', r: /Win16/ },
    { s: 'Android', r: /Android/ },
    { s: 'Open BSD', r: /OpenBSD/ },
    { s: 'Sun OS', r: /SunOS/ },
    { s: 'Chrome OS', r: /CrOS/ },
    { s: 'Linux', r: /(Linux|X11(?!.*CrOS))/ },
    { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
    { s: 'Mac OS X', r: /Mac OS X/ },
    { s: 'Mac OS', r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: 'QNX', r: /QNX/ },
    { s: 'UNIX', r: /UNIX/ },
    { s: 'BeOS', r: /BeOS/ },
    { s: 'OS/2', r: /OS\/2/ },
    {
      s: 'Search Bot',
      r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/,
    },
  ]
  for (var id in clientStrings) {
    var cs = clientStrings[id]
    if (cs.r.test(navigator.userAgent)) {
      os = cs.s
      break
    }
  }

  var osVersion = 'unknown'

  if (/Windows/.test(os)) {
    osVersion = /Windows (.*)/.exec(os)[1]
    os = 'Windows'
  }

  switch (os) {
    case 'Mac OS':
    case 'Mac OS X':
    case 'Android':
      osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(
        navigator.userAgent
      )[1]
      break

    case 'iOS':
      osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(navigator.appVersion)
      osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0)
      break
  }
  return [os, osVersion].join('-')
}

/**
 * For checking process.env always use `hasOwnProperty`
 * Some providers could throw an error when trying to access env variables that does not exists
 * @private */
function getNodeRuntimeEnv() {
  var runtimeEnvs = [
    {
      name: 'Netlify',
      check: () => process.env.hasOwnProperty('NETLIFY_IMAGES_CDN_DOMAIN'),
    },
    {
      name: 'Vercel',
      check: () => process.env.hasOwnProperty('VERCEL'),
    },
    {
      name: 'Heroku',
      check: () =>
        process.env.hasOwnProperty('PATH') &&
        process.env.PATH.indexOf('.heroku') !== -1,
    },
    {
      name: 'AWS Lambda',
      check: () => process.env.hasOwnProperty('AWS_LAMBDA_FUNCTION_VERSION'),
    },
    {
      name: 'GCP Cloud Functions',
      check: () =>
        process.env.hasOwnProperty('_') &&
        process.env._.indexOf('google') !== -1,
    },
    {
      name: 'GCP Compute Instances',
      check: () => process.env.hasOwnProperty('GOOGLE_CLOUD_PROJECT'),
    },
    {
      name: 'Azure Cloud Functions',
      check: () =>
        process.env.hasOwnProperty('WEBSITE_FUNCTIONS_AZUREMONITOR_CATEGORIES'),
    },
    {
      name: 'Azure Compute',
      check: () =>
        process.env.hasOwnProperty('ORYX_ENV_TYPE') &&
        process.env.hasOwnProperty('WEBSITE_INSTANCE_ID') &&
        process.env.ORYX_ENV_TYPE === 'AppService',
    },
    {
      name: 'Mongo Stitch',
      check: () => typeof crossGlobal.StitchError === 'function',
    },
    {
      name: 'Render',
      check: () => process.env.hasOwnProperty('RENDER_SERVICE_ID'),
    },
    {
      name: 'Begin',
      check: () => process.env.hasOwnProperty('BEGIN_DATA_SCOPE_ID'),
    },
  ]
  var detectedEnv = runtimeEnvs.find(env => env.check())

  return detectedEnv ? detectedEnv.name : 'unknown'
}

/**
 * If defined, returns the given value. Otherwise, returns the default value.
 * @param {any} obj The given value.
 * @param {any} def The default value.
 * @private
 */
function defaults(obj, def) {
  if (obj === undefined) {
    return def
  } else {
    return obj
  }
}

/**
 * Used for functions that take an options objects.
 * Fills in defaults for options not provided.
 * Throws errors for provided options that aren't recognized.
 * A default value of `undefined` is used to indicate that the option must be provided.
 * @private
 */
function applyDefaults(provided, defaults) {
  var out = {}

  for (var providedKey in provided) {
    if (!(providedKey in defaults)) {
      throw new Error('No such option ' + providedKey)
    }
    out[providedKey] = provided[providedKey]
  }

  for (var defaultsKey in defaults) {
    if (!(defaultsKey in out)) {
      out[defaultsKey] = defaults[defaultsKey]
    }
  }

  return out
}

/**
 * Returns a new object without any keys where the value would be null or undefined.
 * @private
 * */
function removeNullAndUndefinedValues(object) {
  var res = {}
  for (var key in object) {
    var val = object[key]
    if (val !== null && val !== undefined) {
      res[key] = val
    }
  }
  return res
}

/**
 * Returns a new object without any keys where the value would be undefined.
 * @private
 * */
function removeUndefinedValues(object) {
  var res = {}
  for (var key in object) {
    var val = object[key]
    if (val !== undefined) {
      res[key] = val
    }
  }
  return res
}

/**
 * Returns a boolean stating if the given object has a given property
 * @private
 * */
function checkInstanceHasProperty(obj, prop) {
  return typeof obj === 'object' && obj !== null && Boolean(obj[prop])
}

function formatUrl(base, path, query) {
  query = typeof query === 'object' ? querystringify(query) : query
  return [
    base,
    path ? (path.charAt(0) === '/' ? '' : '/' + path) : '',
    query ? (query.charAt(0) === '?' ? '' : '?' + query) : '',
  ].join('')
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || ''

  var pairs = [],
    value,
    key

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?'

  for (key in obj) {
    if (checkInstanceHasProperty(obj, key)) {
      value = obj[key]

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undefined || isNaN(value))) {
        value = ''
      }

      key = encode(key)
      value = encode(value)

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue
      pairs.push(key + '=' + value)
    }
  }

  return pairs.length ? prefix + pairs.join('&') : ''
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input)
  } catch (e) {
    return null
  }
}

/**
 * Merge two objects into one
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function mergeObjects(obj1, obj2) {
  var obj3 = {}
  for (var attrname in obj1) {
    obj3[attrname] = obj1[attrname]
  }
  for (var attrname in obj2) {
    obj3[attrname] = obj2[attrname]
  }
  return obj3
}

/**
 * Resolves which Fetch API compatible function to use. If an override is
 * provided, returns the override. If no override and the global (window) has
 * "fetch" property, return the native fetch. Otherwise returns the cross-fetch polyfill.
 *
 * @param {?function} fetchOverride An Fetch API compatible function to use.
 * @returns {function} A Fetch API compatible function.
 * @private
 */
function resolveFetch(fetchOverride) {
  if (typeof fetchOverride === 'function') {
    return fetchOverride
  }

  if (typeof crossGlobal.fetch === 'function') {
    // NB. Rebinding to global is needed for Safari
    return crossGlobal.fetch.bind(crossGlobal)
  }

  return require('cross-fetch')
}

function notifyAboutNewVersion() {
  if (!isNodeEnv()) return
  function checkAndNotify(latestVersion) {
    var latest = latestVersion.split('.')
    var current = packageJson.version.split('.')

    var isNewVersionAvailable = latest.some(function(l, index) {
      return l > current[index]
    })

    if (isNewVersionAvailable) {
      console.info(
        boxen(
          'New ' +
            packageJson.name +
            ' version available ' +
            chalk.dim(packageJson.version) +
            chalk.reset(' → ') +
            chalk.green(latestVersion) +
            `\nChangelog: https://github.com/${packageJson.repository}/blob/master/CHANGELOG.md`,
          { padding: 1, borderColor: 'yellow' }
        )
      )
    }
  }

  resolveFetch()('https://registry.npmjs.org/' + packageJson.name)
    .then(resp => resp.json())
    .then(json => checkAndNotify(json['dist-tags'].latest))
    .catch(err => {
      console.error('Unable to check new driver version')
      console.error(err)
    })
}

notifyAboutNewVersion()

module.exports = {
  crossGlobal: crossGlobal,
  mergeObjects: mergeObjects,
  formatUrl: formatUrl,
  querystringify: querystringify,
  inherits: inherits,
  isNodeEnv: isNodeEnv,
  getEnvVariable: getEnvVariable,
  defaults: defaults,
  applyDefaults: applyDefaults,
  removeNullAndUndefinedValues: removeNullAndUndefinedValues,
  removeUndefinedValues: removeUndefinedValues,
  checkInstanceHasProperty: checkInstanceHasProperty,
  getBrowserDetails: getBrowserDetails,
  getBrowserOsDetails: getBrowserOsDetails,
  getNodeRuntimeEnv: getNodeRuntimeEnv,
  resolveFetch: resolveFetch,
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../package.json":11,"_process":9,"boxen":5,"chalk":5,"cross-fetch":6}],22:[function(require,module,exports){
'use strict'

var json = require('./_json')

/**
 * Functions to assist with debug logging.
 * @module clientLogger
 */

/**
 * A user provided log line handler.
 *
 * @callback loggerCallback
 * @param {string} logged
 */

/**
 * Function that can be the `observer` for a {@link Client}.
 * Will call `loggerFunction` with a string representation of each {@link RequestResult}.
 *
 * An example logging string:
 * ```plain
 * Fauna POST /
 * Request JSON: {
 *   "data": ...
 * }
 * Response headers: {
 *    "x-faunadb-host": ...,
 *    "x-faunadb-build": ...,
 *    "connection": "close",
 *    "content-length": ...,
 *    "content-type": "application/json;charset=utf-8"
 *  }
 * Response JSON: {
 *    "resource": {
 *      "ref": { ... },
 *      "class": { ... },
 *      "ts": ...
 *    }
 *  }
 * Response (201): Network latency 13ms
 * ```
 *
 * @param {loggerCallback} loggerFunction
 * @return {Client~observerCallback}
 * @example
 * var client = new Client({
 *   ... other options ...
 *   observer: logger(console.log)
 * })
 * client.ping() // Logs the request and response.
 */
function logger(loggerFunction) {
  return function(requestResult, client) {
    return loggerFunction(showRequestResult(requestResult), client)
  }
}

/**
 * Convenience function used by {@link logger} to transform a {@link RequestResult}
 * to a string for logging.
 * @param {RequestResult} requestResult
 * @returns {string} string to be logged.
 */
function showRequestResult(requestResult) {
  var query = requestResult.query,
    method = requestResult.method,
    path = requestResult.path,
    requestContent = requestResult.requestContent,
    responseHeaders = requestResult.responseHeaders,
    responseContent = requestResult.responseContent,
    statusCode = requestResult.statusCode,
    timeTaken = requestResult.timeTaken

  var out = ''

  function log(str) {
    out = out + str
  }

  log('Fauna ' + method + ' /' + path + _queryString(query) + '\n')
  if (requestContent != null) {
    log('  Request JSON: ' + _showJSON(requestContent) + '\n')
  }
  log('  Response headers: ' + _showJSON(responseHeaders) + '\n')
  log('  Response JSON: ' + _showJSON(responseContent) + '\n')
  log('  Response (' + statusCode + '): Network latency ' + timeTaken + 'ms\n')

  return out
}

function _indent(str) {
  var indentStr = '  '
  return str.split('\n').join('\n' + indentStr)
}

function _showJSON(object) {
  return _indent(json.toJSON(object, true))
}

function _queryString(query) {
  if (query == null) {
    return ''
  }

  var keys = Object.keys(query)
  if (keys.length === 0) {
    return ''
  }

  var pairs = keys.map(function(key) {
    return key + '=' + query[key]
  })
  return '?' + pairs.join('&')
}

module.exports = {
  logger: logger,
  showRequestResult: showRequestResult,
}

},{"./_json":20}],23:[function(require,module,exports){
'use strict'

var util = require('./_util')

/**
 * FaunaDB error types. Request errors can originate from the client (e.g. bad
 * method parameters) or from the FaunaDB Server (e.g. invalid queries,
 * timeouts.) Server errors will subclass {@link module:errors~FaunaHTTPError}.
 * Stream errors will subclass {@link module:errors~StreamError}.
 *
 * @module errors
 */

/**
 * The base exception type for all FaunaDB errors.
 *
 * @param {string} message
 * @extends Error
 * @constructor
 */
function FaunaError(name, message, description) {
  Error.call(this)

  /**
   * Name of this exception.
   * @type {string}
   */
  this.name = name

  /**
   * Message for this exception.
   * @type {string}
   */
  this.message = message

  /**
   * Description for this exception.
   * @type {string}
   */
  this.description = description
}

util.inherits(FaunaError, Error)

/**
 * Exception thrown by this client library when an invalid
 * value is provided as a function argument.
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function InvalidValue(message) {
  FaunaError.call(this, 'InvalidValue', message)
}

util.inherits(InvalidValue, FaunaError)

/**
 * Exception thrown by this client library when an invalid
 * value is provided as a function argument.
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function InvalidArity(min, max, actual, callerFunc) {
  var arityInfo = `${callerFunc} function requires ${messageForArity(
    min,
    max
  )} argument(s) but ${actual} were given`
  var documentationLink = logDocumentationLink(callerFunc)

  FaunaError.call(this, 'InvalidArity', `${arityInfo}\n${documentationLink}`)

  /**
   * Minimum number of arguments.
   * @type {number}
   */
  this.min = min

  /**
   * Maximum number of arguments.
   * @type {number}
   */
  this.max = max

  /**
   * Actual number of arguments called with.
   * @type {number}
   */
  this.actual = actual

  function messageForArity(min, max) {
    if (max === null) return 'at least ' + min
    if (min === null) return 'up to ' + max
    if (min === max) return min
    return 'from ' + min + ' to ' + max
  }

  function logDocumentationLink(functionName) {
    var docsURL = 'https://docs.fauna.com/fauna/current/api/fql/functions/'
    return `For more info, see the docs: ${docsURL}${functionName.toLowerCase()}`
  }
}

util.inherits(InvalidArity, FaunaError)

/**
 * Base exception type for errors returned by the FaunaDB server.
 *
 * @param {RequestResult} requestResult
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function FaunaHTTPError(name, requestResult) {
  var response = requestResult.responseContent
  var errors = response.errors
  var message = errors.length === 0 ? '(empty "errors")' : errors[0].code
  var description =
    errors.length === 0 ? '(empty "errors")' : errors[0].description
  FaunaError.call(this, name, message, description)

  /**
   * A wrapped {@link RequestResult} object, containing the request and response
   * context of the failed request.
   *
   * @type {RequestResult}
   */
  this.requestResult = requestResult
}

util.inherits(FaunaHTTPError, FaunaError)

/**
 * Convenience method to return the errors from the response object.
 *
 * @returns {Object}
 */
FaunaHTTPError.prototype.errors = function() {
  return this.requestResult.responseContent.errors
}

/**
 * Takes a {@link RequestResult} and throws an appropriate exception if
 * it contains a failed request.
 *
 * @param requestResult {RequestResult}
 */
FaunaHTTPError.raiseForStatusCode = function(requestResult) {
  var code = requestResult.statusCode
  if (code < 200 || code >= 300) {
    switch (code) {
      case 400:
        throw new BadRequest(requestResult)
      case 401:
        throw new Unauthorized(requestResult)
      case 403:
        throw new PermissionDenied(requestResult)
      case 404:
        throw new NotFound(requestResult)
      case 405:
        throw new MethodNotAllowed(requestResult)
      case 429:
        throw new TooManyRequests(requestResult)
      case 500:
        throw new InternalError(requestResult)
      case 503:
        throw new UnavailableError(requestResult)
      default:
        throw new FaunaHTTPError('UnknownError', requestResult)
    }
  }
}

/**
 * A HTTP 400 error.
 *
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function BadRequest(requestResult) {
  FaunaHTTPError.call(this, 'BadRequest', requestResult)
}

util.inherits(BadRequest, FaunaHTTPError)

/**
 * A HTTP 401 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function Unauthorized(requestResult) {
  FaunaHTTPError.call(this, 'Unauthorized', requestResult)
}

util.inherits(Unauthorized, FaunaHTTPError)

/**
 * A HTTP 403 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function PermissionDenied(requestResult) {
  FaunaHTTPError.call(this, 'PermissionDenied', requestResult)
}

util.inherits(PermissionDenied, FaunaHTTPError)

/**
 * A HTTP 404 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function NotFound(requestResult) {
  FaunaHTTPError.call(this, 'NotFound', requestResult)
}

util.inherits(NotFound, FaunaHTTPError)

/**
 * A HTTP 405 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function MethodNotAllowed(requestResult) {
  FaunaHTTPError.call(this, 'MethodNotAllowed', requestResult)
}

util.inherits(MethodNotAllowed, FaunaHTTPError)

/**
 * A HTTP 429 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function TooManyRequests(requestResult) {
  FaunaHTTPError.call(this, 'TooManyRequests', requestResult)
}

util.inherits(TooManyRequests, FaunaHTTPError)

/**
 * A HTTP 500 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function InternalError(requestResult) {
  FaunaHTTPError.call(this, 'InternalError', requestResult)
}

util.inherits(InternalError, FaunaHTTPError)

/**
 * A HTTP 503 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function UnavailableError(requestResult) {
  FaunaHTTPError.call(this, 'UnavailableError', requestResult)
}

util.inherits(UnavailableError, FaunaHTTPError)

/**
 * The base exception type for all stream related errors.
 *
 * @constructor
 * @param {string} name The error class name.
 * @param {string} message The error message.
 * @param {string} description The error detailed description.
 * @extends module:errors~FaunaError
 */
function StreamError(name, message, description) {
  FaunaError.call(this, name, message, description)
}

util.inherits(StreamError, FaunaError)

/**
 * An error thrown by the client when streams are not supported by the current
 * platform.
 *
 * @constructor
 * @param {string} description The error description.
 * @extends module:errors~StreamError
 */
function StreamsNotSupported(description) {
  FaunaError.call(
    this,
    'StreamsNotSupported',
    'streams not supported',
    description
  )
}

util.inherits(StreamsNotSupported, StreamError)

/**
 * An Error thrown by the server when something wrong happened with the
 * subscribed stream.
 * @constructor
 * @param {Object} event The error event.
 * @property {Object} event The error event.
 * @extends module:errors~StreamError
 */
function StreamErrorEvent(event) {
  var error = event.data || {}
  FaunaError.call(this, 'StreamErrorEvent', error.code, error.description)
  this.event = event
}

util.inherits(StreamErrorEvent, StreamError)

/**
 * An error thrown when attempting to operate on a closed Client instance.
 *
 * @param {string} message The error message.
 * @param {?string} description The error description.
 * @extends module:errors~FaunaError
 * @constructor
 */
function ClientClosed(message, description) {
  FaunaError.call(this, 'ClientClosed', message, description)
}

util.inherits(ClientClosed, FaunaError)

module.exports = {
  FaunaError: FaunaError,
  ClientClosed: ClientClosed,
  FaunaHTTPError: FaunaHTTPError,
  InvalidValue: InvalidValue,
  InvalidArity: InvalidArity,
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  PermissionDenied: PermissionDenied,
  NotFound: NotFound,
  MethodNotAllowed: MethodNotAllowed,
  TooManyRequests: TooManyRequests,
  InternalError: InternalError,
  UnavailableError: UnavailableError,
  StreamError: StreamError,
  StreamsNotSupported: StreamsNotSupported,
  StreamErrorEvent: StreamErrorEvent,
}

},{"./_util":21}],24:[function(require,module,exports){
'use strict'

var annotate = require('fn-annotate')
var deprecate = require('util-deprecate')
var Expr = require('./Expr')
var errors = require('./errors')
var values = require('./values')
var objectAssign = require('object-assign')
var util = require('./_util')

/**
 * This module contains functions used to construct FaunaDB Queries.
 *
 * See the [FaunaDB Query API Documentation](https://app.fauna.com/documentation/reference/queryapi)
 * for per-function documentation.
 *
 * @module query
 */

/**
 * @typedef {(Expr|string|number|boolean|Object)} module:query~ExprTerm
 */

/**
 * @typedef {(module:query~ExprTerm|Array<module:query~ExprTerm>)} module:query~ExprArg
 */

// Type helpers

/**
 * If one parameter is provided, constructs a literal Ref value.
 * The string `collections/widget/123` will be equivalent to `new values.Ref('123', new values.Ref('widget', values.Native.COLLECTIONS))`
 *
 * If two are provided, constructs a Ref() function that, when evaluated, returns a Ref value.
 *
 * @param {string|module:query~ExprArg} ref|cls
 *   Alone, the ref in path form. Combined with `id`, must be a collection ref.
 * @param {module:query~ExprArg} [id]
 *   A numeric id of the given collection.
 * @return {Expr}
 */
function Ref() {
  arity.between(1, 2, arguments, Ref.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ '@ref': wrap(arguments[0]) })
    case 2:
      return new Expr({ ref: wrap(arguments[0]), id: wrap(arguments[1]) })
  }
}

/**
 * @param {Uint8Array|ArrayBuffer|module:query~ExprArg} bytes
 *   A base64 encoded string or a byte array
 * @return {Expr}
 */
function Bytes(bytes) {
  arity.exact(1, arguments, Bytes.name)
  return new values.Bytes(bytes)
}

// Basic forms

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} msg
 *   The message to send back to the client.
 * @return {Expr}
 * */
function Abort(msg) {
  arity.exact(1, arguments, Abort.name)
  return new Expr({ abort: wrap(msg) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} timestamp
 *   An Expr that will evaluate to a Time.
 * @param {module:query~ExprArg} expr
 *   The Expr to run at the given snapshot time.
 * @return {Expr}
 * */
function At(timestamp, expr) {
  arity.exact(2, arguments, At.name)
  return new Expr({ at: wrap(timestamp), expr: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} bindings
 *   A set of bindings to use within the given expression.
 * @param {module:query~ExprArg} in
 *   The expression to run with the given bindings.
 * @return {Expr}
 * */
function Let(vars, expr) {
  arity.exact(2, arguments, Let.name)
  var bindings = []

  if (Array.isArray(vars)) {
    bindings = vars.map(function(item) {
      return wrapValues(item)
    })
  } else {
    bindings = Object.keys(vars)
      .filter(function(k) {
        return vars[k] !== undefined
      })
      .map(function(k) {
        var b = {}
        b[k] = wrap(vars[k])
        return b
      })
  }

  if (typeof expr === 'function') {
    if (Array.isArray(vars)) {
      var expr_vars = []

      vars.forEach(function(item) {
        Object.keys(item).forEach(function(name) {
          expr_vars.push(Var(name))
        })
      })

      expr = expr.apply(null, expr_vars)
    } else {
      expr = expr.apply(
        null,
        Object.keys(vars).map(function(name) {
          return Var(name)
        })
      )
    }
  }

  return new Expr({ let: bindings, in: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} varName
 *   The name of the bound var.
 * @return {Expr}
 * */
function Var(varName) {
  arity.exact(1, arguments, Var.name)
  return new Expr({ var: wrap(varName) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} condition
 *   An expression that returns a boolean.
 * @param {module:query~ExprArg} then
 *   The expression to run if condition is true.
 * @param {module:query~ExprArg} else
 *   The expression to run if the condition is false.
 * @return {Expr}
 * */
function If(condition, then, _else) {
  arity.exact(3, arguments, If.name)
  return new Expr({ if: wrap(condition), then: wrap(then), else: wrap(_else) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {...module:query~ExprArg} args
 *   A series of expressions to run.
 * @return {Expr}
 * */
function Do() {
  arity.min(1, arguments, Do.name)
  var args = argsToArray(arguments)
  return new Expr({ do: wrap(args) })
}

/** See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {...module:query~ExprArg} fields
 *   The object to be escaped.
 * @return {Expr}
 * */
var objectFunction = function(fields) {
  arity.exact(1, arguments, objectFunction.name)
  return new Expr({ object: wrapValues(fields) })
}
/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Directly produces a FaunaDB Lambda expression as described in the FaunaDB reference
 * documentation.
 *
 * @param {module:query~ExprArg} var
 *   The names of the variables to be bound in this lambda expression.
 * @param {module:query~ExprArg} expr
 *   The lambda expression.
 * @return {Expr}
 */

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Takes a Javascript function, and will transform it
 * into the appropriate FaunaDB query. For example:
 *
 * ```
 * Lambda(function(a) { return Add(a, a); });
 * // Returns { lambda: 'a', expr: { add: [{ var: a }, { var: a }] } }
 * ```
 * Note that the driver will handle wrapping all usages of the lambda's bound
 * variables with the {@link modules:query~Var} function.
 *
 * @param {function} func
 *   Takes the provided function and produces the appropriate FaunaDB query expression.
 * @return {Expr}
 *
 */ function Lambda() {
  arity.between(1, 2, arguments, Lambda.name)
  switch (arguments.length) {
    case 1:
      var value = arguments[0]
      if (typeof value === 'function') {
        return _lambdaFunc(value)
      } else if (
        value instanceof Expr ||
        util.checkInstanceHasProperty(value, '_isFaunaExpr')
      ) {
        return value
      } else {
        throw new errors.InvalidValue(
          'Lambda function takes either a Function or an Expr.'
        )
      }
    case 2:
      var var_name = arguments[0]
      var expr = arguments[1]

      return _lambdaExpr(var_name, expr)
  }
}

/**
 * @private
 */
function _lambdaFunc(func) {
  var vars = annotate(func)
  switch (vars.length) {
    case 0:
      throw new errors.InvalidValue(
        'Provided Function must take at least 1 argument.'
      )
    case 1:
      return _lambdaExpr(vars[0], func(Var(vars[0])))
    default:
      return _lambdaExpr(
        vars,
        func.apply(
          null,
          vars.map(function(name) {
            return Var(name)
          })
        )
      )
  }
}

/**
 * @private
 */
function _lambdaExpr(var_name, expr) {
  return new Expr({ lambda: wrap(var_name), expr: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Invokes a given function passing in the provided arguments
 *
 * ```
 * Call(Ref("functions/a_function"), 1, 2)
 * ```
 *
 * @param {module:query~ExprArg} ref
 *   The ref of the UserDefinedFunction to call
 * @param {...module:query~ExprArg} args
 *   A series of values to pass as arguments to the UDF.
 * @return {Expr}
 * */
function Call(ref) {
  arity.min(1, arguments, Call.name)
  var args = argsToArray(arguments)
  args.shift()
  return new Expr({ call: wrap(ref), arguments: wrap(varargs(args)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Constructs a `@query` type using the Lambda() or a function.
 *
 * ```
 * Query(Lambda(['a', 'b'], Add(Var('a'), Var('b'))))
 * Query(function (a, b) { return Add(a, b) })
 * ```
 *
 * @param {module:query~ExprArg|function} lambda
 *   A function to escape as a query.
 * @return {Expr}
 * */
function Query(lambda) {
  arity.exact(1, arguments, Query.name)
  return new Expr({ query: wrap(lambda) })
}

// Collection functions

/** See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be mapped over.
 * @param {module:query~ExprArg|function} lambda
 *   A function to be called for each element of the collection.
 * @return {Expr}
 * */
function Map(collection, lambda_expr) {
  arity.exact(2, arguments, Map.name)
  return new Expr({ map: wrap(lambda_expr), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be iterated over.
 * @param {module:query~ExprArg|function} lambda
 *   A function to be called for each element of the collection.
 * @return {Expr}
 * */
function Foreach(collection, lambda_expr) {
  arity.exact(2, arguments, Foreach.name)
  return new Expr({ foreach: wrap(lambda_expr), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be filtered.
 * @param {module:query~ExprArg|function} lambda
 *   A function that returns a boolean used to filter unwanted values.
 * @return {Expr}
 * */
function Filter(collection, lambda_expr) {
  arity.exact(2, arguments, Filter.name)
  return new Expr({ filter: wrap(lambda_expr), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} number
 *   An expression resulting in the number of elements to take from the collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 * */
function Take(number, collection) {
  arity.exact(2, arguments, Take.name)
  return new Expr({ take: wrap(number), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} number
 *   An expression resulting in the number of elements to drop from the collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 * */
function Drop(number, collection) {
  arity.exact(2, arguments, Drop.name)
  return new Expr({ drop: wrap(number), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} elements
 *   An expression resulting in a collection of elements to prepend to the given collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function Prepend(elements, collection) {
  arity.exact(2, arguments, Prepend.name)
  return new Expr({ prepend: wrap(elements), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} elements
 *   An expression resulting in a collection of elements to append to the given collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function Append(elements, collection) {
  arity.exact(2, arguments, Append.name)
  return new Expr({ append: wrap(elements), collection: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function IsEmpty(collection) {
  arity.exact(1, arguments, IsEmpty.name)
  return new Expr({ is_empty: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function IsNonEmpty(collection) {
  arity.exact(1, arguments, IsNonEmpty.name)
  return new Expr({ is_nonempty: wrap(collection) })
}

// Type check functions

/**
 * Check if the expression is a number.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isnumber">IsNumber</a>
 */
function IsNumber(expr) {
  arity.exact(1, arguments, IsNumber.name)
  return new Expr({ is_number: wrap(expr) })
}

/**
 * Check if the expression is a double.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isdouble">IsDouble</a>
 */
function IsDouble(expr) {
  arity.exact(1, arguments, IsDouble.name)
  return new Expr({ is_double: wrap(expr) })
}

/**
 * Check if the expression is an integer.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isinteger">IsInteger</a>
 */
function IsInteger(expr) {
  arity.exact(1, arguments, IsInteger.name)
  return new Expr({ is_integer: wrap(expr) })
}

/**
 * Check if the expression is a boolean.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isboolean">IsBoolean</a>
 */
function IsBoolean(expr) {
  arity.exact(1, arguments, IsBoolean.name)
  return new Expr({ is_boolean: wrap(expr) })
}

/**
 * Check if the expression is null.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isnull">IsNull</a>
 */
function IsNull(expr) {
  arity.exact(1, arguments, IsNull.name)
  return new Expr({ is_null: wrap(expr) })
}

/**
 * Check if the expression is a byte array.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isbytes">IsBytes</a>
 */
function IsBytes(expr) {
  arity.exact(1, arguments, IsBytes.name)
  return new Expr({ is_bytes: wrap(expr) })
}

/**
 * Check if the expression is a timestamp.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/istimestamp">IsTimestamp</a>
 */
function IsTimestamp(expr) {
  arity.exact(1, arguments, IsTimestamp.name)
  return new Expr({ is_timestamp: wrap(expr) })
}

/**
 * Check if the expression is a date.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isdate">IsDate</a>
 */
function IsDate(expr) {
  arity.exact(1, arguments, IsDate.name)
  return new Expr({ is_date: wrap(expr) })
}

/**
 * Check if the expression is a string.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isstring">IsString</a>
 */
function IsString(expr) {
  arity.exact(1, arguments, IsString.name)
  return new Expr({ is_string: wrap(expr) })
}

/**
 * Check if the expression is an array.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isarray">IsArray</a>
 */
function IsArray(expr) {
  arity.exact(1, arguments, IsArray.name)
  return new Expr({ is_array: wrap(expr) })
}

/**
 * Check if the expression is an object.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isobject">IsObject</a>
 */
function IsObject(expr) {
  arity.exact(1, arguments, IsObject.name)
  return new Expr({ is_object: wrap(expr) })
}

/**
 * Check if the expression is a reference.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isref">IsRef</a>
 */
function IsRef(expr) {
  arity.exact(1, arguments, IsRef.name)
  return new Expr({ is_ref: wrap(expr) })
}

/**
 * Check if the expression is a set.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isset">IsSet</a>
 */
function IsSet(expr) {
  arity.exact(1, arguments, IsSet.name)
  return new Expr({ is_set: wrap(expr) })
}

/**
 * Check if the expression is a document (either a reference or an instance).
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isdoc">IsDoc</a>
 */
function IsDoc(expr) {
  arity.exact(1, arguments, IsDoc.name)
  return new Expr({ is_doc: wrap(expr) })
}

/**
 * Check if the expression is a lambda.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/islambda">IsLambda</a>
 */
function IsLambda(expr) {
  arity.exact(1, arguments, IsLambda.name)
  return new Expr({ is_lambda: wrap(expr) })
}

/**
 * Check if the expression is a collection.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/iscollection">IsCollection</a>
 */
function IsCollection(expr) {
  arity.exact(1, arguments, IsCollection.name)
  return new Expr({ is_collection: wrap(expr) })
}

/**
 * Check if the expression is a database.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isdatabase">IsDatabase</a>
 */
function IsDatabase(expr) {
  arity.exact(1, arguments, IsDatabase.name)
  return new Expr({ is_database: wrap(expr) })
}

/**
 * Check if the expression is an index.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isindex">IsIndex</a>
 */
function IsIndex(expr) {
  arity.exact(1, arguments, IsIndex.name)
  return new Expr({ is_index: wrap(expr) })
}

/**
 * Check if the expression is a function.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isfunction">IsFunction</a>
 */
function IsFunction(expr) {
  arity.exact(1, arguments, IsFunction.name)
  return new Expr({ is_function: wrap(expr) })
}

/**
 * Check if the expression is a key.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/iskey">IsKey</a>
 */
function IsKey(expr) {
  arity.exact(1, arguments, IsKey.name)
  return new Expr({ is_key: wrap(expr) })
}

/**
 * Check if the expression is a token.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/istoken">IsToken</a>
 */
function IsToken(expr) {
  arity.exact(1, arguments, IsToken.name)
  return new Expr({ is_token: wrap(expr) })
}

/**
 * Check if the expression is credentials.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/iscredentials">IsCredentials</a>
 */
function IsCredentials(expr) {
  arity.exact(1, arguments, IsCredentials.name)
  return new Expr({ is_credentials: wrap(expr) })
}

/**
 * Check if the expression is a role.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isrole">IsRole</a>
 */
function IsRole(expr) {
  arity.exact(1, arguments, IsRole.name)
  return new Expr({ is_role: wrap(expr) })
}

// Read functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} ref
 *   An expression resulting in either a Ref or SetRef.
 * @param {?module:query~ExprArg} ts
 *   The snapshot time at which to get the document.
 * @return {Expr}
 */
function Get(ref, ts) {
  arity.between(1, 2, arguments, Get.name)
  ts = util.defaults(ts, null)

  return new Expr(params({ get: wrap(ref) }, { ts: wrap(ts) }))
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} secret
 *   The key or token secret to lookup.
 * @return {Expr}
 */
function KeyFromSecret(secret) {
  arity.exact(1, arguments, KeyFromSecret.name)
  return new Expr({ key_from_secret: wrap(secret) })
}

/**
 * See the [docs](https://docs.fauna.com/fauna/current/api/fql/functions/reduce).
 *
 * @param {module:query~ExprArg} lambda
 *   The accumulator function
 * @param {module:query~ExprArg} initial
 *   The initial value
 * @param {module:query~ExprArg} collection
 *   The colleciton to be reduced
 * @return {Expr}
 */
function Reduce(lambda, initial, collection) {
  arity.exact(3, arguments, Reduce.name)
  return new Expr({
    reduce: wrap(lambda),
    initial: wrap(initial),
    collection: wrap(collection),
  })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 * You may want to utilize {@link Client#paginate} to obtain a {@link PageHelper},
 * rather than using this query function directly.
 *
 * @param {module:query~ExprArg} set
 *   An expression resulting in a SetRef to page over.
 * @param {?Object} opts
 *  An object representing options for pagination.
 *    - size: Maximum number of results to return.
 *    - after: Return the next page of results after this cursor (inclusive).
 *    - before: Return the previous page of results before this cursor (exclusive).
 *    - sources: If true, include the source sets along with each element.
 * @return {Expr}
 */
function Paginate(set, opts) {
  arity.between(1, 2, arguments, Paginate.name)
  opts = util.defaults(opts, {})

  return new Expr(objectAssign({ paginate: wrap(set) }, wrapValues(opts)))
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} ref
 *   An expression resulting in a Ref.
 * @param {?module:query~ExprArg} ts
 *   The snapshot time at which to check for the document's existence.
 * @return {Expr}
 */
function Exists(ref, ts) {
  arity.between(1, 2, arguments, Exists.name)
  ts = util.defaults(ts, null)

  return new Expr(params({ exists: wrap(ref) }, { ts: wrap(ts) }))
}

// Write functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref (usually a CollectionRef) to create.
 * @param {?module:query~ExprArg} params
 *   An object representing the parameters of the document.
 * @return {Expr}
 */
function Create(collection_ref, params) {
  arity.between(1, 2, arguments, Create.name)
  return new Expr({ create: wrap(collection_ref), params: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to update.
 * @param {module:query~ExprArg} params
 *   An object representing the parameters of the document.
 * @return {Expr}
 */
function Update(ref, params) {
  arity.exact(2, arguments, Update.name)
  return new Expr({ update: wrap(ref), params: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to replace.
 * @param {module:query~ExprArg} params
 *   An object representing the parameters of the document.
 * @return {Expr}
 */
function Replace(ref, params) {
  arity.exact(2, arguments, Replace.name)
  return new Expr({ replace: wrap(ref), params: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to delete.
 * @return {Expr}
 */
function Delete(ref) {
  arity.exact(1, arguments, Delete.name)
  return new Expr({ delete: wrap(ref) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to insert against
 * @param {module:query~ExprArg} ts
 *   The valid time of the inserted event
 * @param {module:query~ExprArg} action
 *   Whether the event should be a Create, Update, or Delete.
 * @param {module:query~ExprArg} params
 *   If this is a Create or Update, the parameters of the document.
 * @return {Expr}
 */
function Insert(ref, ts, action, params) {
  arity.exact(4, arguments, Insert.name)
  return new Expr({
    insert: wrap(ref),
    ts: wrap(ts),
    action: wrap(action),
    params: wrap(params),
  })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref of the document whose event should be removed.
 * @param {module:query~ExprArg} ts
 *   The valid time of the event.
 * @param {module:query~ExprArg} action
 *   The event action (Create, Update, or Delete) that should be removed.
 * @return {Expr}
 */
function Remove(ref, ts, action) {
  arity.exact(3, arguments, Remove.name)
  return new Expr({ remove: wrap(ref), ts: wrap(ts), action: wrap(action) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a class.
 *     - name (required): the name of the class to create
 * @return {Expr}
 *
 * @deprecated use CreateCollection instead
 */
function CreateClass(params) {
  arity.exact(1, arguments, CreateClass.name)
  return new Expr({ create_class: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a collection.
 *     - name (required): the name of the collection to create
 * @return {Expr}
 */
function CreateCollection(params) {
  arity.exact(1, arguments, CreateCollection.name)
  return new Expr({ create_collection: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a database.
 *     - name (required): the name of the database to create
 * @return {Expr}
 */
function CreateDatabase(params) {
  arity.exact(1, arguments, CreateDatabase.name)
  return new Expr({ create_database: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create an index.
 *     - name (required): the name of the index to create
 *     - source: One or more source objects describing source collections and (optional) field bindings.
 *     - terms: An array of term objects describing the fields to be indexed. Optional
 *     - values: An array of value objects describing the fields to be covered. Optional
 *     - unique: If true, maintains a uniqueness constraint on combined terms and values. Optional
 *     - partitions: The number of sub-partitions within each term. Optional
 * @return {Expr}
 */
function CreateIndex(params) {
  arity.exact(1, arguments, CreateIndex.name)
  return new Expr({ create_index: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a new key
 *     - database: Ref of the database the key will be scoped to. Optional.
 *     - role: The role of the new key
 * @return {Expr}
 */
function CreateKey(params) {
  arity.exact(1, arguments, CreateKey.name)
  return new Expr({ create_key: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a new user defined function.
 *     - name: The name of the function
 *     - body: A lambda function (escaped with `query`).
 * @return {Expr}
 */
function CreateFunction(params) {
  arity.exact(1, arguments, CreateFunction.name)
  return new Expr({ create_function: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a new role.
 *     - name: The name of the role
 *     - privileges: An array of privileges
 *     - membership: An array of membership bindings
 * @return {Expr}
 */
function CreateRole(params) {
  arity.exact(1, arguments, CreateRole.name)
  return new Expr({ create_role: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a new access provider.
 *     - name: A valid schema name
 *     - issuer: A unique string
 *     - jwks_uri: A valid HTTPS URI
 *     - roles: An array of role/predicate pairs where the predicate returns a boolean.
 *                   The array can also contain Role references.
 * @return {Expr}
 */
function CreateAccessProvider(params) {
  arity.exact(1, arguments, CreateAccessProvider.name)
  return new Expr({ create_access_provider: wrap(params) })
}

// Sets

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref of the document for which to retrieve the singleton set.
 * @return {Expr}
 */
function Singleton(ref) {
  arity.exact(1, arguments, Singleton.name)
  return new Expr({ singleton: wrap(ref) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} ref
 *   A Ref or SetRef to retrieve an event set from.
 * @return {Expr}
 */
function Events(ref_set) {
  arity.exact(1, arguments, Events.name)
  return new Expr({ events: wrap(ref_set) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} index
 *   The Ref of the index to match against.
 * @param {...module:query~ExprArg} terms
 *   A list of terms used in the match.
 * @return {Expr}
 */
function Match(index) {
  arity.min(1, arguments, Match.name)
  var args = argsToArray(arguments)
  args.shift()
  return new Expr({ match: wrap(index), terms: wrap(varargs(args)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to union together.
 * @return {Expr}
 */
function Union() {
  arity.min(1, arguments, Union.name)
  return new Expr({ union: wrap(varargs(arguments)) })
}

/**
 * Merge two or more objects..
 *
 * @param {...module:query~ExprArg} merge merge the first object.
 * @param {...module:query~ExprArg} _with the second object or a list of objects
 * @param {...module:query~ExprArg} lambda a lambda to resolve possible conflicts
 * @return {Expr}
 * */
function Merge(merge, _with, lambda) {
  arity.between(2, 3, arguments, Merge.name)
  return new Expr(
    params({ merge: wrap(merge), with: wrap(_with) }, { lambda: wrap(lambda) })
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to intersect.
 * @return {Expr}
 * */
function Intersection() {
  arity.min(1, arguments, Intersection.name)
  return new Expr({ intersection: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to diff.
 * @return {Expr}
 * */
function Difference() {
  arity.min(1, arguments, Difference.name)
  return new Expr({ difference: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} set
 *   A SetRef to remove duplicates from.
 * @return {Expr}
 * */
function Distinct(set) {
  arity.exact(1, arguments, Distinct.name)
  return new Expr({ distinct: wrap(set) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} source
 *   A SetRef of the source set
 * @param {module:query~ExprArg|function} target
 *   A Lambda that will accept each element of the source Set and return a Set
 * @return {Expr}
 */
function Join(source, target) {
  arity.exact(2, arguments, Join.name)
  return new Expr({ join: wrap(source), with: wrap(target) })
}

/**
 * See the [docs](https://docs.fauna.com/fauna/current/api/fql/functions/range).
 *
 * @param {module:query~ExprArg} set
 *   A SetRef of the source set
 * @param {module:query~ExprArg} from
 *   The lower bound
 * @param {module:query~ExprArg} to
 *   The upper bound
 * @return {Expr}
 */
function Range(set, from, to) {
  arity.exact(3, arguments, Range.name)
  return new Expr({ range: wrap(set), from: wrap(from), to: wrap(to) })
}

// Authentication

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} ref
 *   A Ref with credentials to authenticate against
 * @param {module:query~ExprArg} params
 *   An object of parameters to pass to the login function
 *     - password: The password used to login
 * @return {Expr}
 * */
function Login(ref, params) {
  arity.exact(2, arguments, Login.name)
  return new Expr({ login: wrap(ref), params: wrap(params) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} delete_tokens
 *   If true, log out all tokens associated with the current session.
 * @return {Expr}
 */
function Logout(delete_tokens) {
  arity.exact(1, arguments, Logout.name)
  return new Expr({ logout: wrap(delete_tokens) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to check the password against.
 * @param {module:query~ExprArg} password
 *   The credentials password to check.
 * @return {Expr}
 */
function Identify(ref, password) {
  arity.exact(2, arguments, Identify.name)
  return new Expr({ identify: wrap(ref), password: wrap(password) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function Identity() {
  arity.exact(0, arguments, Identity.name)
  return new Expr({ identity: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function CurrentIdentity() {
  arity.exact(0, arguments, CurrentIdentity.name)
  return new Expr({ current_identity: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function HasIdentity() {
  arity.exact(0, arguments, HasIdentity.name)
  return new Expr({ has_identity: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */

function HasCurrentIdentity() {
  arity.exact(0, arguments, HasCurrentIdentity.name)
  return new Expr({ has_current_identity: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function CurrentToken() {
  arity.exact(0, arguments, CurrentToken.name)
  return new Expr({ current_token: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function HasCurrentToken() {
  arity.exact(0, arguments, HasCurrentToken.name)
  return new Expr({ has_current_token: null })
}

// String functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} strings - A list of strings to concatenate.
 * @param {string} separator  - The separator to use between each string.
 * @return {string} a single combined string
 */
function Concat(strings, separator) {
  arity.min(1, arguments, Concat.name)
  separator = util.defaults(separator, null)
  return new Expr(
    params({ concat: wrap(strings) }, { separator: wrap(separator) })
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} string - The string to casefold.
 * @param {string} normalizer - The algorithm to use. One of: NFKCCaseFold, NFC, NFD, NFKC, NFKD.
 * @return {string} a normalized string
 */
function Casefold(string, normalizer) {
  arity.min(1, arguments, Casefold.name)
  return new Expr(
    params({ casefold: wrap(string) }, { normalizer: wrap(normalizer) })
  )
}

/**
 * Returns true if the string contains the given substring, or false if otherwise
 *
 * @param {string} value  - the string to evaluate
 * @param {string} search - the substring to search for
 * @return {boolean}      - was the search result found
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/containsstr">FaunaDB ContainsStr Function</a>
 */
function ContainsStr(value, search) {
  arity.exact(2, arguments, ContainsStr.name)
  return new Expr({ containsstr: wrap(value), search: wrap(search) })
}

/**
 * Returns true if the string contains the given pattern, or false if otherwise
 *
 * @param {string} value   - the string to evaluate
 * @param {string} pattern - the pattern to search for
 * @return {boolean}       - was the regex search result found
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/containsstrregex">FaunaDB ContainsStrRegex Function</a>
 */
function ContainsStrRegex(value, pattern) {
  arity.exact(2, arguments, ContainsStrRegex.name)
  return new Expr({ containsstrregex: wrap(value), pattern: wrap(pattern) })
}

/**
 * Returns true if the string starts with the given prefix value, or false if otherwise
 *
 * @param {string} value   - the string to evaluate
 * @param {string} search  - the prefix to search for
 * @return {boolean}       - does `value` start with `search`
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/startswith">FaunaDB StartsWith Function</a>
 */
function StartsWith(value, search) {
  arity.exact(2, arguments, StartsWith.name)
  return new Expr({ startswith: wrap(value), search: wrap(search) })
}

/**
 * Returns true if the string ends with the given suffix value, or false if otherwise
 *
 * @param {string} value   - the string to evaluate
 * @param {string} search  - the suffix to search for
 * @return {boolean}       - does `value` end with `search`
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/endswith">FaunaDB EndsWith Function</a>
 */
function EndsWith(value, search) {
  arity.exact(2, arguments, EndsWith.name)
  return new Expr({ endswith: wrap(value), search: wrap(search) })
}

/**
 * It takes a string and returns a regex which matches the input string verbatim.
 *
 * @param value      - the string to analyze
 * @return {string}  - a regex which matches the input string verbatim
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/regexescape">FaunaDB RegexEscape Function</a>
 */
function RegexEscape(value) {
  arity.exact(1, arguments, RegexEscape.name)
  return new Expr({ regexescape: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} find - Find the first position of this string in the search string
 * @param {int} start - An optional start offset into the search string
 * @return {int} location of the found string or -1 if not found
 */
function FindStr(value, find, start) {
  arity.between(2, 3, arguments, FindStr.name)
  start = util.defaults(start, null)
  return new Expr(
    params({ findstr: wrap(value), find: wrap(find) }, { start: wrap(start) })
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} pattern - Find the first position of this pattern in the search string using a java regular expression syntax
 * @param {int} start - An optional start offset into the search string
 * @param {int} numResults - An optional number of results to return, max 1024
 * @return {Array} an array of object describing where the search pattern was located
 */
function FindStrRegex(value, pattern, start, numResults) {
  arity.between(2, 4, arguments, FindStrRegex.name)
  start = util.defaults(start, null)
  return new Expr(
    params(
      { findstrregex: wrap(value), pattern: wrap(pattern) },
      { start: wrap(start), num_results: wrap(numResults) }
    )
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to calculate the length in codepoints.
 * @return {int} the length of the string in codepoints
 */
function Length(value) {
  arity.exact(1, arguments, Length.name)
  return new Expr({ length: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to LowerCase.
 * @return {string} the string converted to lowercase
 */
function LowerCase(value) {
  arity.exact(1, arguments, LowerCase.name)
  return new Expr({ lowercase: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to trim leading white space.
 * @return {string} the string with leading white space removed
 */
function LTrim(value) {
  arity.exact(1, arguments, LTrim.name)
  return new Expr({ ltrim: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {module:query~ExprArg} terms
 *   A document from which to produce ngrams.
 * @param {?Object} opts
 *   An object of options
 *     - min: The minimum ngram size.
 *     - max: The maximum ngram size.
 * @return {Array|Value}
 */
function NGram(terms, min, max) {
  arity.between(1, 3, arguments, NGram.name)
  min = util.defaults(min, null)
  max = util.defaults(max, null)

  return new Expr(
    params({ ngram: wrap(terms) }, { min: wrap(min), max: wrap(max) })
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to repeat.
 * @param {int} number - The number of times to repeat the string
 * @return {string} a string which was repeated
 */
function Repeat(value, number) {
  arity.between(1, 2, arguments, Repeat.name)
  number = util.defaults(number, null)
  return new Expr(params({ repeat: wrap(value) }, { number: wrap(number) }))
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} find - The string to find in the search string
 * @param {string} replace - The string to replace in the search string
 * @return {String} all the occurrences of find substituted with replace string
 */
function ReplaceStr(value, find, replace) {
  arity.exact(3, arguments, ReplaceStr.name)
  return new Expr({
    replacestr: wrap(value),
    find: wrap(find),
    replace: wrap(replace),
  })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} pattern - The pattern to find in the search string using a java regular expression syntax
 * @param {string} replace - The string to replace in the search string
 * @param {boolean} first - Replace all or just the first
 * @return {string} all the occurrences of find pattern substituted with replace string
 */
function ReplaceStrRegex(value, pattern, replace, first) {
  arity.between(3, 4, arguments, ReplaceStrRegex.name)
  first = util.defaults(first, null)
  return new Expr(
    params(
      {
        replacestrregex: wrap(value),
        pattern: wrap(pattern),
        replace: wrap(replace),
      },
      { first: wrap(first) }
    )
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to remove white space from the end.
 * @return {string} the string with trailing whitespaces removed
 */
function RTrim(value) {
  arity.exact(1, arguments, RTrim.name)
  return new Expr({ rtrim: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {int} num - The string of N Space(s).
 * @return {string} a string with spaces
 */
function Space(num) {
  arity.exact(1, arguments, Space.name)
  return new Expr({ space: wrap(num) })
}
/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value  The string to SubString.
 * @param {int} start  The position the first character of the return string begins at
 * @param {int} length  An optional length, if omitted then returns to the end of string
 * @return {string}
 */
function SubString(value, start, length) {
  arity.between(1, 3, arguments, SubString.name)
  start = util.defaults(start, null)
  length = util.defaults(length, null)
  return new Expr(
    params(
      { substring: wrap(value) },
      { start: wrap(start), length: wrap(length) }
    )
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to TitleCase.
 * @return {string}  A string converted to titlecase
 */
function TitleCase(value) {
  arity.exact(1, arguments, TitleCase.name)
  return new Expr({ titlecase: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to Trim.
 * @return {string} a string with leading and trailing whitespace removed
 */
function Trim(value) {
  arity.exact(1, arguments, Trim.name)
  return new Expr({ trim: wrap(value) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to Uppercase.
 * @return {string} An uppercase string
 */
function UpperCase(value) {
  arity.exact(1, arguments, UpperCase.name)
  return new Expr({ uppercase: wrap(value) })
}

/**
 * Format values into a string.
 *
 * @param  {string}  string string with format specifiers
 * @param  {array}   values list of values to format
 * @return {string}         a string
 */
function Format(string) {
  arity.min(1, arguments, Format.name)
  var args = argsToArray(arguments)
  args.shift()
  return new Expr({ format: wrap(string), values: wrap(varargs(args)) })
}

// Time and date functions
/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} string
 *   A string to converted to a time object.
 * @return {Expr}
 */
function Time(string) {
  arity.exact(1, arguments, Time.name)
  return new Expr({ time: wrap(string) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} number
 *   The number of `unit`s from Epoch
 * @param {module:query~ExprArg} unit
 *   The unit of `number`. One of second, millisecond, microsecond, nanosecond.
 * @return {Expr}
 */
function Epoch(number, unit) {
  arity.exact(2, arguments, Epoch.name)
  return new Expr({ epoch: wrap(number), unit: wrap(unit) })
}

/**
 * See the [docs](https://docs.fauna.com/fauna/current/api/fql/functions/timeadd).
 *
 * Returns a new time or date with the offset in terms of the unit
 * added.
 *
 * @param base the base time or data
 * @param offset the number of units
 * @param unit the unit type
 * @return {Expr}
 */
function TimeAdd(base, offset, unit) {
  arity.exact(3, arguments, TimeAdd.name)
  return new Expr({
    time_add: wrap(base),
    offset: wrap(offset),
    unit: wrap(unit),
  })
}

/**
 * See the [docs](https://docs.fauna.com/fauna/current/api/fql/functions/timesubtract).
 *
 * Returns a new time or date with the offset in terms of the unit
 * subtracted.
 *
 * @param base the base time or data
 * @param offset the number of units
 * @param unit the unit type
 * @return {Expr}
 */
function TimeSubtract(base, offset, unit) {
  arity.exact(3, arguments, TimeSubtract.name)
  return new Expr({
    time_subtract: wrap(base),
    offset: wrap(offset),
    unit: wrap(unit),
  })
}

/**
 * See the [docs](https://docs.fauna.com/fauna/current/api/fql/functions/timediff).
 *
 * Returns the number of intervals in terms of the unit between
 * two times or dates. Both start and finish must be of the same
 * type.
 *
 * @param start the starting time or date, inclusive
 * @param finish the ending time or date, exclusive
 * @param unit the unit type
 * @return {Expr}
 */
function TimeDiff(start, finish, unit) {
  arity.exact(3, arguments, TimeDiff.name)
  return new Expr({
    time_diff: wrap(start),
    other: wrap(finish),
    unit: wrap(unit),
  })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} string
 *   A string to convert to a Date object
 * @return {Expr}
 */
function Date(string) {
  arity.exact(1, arguments, Date.name)
  return new Expr({ date: wrap(string) })
}

/**
 * Returns the current snapshot time.
 *
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/now">Now function</a>
 */
function Now() {
  arity.exact(0, arguments, Now.name)
  return new Expr({ now: wrap(null) })
}

// Miscellaneous functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @deprecated use NewId instead
 * @return {Expr}
 */
function NextId() {
  arity.exact(0, arguments, NextId.name)
  return new Expr({ next_id: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @return {Expr}
 */
function NewId() {
  arity.exact(0, arguments, NewId.name)
  return new Expr({ new_id: null })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the database.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the database's scope.
 * @return {Expr}
 */
function Database(name, scope) {
  arity.between(1, 2, arguments, Database.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ database: wrap(name) })
    case 2:
      return new Expr({ database: wrap(name), scope: wrap(scope) })
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the index.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the index's scope.
 * @return {Expr}
 */
function Index(name, scope) {
  arity.between(1, 2, arguments, Index.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ index: wrap(name) })
    case 2:
      return new Expr({ index: wrap(name), scope: wrap(scope) })
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the class.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the class's scope.
 * @return {Expr}
 *
 * @deprecated Class is deprecated, use Collection instead
 */
function Class(name, scope) {
  arity.between(1, 2, arguments, Class.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ class: wrap(name) })
    case 2:
      return new Expr({ class: wrap(name), scope: wrap(scope) })
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the collection.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the collection's scope.
 * @return {Expr}
 */
function Collection(name, scope) {
  arity.between(1, 2, arguments, Collection.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ collection: wrap(name) })
    case 2:
      return new Expr({ collection: wrap(name), scope: wrap(scope) })
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the user defined function.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the user defined function's scope.
 * @return {Expr}
 */
function FunctionFn(name, scope) {
  arity.between(1, 2, arguments, FunctionFn.name)
  switch (arguments.length) {
    case 1:
      return new Expr({ function: wrap(name) })
    case 2:
      return new Expr({ function: wrap(name), scope: wrap(scope) })
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the role.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the role's scope.
 * @return {Expr}
 */
function Role(name, scope) {
  arity.between(1, 2, arguments, Role.name)
  scope = util.defaults(scope, null)
  return new Expr(params({ role: wrap(name) }, { scope: wrap(scope) }))
}

/**
 *
 * @param {module:query~ExprArg} scope
 *   The Ref of the database set's scope.
 * @return {Expr}
 */
function AccessProviders(scope) {
  arity.max(1, arguments, AccessProviders.name)
  scope = util.defaults(scope, null)
  return new Expr({ access_providers: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `classes` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the class set's scope.
 * @return {Expr}
 */
function Classes(scope) {
  arity.max(1, arguments, Classes.name)
  scope = util.defaults(scope, null)
  return new Expr({ classes: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `collections` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the collection set's scope.
 * @return {Expr}
 */
function Collections(scope) {
  arity.max(1, arguments, Collections.name)
  scope = util.defaults(scope, null)
  return new Expr({ collections: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `databases` functions that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the database set's scope.
 * @return {Expr}
 */
function Databases(scope) {
  arity.max(1, arguments, Databases.name)
  scope = util.defaults(scope, null)
  return new Expr({ databases: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs an `indexes` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the index set's scope.
 * @return {Expr}
 */
function Indexes(scope) {
  arity.max(1, arguments, Indexes.name)
  scope = util.defaults(scope, null)
  return new Expr({ indexes: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `functions` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the user defined function set's scope.
 * @return {Expr}
 */
function Functions(scope) {
  arity.max(1, arguments, Functions.name)
  scope = util.defaults(scope, null)
  return new Expr({ functions: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `roles` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the role set's scope.
 * @return {Expr}
 */
function Roles(scope) {
  arity.max(1, arguments, Roles.name)
  scope = util.defaults(scope, null)
  return new Expr({ roles: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `keys` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the key set's scope.
 * @return {Expr}
 */
function Keys(scope) {
  arity.max(1, arguments, Keys.name)
  scope = util.defaults(scope, null)
  return new Expr({ keys: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `tokens` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the token set's scope.
 * @return {Expr}
 */
function Tokens(scope) {
  arity.max(1, arguments, Tokens.name)
  scope = util.defaults(scope, null)
  return new Expr({ tokens: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `credentials` functions that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the credential set's scope.
 * @return {Expr}
 */
function Credentials(scope) {
  arity.max(1, arguments, Credentials.name)
  scope = util.defaults(scope, null)
  return new Expr({ credentials: wrap(scope) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of expressions to check for equivalence.
 * @return {Expr}
 */
function Equals() {
  arity.min(1, arguments, Equals.name)
  return new Expr({ equals: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to check for the existence of.
 * @param {module:query~ExprArg} in
 *   An object to search against.
 * @return {Expr}
 *
 * @deprecated use ContainsPath instead
 */
function Contains(path, _in) {
  arity.exact(2, arguments, Contains.name)
  return new Expr({ contains: wrap(path), in: wrap(_in) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} value
 *   Represent the value we want to search for.
 * @param {module:query~ExprArg} in
 *   An object we will search for the value passed in.
 * @return {Expr}
 */
function ContainsValue(value, _in) {
  arity.exact(2, arguments, ContainsValue.name)
  return new Expr({ contains_value: wrap(value), in: wrap(_in) })
}

/**
 * @param {string} field
 *   A field name we want to confirm exists.
 * @param {module:query~ExprArg} obj
 *   An object to search against.
 * @return {Expr}
 */
function ContainsField(field, obj) {
  arity.exact(2, arguments, ContainsField.name)
  return new Expr({ contains_field: wrap(field), in: wrap(obj) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to check for the existence of.
 * @param {module:query~ExprArg} in
 *   An object to search against.
 * @return {Expr}
 */
function ContainsPath(path, _in) {
  arity.exact(2, arguments, ContainsPath.name)
  return new Expr({ contains_path: wrap(path), in: wrap(_in) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to pull from an object.
 * @param {module:query~ExprArg} from
 *   The object to select from
 * @param {?module:query~ExprArg} default
 *   A default value if the path does not exist.
 * @return {Expr}
 */
function Select(path, from, _default) {
  arity.between(2, 3, arguments, Select.name)
  var exprObj = { select: wrap(path), from: wrap(from) }
  if (_default !== undefined) {
    exprObj.default = wrap(_default)
  }
  return new Expr(exprObj)
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to pull from an object.
 * @param {module:query~ExprArg} from
 *   The object to select from
 * @return {Expr}
 *
 * @deprecated avoid using
 */
function SelectAll(path, from) {
  arity.exact(2, arguments, SelectAll.name)
  return new Expr({ select_all: wrap(path), from: wrap(from) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to provide the absolute value.
 * @return {Expr}
 */
function Abs(expr) {
  arity.exact(1, arguments, Abs.name)
  return new Expr({ abs: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to sum together.
 * @return {Expr}
 */
function Add() {
  arity.min(1, arguments, Add.name)
  return new Expr({ add: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise and together.
 * @return {Expr}
 */
function BitAnd() {
  arity.min(1, arguments, BitAnd.name)
  return new Expr({ bitand: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to provide the bitwise not.
 * @return {Expr}
 */
function BitNot(expr) {
  arity.exact(1, arguments, BitNot.name)
  return new Expr({ bitnot: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise Or'd together.
 * @return {Expr}
 */
function BitOr() {
  arity.min(1, arguments, BitOr.name)
  return new Expr({ bitor: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise Xor'd together.
 * @return {Expr}
 */
function BitXor() {
  arity.min(1, arguments, BitXor.name)
  return new Expr({ bitxor: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The least integer that is greater than or equal to the number
 * @return {Expr}
 */
function Ceil(expr) {
  arity.exact(1, arguments, Ceil.name)
  return new Expr({ ceil: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the quotient of.
 * @return {Expr}
 */
function Divide() {
  arity.min(1, arguments, Divide.name)
  return new Expr({ divide: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The greatest integer that is less than or equal to the number
 * @return {Expr}
 */
function Floor(expr) {
  arity.exact(1, arguments, Floor.name)
  return new Expr({ floor: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Max() {
  arity.min(1, arguments, Max.name)
  return new Expr({ max: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Min() {
  arity.min(1, arguments, Min.name)
  return new Expr({ min: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the quotient of. The remainder will be returned.
 * @return {Expr}
 */
function Modulo() {
  arity.min(1, arguments, Modulo.name)
  return new Expr({ modulo: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Multiply() {
  arity.min(1, arguments, Multiply.name)
  return new Expr({ multiply: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to round.
 * @param {...module:query~ExprArg} terms
 *   An optional precision
 * @return {Expr}
 */
function Round(value, precision) {
  arity.min(1, arguments, Round.name)
  precision = util.defaults(precision, null)
  return new Expr(
    params({ round: wrap(value) }, { precision: wrap(precision) })
  )
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the difference of.
 * @return {Expr}
 */
function Subtract() {
  arity.min(1, arguments, Subtract.name)
  return new Expr({ subtract: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The sign of the number is returned as positive 1, zero 0 , negative -1
 * @return {Expr}
 */
function Sign(expr) {
  arity.exact(1, arguments, Sign.name)
  return new Expr({ sign: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The square root of the number
 * @return {Expr}
 */
function Sqrt(expr) {
  arity.exact(1, arguments, Sqrt.name)
  return new Expr({ sqrt: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to truncate.
 * @param {...module:query~ExprArg} terms
 *   An optional precision
 * @return {Expr}
 */
function Trunc(value, precision) {
  arity.min(1, arguments, Trunc.name)
  precision = util.defaults(precision, null)
  return new Expr(
    params({ trunc: wrap(value) }, { precision: wrap(precision) })
  )
}

/**
 *
 * Count the number of elements in the collection.
 *
 * @param {array}    - array of items
 * @return {integer} - number of items in the collection
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/count">Count function</a>
 */
function Count(collection) {
  arity.exact(1, arguments, Count.name)
  return new Expr({ count: wrap(collection) })
}

/**
 *
 * Sum the elements in the collection.
 *
 * @param {array} - collection of numbers
 * @return {integer} - total of all numbers in collection
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/sum">Sum function</a>
 */
function Sum(collection) {
  arity.exact(1, arguments, Sum.name)
  return new Expr({ sum: wrap(collection) })
}

/**
 *
 * Returns the mean of all elements in the collection.
 *
 * @param {array} - collection the numbers
 * @return {float} - the mean of all numbers in the collection
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/mean">Mean function</a>
 */
function Mean(collection) {
  arity.exact(1, arguments, Mean.name)
  return new Expr({ mean: wrap(collection) })
}

/**
 *
 * Evaluates to true if any element of the collection is true.
 *
 * @param {array} - collection the collection
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/any">Any function</a>
 */
function Any(collection) {
  arity.exact(1, arguments, Any.name)
  return new Expr({ any: wrap(collection) })
}

/**
 *
 * Evaluates to true if all elements of the collection are true.
 *
 * @param {array} - collection the collection
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/all">All function</a>
 */
function All(collection) {
  arity.exact(1, arguments, All.name)
  return new Expr({ all: wrap(collection) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc cosine of the number
 * @return {Expr}
 */
function Acos(expr) {
  arity.exact(1, arguments, Acos.name)
  return new Expr({ acos: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc sine of the number
 * @return {Expr}
 */
function Asin(expr) {
  arity.exact(1, arguments, Asin.name)
  return new Expr({ asin: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc tangent of the number
 * @return {Expr}
 */
function Atan(expr) {
  arity.exact(1, arguments, Atan.name)
  return new Expr({ atan: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The cosine of a number
 * @return {Expr}
 */
function Cos(expr) {
  arity.exact(1, arguments, Cos.name)
  return new Expr({ cos: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyperbolic cosine of the number
 * @return {Expr}
 */
function Cosh(expr) {
  arity.exact(1, arguments, Cosh.name)
  return new Expr({ cosh: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   Take radians and convert it to degrees 360 degrees = 2 * pi radians
 * @return {Expr}
 */
function Degrees(expr) {
  arity.exact(1, arguments, Degrees.name)
  return new Expr({ degrees: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The e raised to an exponent number
 * @return {Expr}
 */
function Exp(expr) {
  arity.exact(1, arguments, Exp.name)
  return new Expr({ exp: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A side of the right triangle
 * @param {...module:query~ExprArg} terms
 *   The second side of a right triange, defaults to the first side
 * @return {Expr}
 */
function Hypot(value, side) {
  arity.min(1, arguments, Hypot.name)
  side = util.defaults(side, null)
  return new Expr(params({ hypot: wrap(value) }, { b: wrap(side) }))
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The natural log of the number
 * @return {Expr}
 */
function Ln(expr) {
  arity.exact(1, arguments, Ln.name)
  return new Expr({ ln: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The log base 10 of a number
 * @return {Expr}
 */
function Log(expr) {
  arity.exact(1, arguments, Log.name)
  return new Expr({ log: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to raise to the power.
 * @param {...module:query~ExprArg} terms
 *   An optional exponent
 * @return {Expr}
 */
function Pow(value, exponent) {
  arity.min(1, arguments, Pow.name)
  exponent = util.defaults(exponent, null)
  return new Expr(params({ pow: wrap(value) }, { exp: wrap(exponent) }))
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   Take degrees and convert the number to radians 2 * pi = 360 degrees
 * @return {Expr}
 */
function Radians(expr) {
  arity.exact(1, arguments, Radians.name)
  return new Expr({ radians: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The sine of a number
 * @return {Expr}
 */
function Sin(expr) {
  arity.exact(1, arguments, Sin.name)
  return new Expr({ sin: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyperbolic sine of a number
 * @return {Expr}
 */
function Sinh(expr) {
  arity.exact(1, arguments, Sinh.name)
  return new Expr({ sinh: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The Tangent of a number
 * @return {Expr}
 */
function Tan(expr) {
  arity.exact(1, arguments, Tan.name)
  return new Expr({ tan: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyberbolic tangent of a number
 * @return {Expr}
 */
function Tanh(expr) {
  arity.exact(1, arguments, Tanh.name)
  return new Expr({ tanh: wrap(expr) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function LT() {
  arity.min(1, arguments, LT.name)
  return new Expr({ lt: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function LTE() {
  arity.min(1, arguments, LTE.name)
  return new Expr({ lte: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function GT() {
  arity.min(1, arguments, GT.name)
  return new Expr({ gt: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function GTE() {
  arity.min(1, arguments, GTE.name)
  return new Expr({ gte: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection to compute the conjunction of.
 * @return {Expr}
 */
function And() {
  arity.min(1, arguments, And.name)
  return new Expr({ and: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection to compute the disjunction of.
 * @return {Expr}
 */
function Or() {
  arity.min(1, arguments, Or.name)
  return new Expr({ or: wrap(varargs(arguments)) })
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {module:query~ExprArg} boolean
 *   A boolean to produce the negation of.
 * @return {Expr}
 */
function Not(boolean) {
  arity.exact(1, arguments, Not.name)
  return new Expr({ not: wrap(boolean) })
}

/**
 * Converts an expression to a string literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a string.
 * @return {Expr}
 */
function ToString(expr) {
  arity.exact(1, arguments, ToString.name)
  return new Expr({ to_string: wrap(expr) })
}

/**
 * Converts an expression to a number literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a number.
 * @return {Expr}
 */
function ToNumber(expr) {
  arity.exact(1, arguments, ToNumber.name)
  return new Expr({ to_number: wrap(expr) })
}

/**
 * Converts an expression to an Object.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to an Object.
 * @return {Expr}
 */
function ToObject(expr) {
  arity.exact(1, arguments, ToObject.name)
  return new Expr({ to_object: wrap(expr) })
}

/**
 * Converts an expression to an Array.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to an Array.
 * @return {Expr}
 */
function ToArray(expr) {
  arity.exact(1, arguments, ToArray.name)
  return new Expr({ to_array: wrap(expr) })
}

/**
 * Converts an expression to a double value, if possible.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a double.
 * @return {Expr}
 */
function ToDouble(expr) {
  arity.exact(1, arguments, ToDouble.name)
  return new Expr({ to_double: wrap(expr) })
}

/**
 * Converts an expression to an integer value, if possible.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to an integer.
 * @return {Expr}
 */
function ToInteger(expr) {
  arity.exact(1, arguments, ToInteger.name)
  return new Expr({ to_integer: wrap(expr) })
}

/**
 * Converts an expression to a time literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a time.
 * @return {Expr}
 */
function ToTime(expr) {
  arity.exact(1, arguments, ToTime.name)
  return new Expr({ to_time: wrap(expr) })
}

/**
 * Converts an expression evaluating to a time to seconds since epoch.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to seconds numeric value.
 * @return {Expr}
 */
function ToSeconds(expr) {
  arity.exact(1, arguments, ToSeconds.name)
  return new Expr({ to_seconds: wrap(expr) })
}

/**
 * Converts a time expression to milliseconds since the UNIX epoch.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to millisecond numeric value.
 * @return {Expr}
 */
function ToMillis(expr) {
  arity.exact(1, arguments, ToMillis.name)
  return new Expr({ to_millis: wrap(expr) })
}

/**
 * Converts a time expression to microseconds since the UNIX epoch.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to microsecond numeric value.
 * @return {Expr}
 */
function ToMicros(expr) {
  arity.exact(1, arguments, ToMicros.name)
  return new Expr({ to_micros: wrap(expr) })
}

/**
 * Returns a time expression's day of the week following ISO-8601 convention, from 1 (Monday) to 7 (Sunday).
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to day of week.
 * @return {Expr}
 */
function DayOfWeek(expr) {
  arity.exact(1, arguments, DayOfWeek.name)
  return new Expr({ day_of_week: wrap(expr) })
}

/**
 * Returns a time expression's day of the year, from 1 to 365, or 366 in a leap year.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to day of year.
 * @return {Expr}
 */
function DayOfYear(expr) {
  arity.exact(1, arguments, DayOfYear.name)
  return new Expr({ day_of_year: wrap(expr) })
}

/**
 * Returns a time expression's day of the month, from 1 to 31.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to day of month.
 * @return {Expr}
 */
function DayOfMonth(expr) {
  arity.exact(1, arguments, DayOfMonth.name)
  return new Expr({ day_of_month: wrap(expr) })
}

/**
 * Returns a time expression's second of the minute, from 0 to 59.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a hour.
 * @return {Expr}
 */
function Hour(expr) {
  arity.exact(1, arguments, Hour.name)
  return new Expr({ hour: wrap(expr) })
}

/**
 * Returns a time expression's second of the minute, from 0 to 59.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a month.
 * @return {Expr}
 */
function Minute(expr) {
  arity.exact(1, arguments, Minute.name)
  return new Expr({ minute: wrap(expr) })
}

/**
 * Returns a time expression's second of the minute, from 0 to 59.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a month.
 * @return {Expr}
 */
function Second(expr) {
  arity.exact(1, arguments, Second.name)
  return new Expr({ second: wrap(expr) })
}

/**
 * Returns a time expression's month of the year, from 1 to 12.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a month.
 * @return {Expr}
 */
function Month(expr) {
  arity.exact(1, arguments, Month.name)
  return new Expr({ month: wrap(expr) })
}

/**
 * Returns the time expression's year, following the ISO-8601 standard.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a year.
 * @return {Expr}
 */
function Year(expr) {
  arity.exact(1, arguments, Year.name)
  return new Expr({ year: wrap(expr) })
}

/**
 * Converts an expression to a date literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a date.
 * @return {Expr}
 */
function ToDate(expr) {
  arity.exact(1, arguments, ToDate.name)
  return new Expr({ to_date: wrap(expr) })
}

/**
 * Move database to a new hierarchy.
 *
 * @param {string}  from database reference to be moved.
 * @param {string}  to new parent database reference.
 * @return {Expr}   The expression wrapping the provided object.
 * @see <a href="https://app.fauna.com/documentation/reference/queryapi#write-functions">FaunaDB Write Functions</a>
 */
function MoveDatabase(from, to) {
  arity.exact(2, arguments, MoveDatabase.name)
  return new Expr({ move_database: wrap(from), to: wrap(to) })
}

/**
 * Returns a set of all documents in the given collection.
 * A set must be paginated in order to retrieve its values.
 *
 * @param collection a reference to the collection. Type: Ref
 * @return a new {@link Expr} instance
 * @see #Paginate(Expr)
 */
function Documents(collection) {
  arity.exact(1, arguments, Documents.name)
  return new Expr({ documents: wrap(collection) })
}

/**
 *
 * @param {module:query~ExprArg} expr
 *  An expression (i.e. Set, Page, or Array) to reverse
 * @return {Expr}
 */
function Reverse(expr) {
  arity.exact(1, arguments, Reverse.name)
  return new Expr({ reverse: wrap(expr) })
}

/**
 *
 * @param {module:query~ExprArg} name
 * A string representing an AccessProvider's name
 * @return {Expr}
 */
function AccessProvider(name) {
  arity.exact(1, arguments, AccessProvider.name)
  return new Expr({ access_provider: wrap(name) })
}

// Helpers

/**
 * @ignore
 */
function arity(min, max, args, callerFunc) {
  if (
    (min !== null && args.length < min) ||
    (max !== null && args.length > max)
  ) {
    throw new errors.InvalidArity(min, max, args.length, callerFunc)
  }
}

arity.exact = function(n, args, callerFunc) {
  arity(n, n, args, callerFunc)
}
arity.max = function(n, args, callerFunc) {
  arity(null, n, args, callerFunc)
}
arity.min = function(n, args, callerFunc) {
  arity(n, null, args, callerFunc)
}
arity.between = function(min, max, args, callerFunc) {
  arity(min, max, args, callerFunc)
}

/** Adds optional parameters to the query.
 *
 * @ignore
 * */
function params(mainParams, optionalParams) {
  for (var key in optionalParams) {
    var val = optionalParams[key]
    if (val !== null && val !== undefined) {
      mainParams[key] = val
    }
  }
  return mainParams
}

/**
 * Called on rest arguments.
 * This ensures that a single value passed is not put in an array, so
 * `query.add([1, 2])` will work as well as `query.add(1, 2)`.
 *
 * @ignore
 */
function varargs(values) {
  var valuesAsArr = Array.isArray(values)
    ? values
    : Array.prototype.slice.call(values)
  return values.length === 1 ? values[0] : valuesAsArr
}

/**
 * @ignore
 */
function argsToArray(args) {
  var rv = []
  rv.push.apply(rv, args)
  return rv
}

/**
 * Wraps an object as an Expression. This will automatically wrap any bare objects with
 * the appropriate {@link object} escaping.
 * @param {Object} obj
 *  The object to be wrapped as an Expression.
 * @returns {Expr}
 *   The expression wrapping the provided object.
 * @private
 */
function wrap(obj) {
  arity.exact(1, arguments, wrap.name)
  if (obj === null) {
    return null
  } else if (
    obj instanceof Expr ||
    util.checkInstanceHasProperty(obj, '_isFaunaExpr')
  ) {
    return obj
  } else if (typeof obj === 'symbol') {
    return obj.toString().replace(/Symbol\((.*)\)/, function(str, symbol) {
      return symbol
    })
  } else if (typeof obj === 'function') {
    return Lambda(obj)
  } else if (Array.isArray(obj)) {
    return new Expr(
      obj.map(function(elem) {
        return wrap(elem)
      })
    )
  } else if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
    return new values.Bytes(obj)
  } else if (typeof obj === 'object') {
    return new Expr({ object: wrapValues(obj) })
  } else {
    return obj
  }
}

/**
 * Wraps all of the values of a provided Object, while leaving the parent object unwrapped.
 * @param {Object} obj
 *  The object whose values are to be wrapped as Expressions.
 * @returns {Object}
 *  A copy of the provided object, with the values wrapped as Expressions.
 * @private
 */
function wrapValues(obj) {
  if (obj !== null) {
    var rv = {}

    Object.keys(obj).forEach(function(key) {
      rv[key] = wrap(obj[key])
    })

    return rv
  } else {
    return null
  }
}

module.exports = {
  Ref: Ref,
  Bytes: Bytes,
  Abort: Abort,
  At: At,
  Let: Let,
  Var: Var,
  If: If,
  Do: Do,
  Object: objectFunction,
  Lambda: Lambda,
  Call: Call,
  Query: Query,
  Map: Map,
  Foreach: Foreach,
  Filter: Filter,
  Take: Take,
  Drop: Drop,
  Prepend: Prepend,
  Append: Append,
  IsEmpty: IsEmpty,
  IsNonEmpty: IsNonEmpty,
  IsNumber: IsNumber,
  IsDouble: IsDouble,
  IsInteger: IsInteger,
  IsBoolean: IsBoolean,
  IsNull: IsNull,
  IsBytes: IsBytes,
  IsTimestamp: IsTimestamp,
  IsDate: IsDate,
  IsString: IsString,
  IsArray: IsArray,
  IsObject: IsObject,
  IsRef: IsRef,
  IsSet: IsSet,
  IsDoc: IsDoc,
  IsLambda: IsLambda,
  IsCollection: IsCollection,
  IsDatabase: IsDatabase,
  IsIndex: IsIndex,
  IsFunction: IsFunction,
  IsKey: IsKey,
  IsToken: IsToken,
  IsCredentials: IsCredentials,
  IsRole: IsRole,
  Get: Get,
  KeyFromSecret: KeyFromSecret,
  Reduce: Reduce,
  Paginate: Paginate,
  Exists: Exists,
  Create: Create,
  Update: Update,
  Replace: Replace,
  Delete: Delete,
  Insert: Insert,
  Remove: Remove,
  CreateClass: deprecate(
    CreateClass,
    'CreateClass() is deprecated, use CreateCollection() instead'
  ),
  CreateCollection: CreateCollection,
  CreateDatabase: CreateDatabase,
  CreateIndex: CreateIndex,
  CreateKey: CreateKey,
  CreateFunction: CreateFunction,
  CreateRole: CreateRole,
  CreateAccessProvider: CreateAccessProvider,
  Singleton: Singleton,
  Events: Events,
  Match: Match,
  Union: Union,
  Merge: Merge,
  Intersection: Intersection,
  Difference: Difference,
  Distinct: Distinct,
  Join: Join,
  Range: Range,
  Login: Login,
  Logout: Logout,
  Identify: Identify,
  Identity: deprecate(
    Identity,
    'Identity() is deprecated, use CurrentIdentity() instead'
  ),
  CurrentIdentity: CurrentIdentity,
  HasIdentity: deprecate(
    HasIdentity,
    'HasIdentity() is deprecated, use HasCurrentIdentity() instead'
  ),
  HasCurrentIdentity: HasCurrentIdentity,
  CurrentToken: CurrentToken,
  HasCurrentToken: HasCurrentToken,
  Concat: Concat,
  Casefold: Casefold,
  ContainsStr: ContainsStr,
  ContainsStrRegex: ContainsStrRegex,
  StartsWith: StartsWith,
  EndsWith: EndsWith,
  FindStr: FindStr,
  FindStrRegex: FindStrRegex,
  Length: Length,
  LowerCase: LowerCase,
  LTrim: LTrim,
  NGram: NGram,
  Repeat: Repeat,
  ReplaceStr: ReplaceStr,
  ReplaceStrRegex: ReplaceStrRegex,
  RegexEscape: RegexEscape,
  RTrim: RTrim,
  Space: Space,
  SubString: SubString,
  TitleCase: TitleCase,
  Trim: Trim,
  UpperCase: UpperCase,
  Format: Format,
  Time: Time,
  TimeAdd: TimeAdd,
  TimeSubtract: TimeSubtract,
  TimeDiff: TimeDiff,
  Epoch: Epoch,
  Date: Date,
  Now: Now,
  NextId: deprecate(NextId, 'NextId() is deprecated, use NewId() instead'),
  NewId: NewId,
  Database: Database,
  Index: Index,
  Class: deprecate(Class, 'Class() is deprecated, use Collection() instead'),
  Collection: Collection,
  Function: FunctionFn,
  Role: Role,
  AccessProviders: AccessProviders,
  Classes: deprecate(
    Classes,
    'Classes() is deprecated, use Collections() instead'
  ),
  Collections: Collections,
  Databases: Databases,
  Indexes: Indexes,
  Functions: Functions,
  Roles: Roles,
  Keys: Keys,
  Tokens: Tokens,
  Credentials: Credentials,
  Equals: Equals,
  Contains: deprecate(
    Contains,
    'Contains() is deprecated, use ContainsPath() instead'
  ),
  ContainsPath: ContainsPath,
  ContainsField: ContainsField,
  ContainsValue: ContainsValue,
  Select: Select,
  SelectAll: deprecate(SelectAll, 'SelectAll() is deprecated. Avoid use.'),
  Abs: Abs,
  Add: Add,
  BitAnd: BitAnd,
  BitNot: BitNot,
  BitOr: BitOr,
  BitXor: BitXor,
  Ceil: Ceil,
  Divide: Divide,
  Floor: Floor,
  Max: Max,
  Min: Min,
  Modulo: Modulo,
  Multiply: Multiply,
  Round: Round,
  Subtract: Subtract,
  Sign: Sign,
  Sqrt: Sqrt,
  Trunc: Trunc,
  Count: Count,
  Sum: Sum,
  Mean: Mean,
  Any: Any,
  All: All,
  Acos: Acos,
  Asin: Asin,
  Atan: Atan,
  Cos: Cos,
  Cosh: Cosh,
  Degrees: Degrees,
  Exp: Exp,
  Hypot: Hypot,
  Ln: Ln,
  Log: Log,
  Pow: Pow,
  Radians: Radians,
  Sin: Sin,
  Sinh: Sinh,
  Tan: Tan,
  Tanh: Tanh,
  LT: LT,
  LTE: LTE,
  GT: GT,
  GTE: GTE,
  And: And,
  Or: Or,
  Not: Not,
  ToString: ToString,
  ToNumber: ToNumber,
  ToObject: ToObject,
  ToArray: ToArray,
  ToDouble: ToDouble,
  ToInteger: ToInteger,
  ToTime: ToTime,
  ToSeconds: ToSeconds,
  ToMicros: ToMicros,
  ToMillis: ToMillis,
  DayOfMonth: DayOfMonth,
  DayOfWeek: DayOfWeek,
  DayOfYear: DayOfYear,
  Second: Second,
  Minute: Minute,
  Hour: Hour,
  Month: Month,
  Year: Year,
  ToDate: ToDate,
  MoveDatabase: MoveDatabase,
  Documents: Documents,
  Reverse: Reverse,
  AccessProvider: AccessProvider,
  wrap: wrap,
}

},{"./Expr":13,"./_util":21,"./errors":23,"./values":26,"fn-annotate":7,"object-assign":8,"util-deprecate":10}],25:[function(require,module,exports){
'use strict'

/** @module stream */

// NOTE: Although implemented in a separate module, streaming shares internal
// responsibilities with both Client and HTTP interfaces, such as updating last
// seen transaction timestamp. Therefore, this implementation
// sometimes breaks encapsulation and calls internal getters and methods. As a
// general rule: it's okay to call internal methods. You can interpret this
// as calling for a package visible method in languages with fine-grained
// visibility control. However, DO NOT change any internal state from outside of
// its context as it'd most certainly lead to errors.

require('abort-controller/polyfill')
var RequestResult = require('./RequestResult')
var errors = require('./errors')
var json = require('./_json')
var http = require('./_http')
var q = require('./query')
var util = require('./_util')

var DefaultEvents = ['start', 'error', 'version', 'history_rewrite']
var DocumentStreamEvents = DefaultEvents.concat(['snapshot'])

/**
 * The internal stream client interface. This class handles the network side of
 * a stream subscription.
 *
 * @constructor
 * @param {Client} client The FaunaDB client.
 * @param {module:query~ExprArg} expression The FQL expression you are subscribing to.
 * @param {module:stream~Options} options The stream options.
 * @param {function} onEvent The stream event's callback function.
 * @private
 */
function StreamClient(client, expression, options, onEvent) {
  options = util.applyDefaults(options, {
    fields: null,
  })

  this._client = client
  this._onEvent = onEvent
  this._query = q.wrap(expression)
  this._urlParams = options.fields ? { fields: options.fields.join(',') } : null
  this._abort = new AbortController()
  this._state = 'idle'
}

/**
 * Takes a snapshot of the current query. Assumes the subscribed query returns a
 * reference.
 */
StreamClient.prototype.snapshot = function() {
  var self = this
  self._client
    .query(q.Get(self._query))
    .then(function(doc) {
      self._onEvent({
        type: 'snapshot',
        event: doc,
      })
    })
    .catch(function(error) {
      self._onEvent({
        type: 'error',
        event: error,
      })
    })
}

/** Initiates the stream subscription.  */
StreamClient.prototype.subscribe = function() {
  var self = this

  if (self._state === 'idle') {
    self._state = 'open'
  } else {
    throw new Error(
      'Subscription#start should not be called several times, ' +
        'consider instantiating a new stream instead.'
    )
  }

  var body = JSON.stringify(self._query)
  var startTime = Date.now()
  var buffer = ''

  function onResponse(response) {
    var endTime = Date.now()
    var parsed

    try {
      parsed = json.parseJSON(response.body)
    } catch (_) {
      parsed = response.body
    }

    var result = new RequestResult(
      'POST',
      'stream',
      self._urlParams,
      body,
      self._query,
      response.body,
      parsed,
      response.status,
      response.headers,
      startTime,
      endTime
    )

    self._client._handleRequestResult(response, result)
  }

  function onData(data) {
    var result = json.parseJSONStreaming(buffer + data)

    buffer = result.buffer

    result.values.forEach(function(event) {
      if (event.txn !== undefined) {
        self._client.syncLastTxnTime(event.txn)
      }

      if (event.event === 'error') {
        onError(new errors.StreamErrorEvent(event))
      } else {
        self._onEvent(event)
      }
    })
  }

  function onError(error) {
    // AbortError is triggered as result of calling
    // close() on a Subscription. There's no need to relay this event back up.
    if (error instanceof http.AbortError) {
      return
    }

    self._onEvent({
      type: 'error',
      event: error,
    })
  }

  self._client._http
    .execute({
      method: 'POST',
      path: 'stream',
      body: body,
      query: self._urlParams,
      signal: this._abort.signal,
      streamConsumer: {
        onError: onError,
        onData: onData,
      },
    })
    .then(onResponse)
    .catch(onError)
}

/** Closes the stream subscription by aborting its underlying http request. */
StreamClient.prototype.close = function() {
  if (this._state !== 'closed') {
    this._state = 'closed'
    this._abort.abort()
  }
}

/**
 * Event dispatch interface for stream subscription.
 *
 * @constructor
 * @param {string[]} allowedEvents List of allowed events.
 * @private
 */
function EventDispatcher(allowedEvents) {
  this._allowedEvents = allowedEvents
  this._listeners = {}
}

/** Subscribe to an event
 *
 * @param {string} type The event type.
 * @param {module:stream~Subscription~eventCalllback} callback
 *   The event's callback.
 */
EventDispatcher.prototype.on = function(type, callback) {
  if (this._allowedEvents.indexOf(type) === -1) {
    throw new Error('Unknown event type: ' + type)
  }
  if (this._listeners[type] === undefined) {
    this._listeners[type] = []
  }
  this._listeners[type].push(callback)
}

/**
 * Dispatch the given event to the appropriate listeners.
 *
 * @param {Object} event The event.
 */
EventDispatcher.prototype.dispatch = function(event) {
  var listeners = this._listeners[event.type]
  if (!listeners) {
    return
  }

  for (var i = 0; i < listeners.length; i++) {
    listeners[i].call(null, event.event, event)
  }
}

/**
 * Stream's start event. A stream subscription always begins with a start event.
 * Upcoming events are guaranteed to have transaction timestamps equal to or greater than
 * the stream's start timestamp.
 *
 * @event module:stream~Subscription#start
 * @type {object}
 * @property {string} type='start'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {module:number} event
 *   The stream start timestamp.
 */

/**
 * A version event occurs upon any modifications to the current state of the
 * subscribed document.
 *
 * @event module:stream~Subscription#version
 * @type {object}
 * @property {string} type='version'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * A history rewrite event occurs upon any modifications to the history of the
 * subscribed document.
 *
 * @event module:stream~Subscription#history_rewrite
 * @type {object}
 * @property {string} type='history_rewrite'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * A snapshot event. A snapshot event is fired once the `document` stream helper
 * finishes loading the subscribed document's snapshot data. See {@link
 * Client#stream} for more details on the `document` stream helper.
 *
 * @event module:stream~Subscription#snapshot
 * @type {object}
 * @property {string} type='snapshot'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * An error event is fired both for client and server errors that may occur as
 * a result of a subscription.
 *
 * @event module:stream~Subscription#error
 * @type {object}
 * @property {string} type='error'
 *   The event type.
 * @property {?number} txn
 *   The event's transaction timestamp.
 * @property {Error} event
 *   The underlying error.
 */

/**
 * @typedef {Object} Options
 * @property {string[]} [fields=['action', 'document', 'diff', 'prev']]
 *   The fields event fields to opt-in during stream subscription. Possible
 *   options:
 *   * 'action': The action type
 *   * 'document': The document's data
 *   * 'diff': The difference between 'document' and 'prev'
 *   * 'prev': The event's previous data
 */

/**
 * The callback to be executed when an new event occurs.
 *
 * @callback module:stream~Subscription~eventCalllback
 * @param {any} data The event's data field.
 * @param {object} event The event's entire object.
 */

/**
 * A stream subscription which dispatches events received to the registered
 * listener functions. This class must be constructed via {@link Client#stream}
 * method.
 *
 * @constructor
 * @param {StreamClient} client
 *   Internal stream client interface.
 * @param {EventDispatcher} dispatcher
 *   Internal event dispatcher interface.
 */
function Subscription(client, dispatcher) {
  this._client = client
  this._dispatcher = dispatcher
}

/**
 * Subscribes to an event type.
 *
 * @param {string} event
 *   The event's type.
 * @param {module:stream~Subscription~eventCalllback} callback
 *   A callback function.
 *
 * @returns {module:stream~Subscription} This instance.
 */
Subscription.prototype.on = function(type, callback) {
  this._dispatcher.on(type, callback)
  return this
}

/**
 * Initiates the underlying subscription network calls.
 * @returns {module:stream~Subscription} This instance.
 */
Subscription.prototype.start = function() {
  this._client.subscribe()
  return this
}

/**
 * Stops the current subscription and closes the underlying network connection.
 */
Subscription.prototype.close = function() {
  this._client.close()
}

/**
 * Stream API factory function. See {@link Client#stream} for details on how to
 * use stream's public interface.
 * @private
 */
function StreamAPI(client) {
  var api = function(expression, options) {
    var dispatcher = new EventDispatcher(DefaultEvents)
    var streamClient = new StreamClient(client, expression, options, function(
      event
    ) {
      dispatcher.dispatch(event)
    })
    return new Subscription(streamClient, dispatcher)
  }

  api.document = function(expression, options) {
    var buffer = []
    var buffering = true
    var dispatcher = new EventDispatcher(DocumentStreamEvents)
    var streamClient = new StreamClient(client, expression, options, onEvent)

    function onEvent(event) {
      switch (event.type) {
        case 'start':
          dispatcher.dispatch(event)
          streamClient.snapshot()
          break
        case 'snapshot':
          resume(event)
          break
        case 'error':
          dispatcher.dispatch(event)
          break
        default:
          if (buffering) {
            buffer.push(event)
          } else {
            dispatcher.dispatch(event)
          }
      }
    }

    function resume(snapshotEvent) {
      dispatcher.dispatch(snapshotEvent)
      for (var i = 0; i < buffer.length; i++) {
        var bufferedEvent = buffer[i]
        if (bufferedEvent.txn > snapshotEvent.event.ts) {
          dispatcher.dispatch(bufferedEvent)
        }
      }
      buffering = false
      buffer = null
    }

    return new Subscription(streamClient, dispatcher)
  }

  return api
}

module.exports = {
  StreamAPI: StreamAPI,
}

},{"./RequestResult":15,"./_http":19,"./_json":20,"./_util":21,"./errors":23,"./query":24,"abort-controller/polyfill":3}],26:[function(require,module,exports){
'use strict'

var base64 = require('base64-js')
var deprecate = require('util-deprecate')
var errors = require('./errors')
var Expr = require('./Expr')
var util = require('./_util')
var nodeUtil = util.isNodeEnv() ? require('util') : null

var customInspect = nodeUtil && nodeUtil.inspect.custom
var stringify = nodeUtil ? nodeUtil.inspect : JSON.stringify

/**
 * FaunaDB value types. Generally, these collections do not need to be instantiated
 * directly; they can be constructed through helper methods in {@link module:query}.
 *
 * Instances of these collections will be returned in responses if the response object
 * contains these values. For example, a FaunaDB response containing
 *`{ "@ref": { "id": "123", "collection": { "@ref": { "id": "frogs", "collection": { "@ref": { "id": "collectiones" } } } } } }`
 * will be returned as `new values.Ref("123", new values.Ref("frogs", values.Native.COLLECTIONS))`.
 *
 * See the [FaunaDB Query API Documentation](https://app.fauna.com/documentation/reference/queryapi#simple-type)
 * for more information.
 *
 * @module values
 */

/**
 * Base type for FaunaDB value objects.
 *
 * @extends Expr
 * @abstract
 * @constructor
 */
function Value() {}

Value.prototype._isFaunaValue = true

util.inherits(Value, Expr)

/**
 * FaunaDB ref.
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {string} id
 *   The id portion of the ref.
 * @param {Ref} [collection]
 *   The collection portion of the ref.
 * @param {Ref} [database]
 *   The database portion of the ref.
 *
 * @extends module:values~Value
 * @constructor
 */
function Ref(id, collection, database) {
  if (!id) throw new errors.InvalidValue('id cannot be null or undefined')

  this.value = { id: id }
  if (collection) this.value['collection'] = collection
  if (database) this.value['database'] = database
}

Ref.prototype._isFaunaRef = true

util.inherits(Ref, Value)

/**
 * Gets the collection part out of the Ref.
 *
 * @member {string}
 * @name module:values~Ref#collection
 */
Object.defineProperty(Ref.prototype, 'collection', {
  get: function() {
    return this.value['collection']
  },
})

/**
 * DEPRECATED. Gets the class part out of the Ref.
 *
 * @member {string}
 * @name module:values~Ref#class
 */
Object.defineProperty(Ref.prototype, 'class', {
  get: deprecate(function() {
    return this.value['collection']
  }, 'class is deprecated, use collection instead'),
})

/**
 * Gets the database part out of the Ref.
 *
 * @member {Ref}
 * @name module:values~Ref#database
 */
Object.defineProperty(Ref.prototype, 'database', {
  get: function() {
    return this.value['database']
  },
})

/**
 * Gets the id part out of the Ref.
 *
 * @member {Ref}
 * @name module:values~Ref#id
 */
Object.defineProperty(Ref.prototype, 'id', {
  get: function() {
    return this.value['id']
  },
})

/** @ignore */
Ref.prototype.toJSON = function() {
  return { '@ref': this.value }
}

wrapToString(Ref, function() {
  var constructors = {
    collections: 'Collection',
    databases: 'Database',
    indexes: 'Index',
    functions: 'Function',
    roles: 'Role',
    access_providers: 'AccessProvider',
  }

  var isNative = function(ref) {
    return ref.collection === undefined
  }

  var toString = function(ref) {
    if (isNative(ref)) {
      var db = ref.database !== undefined ? ref.database.toString() : ''

      if (ref.id === 'access_providers') return 'AccessProviders(' + db + ')'

      return ref.id.charAt(0).toUpperCase() + ref.id.slice(1) + '(' + db + ')'
    }

    if (isNative(ref.collection)) {
      var constructor = constructors[ref.collection.id]
      if (constructor !== undefined) {
        var db =
          ref.database !== undefined ? ', ' + ref.database.toString() : ''
        return constructor + '("' + ref.id + '"' + db + ')'
      }
    }

    return 'Ref(' + toString(ref.collection) + ', "' + ref.id + '")'
  }

  return toString(this)
})

/** @ignore */
Ref.prototype.valueOf = function() {
  return this.value
}

/**
 * Whether these are both Refs and have the same value.
 * @param {any} other
 * @returns {boolean}
 */
Ref.prototype.equals = function(other) {
  return (
    (other instanceof Ref ||
      util.checkInstanceHasProperty(other, '_isFaunaRef')) &&
    this.id === other.id &&
    ((this.collection === undefined && other.collection === undefined) ||
      this.collection.equals(other.collection)) &&
    ((this.database === undefined && other.database === undefined) ||
      this.database.equals(other.database))
  )
}

var Native = {
  COLLECTIONS: new Ref('collections'),
  INDEXES: new Ref('indexes'),
  DATABASES: new Ref('databases'),
  FUNCTIONS: new Ref('functions'),
  ROLES: new Ref('roles'),
  KEYS: new Ref('keys'),
  ACCESS_PROVIDERS: new Ref('access_providers'),
}

Native.fromName = function(name) {
  switch (name) {
    case 'collections':
      return Native.COLLECTIONS
    case 'indexes':
      return Native.INDEXES
    case 'databases':
      return Native.DATABASES
    case 'functions':
      return Native.FUNCTIONS
    case 'roles':
      return Native.ROLES
    case 'keys':
      return Native.KEYS
    case 'access_providers':
      return Native.ACCESS_PROVIDERS
  }
  return new Ref(name)
}

/**
 * FaunaDB Set.
 * This represents a set returned as part of a response.
 * This looks like `{"@set": set_query}`.
 * For query sets see {@link match}, {@link union},
 * {@link intersection}, {@link difference}, and {@link join}.
 *
 * @extends module:values~Value
 * @constructor
 */
function SetRef(value) {
  /** Raw query object. */
  this.value = value
}

util.inherits(SetRef, Value)

wrapToString(SetRef, function() {
  return Expr.toString(this.value)
})

/** @ignore */
SetRef.prototype.toJSON = function() {
  return { '@set': this.value }
}

/** FaunaDB time. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {string|Date} value If a Date, this is converted to a string.
 * @extends module:values~Value
 * @constructor
 */
function FaunaTime(value) {
  if (value instanceof Date) {
    value = value.toISOString()
  } else if (!(value.charAt(value.length - 1) === 'Z')) {
    throw new errors.InvalidValue("Only allowed timezone is 'Z', got: " + value)
  }

  this.value = value
}

util.inherits(FaunaTime, Value)

/**
 * Returns the date wrapped by this object.
 * This is lossy as Dates have millisecond rather than nanosecond precision.
 *
 * @member {Date}
 * @name module:values~FaunaTime#date
 */
Object.defineProperty(FaunaTime.prototype, 'date', {
  get: function() {
    return new Date(this.value)
  },
})

wrapToString(FaunaTime, function() {
  return 'Time("' + this.value + '")'
})

/** @ignore */
FaunaTime.prototype.toJSON = function() {
  return { '@ts': this.value }
}

/** FaunaDB date. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {string|Date} value
 *   If a Date, this is converted to a string, with time-of-day discarded.
 * @extends module:values~Value
 * @constructor
 */
function FaunaDate(value) {
  if (value instanceof Date) {
    // The first 10 characters 'YYYY-MM-DD' are the date portion.
    value = value.toISOString().slice(0, 10)
  }

  /**
   * ISO8601 date.
   * @type {string}
   */
  this.value = value
}

util.inherits(FaunaDate, Value)

/**
 * @member {Date}
 * @name module:values~FaunaDate#date
 */
Object.defineProperty(FaunaDate.prototype, 'date', {
  get: function() {
    return new Date(this.value)
  },
})

wrapToString(FaunaDate, function() {
  return 'Date("' + this.value + '")'
})

/** @ignore */
FaunaDate.prototype.toJSON = function() {
  return { '@date': this.value }
}

/** FaunaDB bytes. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {Uint8Array|ArrayBuffer|string} value
 *    If ArrayBuffer it's converted to Uint8Array
 *    If string it must be base64 encoded and it's converted to Uint8Array
 * @extends module:values~Value
 * @constructor
 */
function Bytes(value) {
  if (value instanceof ArrayBuffer) {
    this.value = new Uint8Array(value)
  } else if (typeof value === 'string') {
    this.value = base64.toByteArray(value)
  } else if (value instanceof Uint8Array) {
    this.value = value
  } else {
    throw new errors.InvalidValue(
      'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: ' +
        stringify(value)
    )
  }
}

util.inherits(Bytes, Value)

wrapToString(Bytes, function() {
  return 'Bytes("' + base64.fromByteArray(this.value) + '")'
})

/** @ignore */
Bytes.prototype.toJSON = function() {
  return { '@bytes': base64.fromByteArray(this.value) }
}

/** FaunaDB query. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {any} value
 * @extends module:values~Value
 * @constructor
 */
function Query(value) {
  this.value = value
}

util.inherits(Query, Value)

wrapToString(Query, function() {
  return 'Query(' + Expr.toString(this.value) + ')'
})

/** @ignore */
Query.prototype.toJSON = function() {
  return { '@query': this.value }
}

/** @ignore */
function wrapToString(type, fn) {
  type.prototype.toString = fn
  type.prototype.inspect = fn

  if (customInspect) {
    type.prototype[customInspect] = fn
  }
}

module.exports = {
  Value: Value,
  Ref: Ref,
  Native: Native,
  SetRef: SetRef,
  FaunaTime: FaunaTime,
  FaunaDate: FaunaDate,
  Bytes: Bytes,
  Query: Query,
}

},{"./Expr":13,"./_util":21,"./errors":23,"base64-js":4,"util":5,"util-deprecate":10}]},{},[1])(1)
});
