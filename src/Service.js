_context.invoke('Nittro.Ajax', function (Request, Arrays, Url) {

    var Service = _context.extend('Nittro.Object', function (options) {
        Service.Super.call(this);

        this._.options = Arrays.mergeTree({}, Service.defaults, options);
        this._.transport = null;

        if (!this._.options.allowOrigins) {
            this._.options.allowOrigins = [];
        } else if (!Array.isArray(this._.options.allowOrigins)) {
            this._.options.allowOrigins = this._.options.allowOrigins.split(/\s*,\s*/g);
        }

        this._.options.allowOrigins.push(Url.fromCurrent().getOrigin());
    }, {
        STATIC: {
            defaults: {
                allowOrigins: null
            }
        },

        setTransport: function (transport) {
            this._.transport = transport;
            return this;
        },

        addTransport: function (transport) {
            console.log('The Nittro.Ajax.Service.addTransport() method is deprecated, please use setTransport instead');
            return this.setTransport(transport);
        },

        supports: function (url, method, data) {
            return this._.transport.supports(url, method, data);
        },

        isAllowedOrigin: function(url) {
            return this._.options.allowOrigins.indexOf(Url.from(url).getOrigin()) > -1
        },

        'get': function (url, data) {
            return this.dispatch(this.createRequest(url, 'get', data));
        },

        post: function (url, data) {
            return this.dispatch(this.createRequest(url, 'post', data));
        },

        createRequest: function (url, method, data) {
            if (!this.isAllowedOrigin(url)) {
                throw new Error('The origin of the URL "' + url + '" is not in the list of allowed origins');
            } else if (!this.supports(url, method, data)) {
                throw new Error('The request with the specified URL, method and data isn\'t supported by the AJAX transport');
            }

            var request = new Request(url, method, data);
            this.trigger('request-created', {request: request});
            return request;
        },

        dispatch: function (request) {
            request.freeze();
            return this._.transport.dispatch(request);
        }
    });

    _context.register(Service, 'Service');

}, {
    Arrays: 'Utils.Arrays',
    Url: 'Utils.Url'
});
