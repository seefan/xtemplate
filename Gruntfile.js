module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/render.js', 'src/util.js', 'src/syntax.js', 'src/funcs.js', 'src/xtemplate.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },

        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'concat', 'yuidoc', 'copy']
        },
        yuidoc: {
            compile: {
                "name": "XTemplate",
                "description": "XTemplate的中文API文档",
                "logo": "logo.jpg",
                "options": {
                    paths: "src",
                    outdir: "doc"
                }
            }
        },
        copy: {
            main: {
                files: [
                    {src: ['examples/logo.jpg'], dest: 'doc/logo.jpg'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks("grunt-ftpscript");
    //grunt.registerTask('test', ['jshint', 'qunit']);

    grunt.registerTask('default', ['concat', 'jshint', 'uglify', 'watch', 'yuidoc', 'copy']);

};