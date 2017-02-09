_context.invoke('Nittro.Ajax.Transport', function (Nittro, Response, Url) {

    var FormData = Nittro.Forms ? Nittro.Forms.FormData : null;

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
                abort = xhr.abort.bind(xhr);

            var promise = new Promise(function (fulfill, reject) {
                if (request.isAborted()) {
                    reject(this._createError(request, xhr, {type: 'abort'}));

                }

                this._bindEvents(request, xhr, adv, fulfill, reject);

                xhr.open(request.getMethod(), request.getUrl().toAbsolute(), true);

                var data = this._formatData(request, xhr);
                this._addHeaders(request, xhr);
                xhr.send(data);

            }.bind(this));

            request.setDispatched(promise, abort);

            return promise;

        },

        checkSupport: function (xhr) {
            var adv;

            if (!(adv = 'addEventListener' in xhr) && !('onreadystatechange' in xhr)) {
                throw new Error('Unsupported XHR implementation');

            }

            return adv;

        },

        _bindEvents: function (request, xhr, adv, fulfill, reject) {
            var self = this,
                done = false;

            function onLoad(evt) {
                if (done) return;
                done = true;

                if (xhr.status >= 200 && xhr.status < 300) {
                    request.setResponse(self._createResponse(xhr));
                    fulfill(request.getResponse());

                } else {
                    reject(self._createError(request, xhr, evt));

                }
            }

            function onError(evt) {
                if (done) return;
                done = true;

                reject(self._createError(request, xhr, evt));

            }

            function onProgress(evt) {
                request.trigger('progress', {
                    lengthComputable: evt.lengthComputable,
                    loaded: evt.loaded,
                    total: evt.total
                });
            }

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

            if (FormData && data instanceof FormData) {
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

        _createError: function (request, xhr, evt) {
            if (xhr.readyState === 4 && xhr.status !== 0) {
                request.setResponse(this._createResponse(xhr));

            }

            if (evt && evt.type === 'abort') {
                return {
                    type: 'abort',
                    status: null,
                    request: request
                };
            } else if (xhr.status === 0) {
                return {
                    type: 'connection',
                    status: null,
                    request: request
                };
            } else if (xhr.status < 200 || xhr.status >= 300) {
                return {
                    type: 'response',
                    status: xhr.status,
                    request: request
                };
            }

            return {
                type: 'unknown',
                status: xhr.status,
                request: request
            };
        }
    });

    _context.register(Native, 'Native');

}, {
    Url: 'Utils.Url',
    Response: 'Nittro.Ajax.Response'
});
