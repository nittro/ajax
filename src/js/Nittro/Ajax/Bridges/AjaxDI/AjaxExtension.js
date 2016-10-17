_context.invoke('Nittro.Ajax.Bridges.AjaxDI', function(Nittro) {

    var AjaxExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        AjaxExtension.Super.call(this, containerBuilder, config);
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

    _context.register(AjaxExtension, 'AjaxExtension')

});
