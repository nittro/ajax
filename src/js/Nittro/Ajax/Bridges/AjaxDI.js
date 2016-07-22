_context.invoke('Nittro.Ajax.Bridges', function(Nittro) {

    if (!Nittro.DI) {
        return;
    }

    var AjaxDI = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        AjaxDI.Super.call(this, containerBuilder, config);
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
