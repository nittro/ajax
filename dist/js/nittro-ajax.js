_context.invoke('Nittro.Ajax', function(undefined) {

    var FormData = _context.extend(function() {
        this._dataStorage = [];
        this._upload = false;

    }, {
        append: function(name, value) {
            if (value === undefined || value === null) {
                return this;

            }

            if (this._isFile(value)) {
                this._upload = true;

            } else if (typeof value === 'object' && 'valueOf' in value && /string|number|boolean/.test(typeof value.valueOf()) && !arguments[2]) {
                return this.append(name, value.valueOf(), true);

            } else if (!/string|number|boolean/.test(typeof value)) {
                throw new Error('Only scalar values and File/Blob objects can be appended to FormData, ' + (typeof value) + ' given');

            }

            this._dataStorage.push({ name: name, value: value });

            return this;

        },

        isUpload: function() {
            return this._upload;

        },

        _isFile: function(value) {
            return window.File !== undefined && value instanceof window.File || window.Blob !== undefined && value instanceof window.Blob;

        },

        mergeData: function(data) {
            for (var i = 0; i < data.length; i++) {
                this.append(data[i].name, data[i].value);

            }

            return this;

        },

        exportData: function(forcePlain) {
            if (!forcePlain && this.isUpload() && window.FormData !== undefined) {
                var fd = new window.FormData(),
                    i;

                for (i = 0; i < this._dataStorage.length; i++) {
                    fd.append(this._dataStorage[i].name, this._dataStorage[i].value);

                }

                return fd;

            } else {
                return this._dataStorage.filter(function(e) {
                    return !this._isFile(e.value);

                }, this);

            }
        }
    });

    _context.register(FormData, 'FormData');

});
;
_context.invoke('Nittro.Ajax', function (Url, FormData, undefined) {

    var Request = _context.extend('Nittro.Object', function(url, method, data) {
        this._ = {
            url: Url.from(url),
            method: (method || 'GET').toUpperCase(),
            data: data || {},
            headers: {},
            normalized: false,
            aborted: false
        };
    }, {
        getUrl: function () {
            this._normalize();
            return this._.url;

        },

        getMethod: function () {
            return this._.method;

        },

        isGet: function () {
            return this._.method === 'GET';

        },

        isPost: function () {
            return this._.method === 'POST';

        },

        isMethod: function (method) {
            return method.toUpperCase() === this._.method;

        },

        getData: function () {
            this._normalize();
            return this._.data;

        },

        getHeaders: function () {
            return this._.headers;

        },

        setUrl: function (url) {
            this._updating('url');
            this._.url = Url.from(url);
            return this;

        },

        setMethod: function (method) {
            this._updating('method');
            this._.method = method.toLowerCase();
            return this;

        },

        setData: function (k, v) {
            this._updating('data');

            if (k === null) {
                this._.data = {};

            } else if (v === undefined && typeof k === 'object') {
                for (v in k) {
                    if (k.hasOwnProperty(v)) {
                        this._.data[v] = k[v];

                    }
                }
            } else {
                this._.data[k] = v;

            }

            return this;

        },

        setHeader: function (header, value) {
            this._updating('headers');
            this._.headers[header] = value;
            return this;

        },

        setHeaders: function (headers) {
            this._updating('headers');

            for (var header in headers) {
                if (headers.hasOwnProperty(header)) {
                    this._.headers[header] = headers[header];

                }
            }

            return this;

        },

        abort: function () {
            if (!this._.aborted) {
                this._.aborted = true;
                this.trigger('abort');

            }

            return this;

        },

        isAborted: function () {
            return this._.aborted;

        },

        _normalize: function() {
            if (this._.normalized || !this.isFrozen()) {
                return;

            }

            this._.normalized = true;

            if (this._.method === 'GET' || this._.method === 'HEAD') {
                this._.url.addParams(this._.data instanceof FormData ? this._.data.exportData(true) : this._.data);
                this._.data = {};

            }
        }
    });

    _context.mixin(Request, 'Nittro.Freezable');
    _context.register(Request, 'Request');

}, {
    Url: 'Utils.Url'
});
;
_context.invoke('Nittro.Ajax', function () {

    var Response = _context.extend(function(status, payload, headers) {
        this._ = {
            status: status,
            payload: payload,
            headers: headers
        };
    }, {
        getStatus: function () {
            return this._.status;

        },

        getPayload: function () {
            return this._.payload;

        },

        getHeader: function (name) {
            return this._.headers[name.toLowerCase()];

        },

        getAllHeaders: function () {
            return this._.headers;

        }
    });

    _context.register(Response, 'Response');

});
;
_context.invoke('Nittro.Ajax', function (Request) {

    var Service = _context.extend('Nittro.Object', function () {
        Service.Super.call(this);

        this._.transports = [];

    }, {
        addTransport: function (transport) {
            this._.transports.push(transport);
            return this;

        },

        'get': function (url, data) {
            return this.dispatch(this.createRequest(url, 'get', data));

        },

        post: function (url, data) {
            return this.dispatch(this.createRequest(url, 'post', data));

        },

        createRequest: function (url, method, data) {
            var request = new Request(url, method, data);
            this.trigger('request-created', {request: request});
            return request;

        },

        dispatch: function (request) {
            request.freeze();

            for (var i = 0; i < this._.transports.length; i++) {
                try {
                    return this._.transports[i].dispatch(request);

                } catch (e) { console.log(e); }
            }

            throw new Error('No transport is able to dispatch this request');

        }
    });

    _context.register(Service, 'Service');

});
;
_context.invoke('Nittro.Ajax.Transport', function (Response, FormData, Url) {

    var Native = _context.extend(function() {

    }, {
        STATIC: {
            createXhr: function () {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();

                } else if (window.ActiveXObject) {
                    try {
                        return new ActiveXObject('Msxml2.XMLHTTP');

                    } catch (e) {
                        return new ActiveXObject('Microsoft.XMLHTTP');

                    }
                }
            }
        },

        dispatch: function (request) {
            var xhr = Native.createXhr(),
                adv = this.checkSupport(xhr),
                self = this;

            var abort = function () {
                xhr.abort();

            };

            var cleanup = function () {
                request.off('abort', abort);

            };

            request.on('abort', abort);

            return new Promise(function (fulfill, reject) {
                if (request.isAborted()) {
                    cleanup();
                    reject(self._createError(xhr, {type: 'abort'}));

                }

                self._bindEvents(request, xhr, adv, cleanup, fulfill, reject);

                xhr.open(request.getMethod(), request.getUrl().toAbsolute(), true);

                var data = self._formatData(request, xhr);
                self._addHeaders(request, xhr);
                xhr.send(data);

            });
        },

        checkSupport: function (xhr) {
            var adv;

            if (!(adv = 'addEventListener' in xhr) && !('onreadystatechange' in xhr)) {
                throw new Error('Unsupported XHR implementation');

            }

            return adv;

        },

        _bindEvents: function (request, xhr, adv, cleanup, fulfill, reject) {
            var self = this;

            var onLoad = function (evt) {
                cleanup();

                if (xhr.status >= 200 && xhr.status < 300) {
                    var response = self._createResponse(xhr);
                    request.trigger('success', response);
                    fulfill(response);

                } else {
                    var err = self._createError(xhr, evt);
                    request.trigger('error', err);
                    reject(err);

                }
            };

            var onError = function (evt) {
                cleanup();
                var err = self._createError(xhr, evt);
                request.trigger('error', err);
                reject(err);

            };

            var onProgress = function (evt) {
                request.trigger('progress', {
                    lengthComputable: evt.lengthComputable,
                    loaded: evt.loaded,
                    total: evt.total
                });
            };

            if (adv) {
                xhr.addEventListener('load', onLoad, false);
                xhr.addEventListener('error', onError, false);
                xhr.addEventListener('abort', onError, false);

                if ('upload' in xhr) {
                    xhr.upload.addEventListener('progress', onProgress, false);

                }
            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            onLoad();

                        } else {
                            onError();

                        }
                    }
                };

                if ('ontimeout' in xhr) {
                    xhr.ontimeout = onError;

                }

                if ('onerror' in xhr) {
                    xhr.onerror = onError;

                }

                if ('onload' in xhr) {
                    xhr.onload = onLoad;

                }
            }
        },

        _addHeaders: function (request, xhr) {
            var headers = request.getHeaders(),
                h;

            for (h in headers) {
                if (headers.hasOwnProperty(h)) {
                    xhr.setRequestHeader(h, headers[h]);

                }
            }

            if (!headers.hasOwnProperty('X-Requested-With')) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            }
        },

        _formatData: function (request, xhr) {
            var data = request.getData();

            if (data instanceof FormData) {
                data = data.exportData(request.isGet() || request.isMethod('HEAD'));

                if (!(data instanceof window.FormData)) {
                    data = Url.buildQuery(data, true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                }
            } else {
                data = Url.buildQuery(data);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            }

            return data;

        },

        _createResponse: function (xhr) {
            var payload,
                headers = {};

            (xhr.getAllResponseHeaders() || '').trim().split(/\r\n/g).forEach(function(header) {
                if (header && !header.match(/^\s+$/)) {
                    header = header.match(/^\s*([^:]+):\s*(.+)\s*$/);
                    headers[header[1].toLowerCase()] = header[2];

                }
            });

            if (headers['content-type'] && headers['content-type'].split(/;/)[0] === 'application/json') {
                payload = JSON.parse(xhr.responseText || '{}');

            } else {
                payload = xhr.responseText;

            }

            return new Response(xhr.status, payload, headers);

        },

        _createError: function (xhr, evt) {
            var response = null;

            if (xhr.readyState === 4 && xhr.status !== 0) {
                response = this._createResponse(xhr);

            }

            if (evt && evt.type === 'abort') {
                return {
                    type: 'abort',
                    status: null,
                    response: response
                };
            } else if (xhr.status === 0) {
                return {
                    type: 'connection',
                    status: null,
                    response: response
                };
            } else if (xhr.status < 200 || xhr.status >= 300) {
                return {
                    type: 'response',
                    status: xhr.status,
                    response: response
                };
            }

            return {
                type: 'unknown',
                status: xhr.status,
                response: response
            };
        }
    });

    _context.register(Native, 'Native');

}, {
    Url: 'Utils.Url',
    Response: 'Nittro.Ajax.Response',
    FormData: 'Nittro.Ajax.FormData'
});
;
_context.invoke('Nittro.Ajax.Bridges', function(Nittro) {

    if (!Nittro.DI) {
        return;
    }

    var AjaxDI = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        AjaxDI.Super.call(containerBuilder, config);
    }, {
        load: function() {
            var builder = this._getContainerBuilder();

            builder.addServiceDefinition('ajax', {
                factory: 'Nittro.Ajax.Service()',
                run: true,
                setup: [
                    '::addTransport(Nittro.Ajax.Transport.Native())'
                ]
            });
        }
    });

    _context.register(AjaxDI, 'AjaxDI')

});
