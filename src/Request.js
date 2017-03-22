_context.invoke('Nittro.Ajax', function (Nittro, Url, undefined) {

    var Request = _context.extend('Nittro.Object', function(url, method, data) {
        this._ = {
            url: Url.from(url),
            method: (method || 'GET').toUpperCase(),
            data: data || {},
            headers: {},
            normalized: false,
            promise: {
                fulfill: null,
                reject: null,
                wrapper: null
            },
            abort: null,
            aborted: false,
            response: null
        };

        this._.promise.wrapper = new Promise(function (fulfill, reject) {
            this._.promise.fulfill = fulfill;
            this._.promise.reject = reject;
        }.bind(this));
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

        setDispatched: function(promise, abort) {
            if (!(promise instanceof Promise)) {
                throw new Error('"promise" must be an instance of Promise');

            }

            if (typeof abort !== 'function') {
                throw new Error('"abort" must be a function');

            }

            promise.then(this._.promise.fulfill, this._.promise.reject);
            this._.abort = abort;
            return this;

        },

        isDispatched: function () {
            return !!this._.promise;

        },

        then: function (onfulfilled, onrejected) {
            return this._.promise.wrapper.then(onfulfilled, onrejected);

        },

        abort: function () {
            if (this._.abort && !this._.aborted) {
                this._.abort();

            }

            this._.aborted = true;
            return this;

        },

        isAborted: function () {
            return this._.aborted;

        },

        setResponse: function(response) {
            this._.response = response;
            return this;
        },

        getResponse: function () {
            return this._.response;
        },

        _normalize: function() {
            if (this._.normalized || !this.isFrozen()) {
                return;

            }

            this._.normalized = true;

            if (this._.method === 'GET' || this._.method === 'HEAD') {
                this._.url.addParams(Nittro.Forms && Nittro.Forms.FormData && this._.data instanceof Nittro.Forms.FormData ? this._.data.exportData(true) : this._.data);
                this._.data = {};

            }
        }
    });

    _context.mixin(Request, 'Nittro.Freezable');
    _context.register(Request, 'Request');

}, {
    Url: 'Utils.Url'
});
