_context.invoke('Nittro.Ajax', function (Request) {

    var Service = _context.extend('Nittro.Object', function () {
        Service.Super.call(this);

        this._.transport = null;

    }, {
        setTransport: function (transport) {
            this._.transport = transport;
            return this;
        },

        addTransport: function (transport) {
            console.log('The Nittro.Ajax.Service.addTransport() method is deprecated, please use setTransport instead');
            return this.setTransport(transport);
        },

        'get': function (url, data) {
            return this.dispatch(this.createRequest(url, 'get', data));

        },

        post: function (url, data) {
            return this.dispatch(this.createRequest(url, 'post', data));

        },

        createRequest: function (url, method, data) {
            var request = new Request(url, method, data);

            if (!this._.transport.supports(request)) {
                throw new Error('Cannot send this request using the current transport');
            }

            this.trigger('request-created', {request: request});
            return request;
        },

        dispatch: function (request) {
            request.freeze();
            return this._.transport.dispatch(request);
        }
    });

    _context.register(Service, 'Service');

});
