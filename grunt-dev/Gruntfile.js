module.exports = function(grunt) {
    // watch has problems finding the working directory
    // watch requires this variable
    var cwd = process.cwd();

    grunt.initConfig({
        cfg : grunt.file.readJSON('grunt.config.json'),

        bless : {
            css : {
                options : {
                    compress : true,
                    cleanup  : true
                },
                files : {
                    "<%= cfg.cdt %>geofin-blessed.min.css" : "<%= cfg.cdt %>geofin.min.css"
                }
            }
        },

        concat : {
            devCSS : {
                src  : "<%= cfg.css_files %>",
                dest : "<%= cfg.cdt %>concat.css" 
            },
            libsJS : {
                src  : "<%= cfg.lib_files %>",
                dest : "<%= cfg.jdt %>libs.concat.js"
            },
            appsJS : {
                src  : "<%= cfg.app_files %>",
                dest : "<%= cfg.jdt %>apps.concat.js"
            },
            allJS :  {
                src  : ["<%= cfg.jdt %>libs.min.js","<%= cfg.jdt %>apps.min.js"],
                dest : "<%= cfg.jdt %>geofin.js"
            }
 
        },
    
        cssmin : {
            target : {  
                files : {
                    "<%= cfg.cdt %>geofin.min.css" : "<%= cfg.cdt %>concat.css"
                }
            }
        },

        emberTemplates : {
            compile : {
                options : {
                    templateBasePath: "<%= cfg.tmp %>",
                },
                files : {
                    "<%= cfg.tdt %>templates.js" : ["<%= cfg.tmp %>*.handlebars", "<%= cfg.tmp %>table_cells/*.handlebars"]
                }
            }
        },

        jshint : {
            files : ['<%= cfg.app %>*.js',]
        },

        less : {
            dev: {
                options : {
                    compress : true,
                    ieCompat : true,
                },
                files : {
                    "<%= cfg.css %>ember-table.less.css" : "<%= cfg.lss %>ember-table.less",
                    "<%= cfg.css %>style.less.css"       : "<%= cfg.lss %>style.less",

                }
            }
        },

        uglify : {
            options : {
                compress : {
                    dead_code        : true,
                    conditionals     : true,
                    booleans         : true,
                    loops            : true,
                    unused           : true,
                    join_vars        : true,
                    if_return        : true,
                    negate_iife      : true
                },
                preserveComments : false,

            },
            libs : {
                files : {
                    "<%= cfg.jdt %>libs.min.js" : "<%= cfg.jdt %>libs.concat.js"
                },
            },
            apps : {
                files : {
                    "<%= cfg.jdt %>apps.min.js" : "<%= cfg.jdt %>apps.concat.js"
                }
            }
        },

        watch : {
            options : {
                cliArgs : ['--grunt-file', require('path').join(cwd, 'Gruntfile.js')]
            },
            scripts : {
                files : ['<%= cfg.app %>*.js',],
                tasks : ['jshint', 'app']
            },
            less : {
                files : ['<%= cfg.lss %>*.less'],
                tasks : ['css',]
            }
        }       
    });

    grunt.loadNpmTasks('grunt-bless');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ember-templates');
    
    grunt.registerTask('app', ['concat:appsJS', 'uglify:apps', 'concat:allJS']);
    grunt.registerTask('css', ['less:dev','concat:devCSS','cssmin', 'bless']);
    grunt.registerTask('lib', ['concat:libsJS', 'uglify:libs', 'concat:allJS']);
    grunt.registerTask('cmp', ['emberTemplates',]);
    grunt.registerTask('wth', ['watch',]);

    grunt.registerTask('default',['css', 'concat:libsJS', 'uglify:libs','concat:appsJS', 'uglify:apps', 'concat:allJS']);
};
