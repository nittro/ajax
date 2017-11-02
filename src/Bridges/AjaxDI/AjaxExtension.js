_context.invoke('Nittro.Ajax.Bridges.AjaxDI', function(Nittro) {

    var AjaxExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        AjaxExtension.Super.call(this, containerBuilder, config);
    }, {
        STATIC: {
            defaults: {
                allowOrigins: null
            }
        },
        load: function() {
            var builder = this._getContainerBuilder(),
                config = this._getConfig(AjaxExtension.defaults);

            builder.addServiceDefinition('ajax', {
                factory: 'Nittro.Ajax.Service()',
                args: {
                    options: config
                },
                run: true,
                setup: [
                    '::setTransport(Nittro.Ajax.Transport.Native())'
                ]
            });
        }
    });

    _context.register(AjaxExtension, 'AjaxExtension')

});
