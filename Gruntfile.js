module.exports = function (grunt) {

    var files = [
        'src/js/Nittro/Ajax/FormData.js',
        'src/js/Nittro/Ajax/Request.js',
        'src/js/Nittro/Ajax/Response.js',
        'src/js/Nittro/Ajax/Service.js',
        'src/js/Nittro/Ajax/Transport/Native.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            nittro: {
                files: {
                    'dist/js/nittro-ajax.min.js': files
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            nittro: {
                files: {
                    'dist/js/nittro-ajax.js': files
                }
            }
        },

        jasmine: {
            src: files,
            options: {
                vendor: [
                    'bower_components/promiz/promiz.min.js',
                    'bower_components/nittro-core/dist/js/nittro-core.js'
                ],
                specs: 'tests/specs/**.spec.js',
                display: 'short',
                summary: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.registerTask('default', ['uglify', 'concat']);
    grunt.registerTask('test', ['jasmine']);

};
