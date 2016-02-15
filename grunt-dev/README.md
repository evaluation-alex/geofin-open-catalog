#Geofin - Grunt.js 

##Description

> Grunt runner used in the development of Geofin

##USAGE

#### First Time Use

Make sure that all node.js packages are installed

``` bash
$ npm install
```

#### Run a Task

To run a task simply call grunt with the name of the tasks in the runner:
``` bash
$ grunt [ [default] [css] [app] [lib] [watch] ]
```

Example Use: (to minify and compile javascript files in the app directory:

``` bash
$ grunt app
```

#### Grunt Configuration

> ./Gruntfile.js for test configuration
>
> ./grunt.config.json contains directory paths & javascript / css files that the tests minimize and compile.



