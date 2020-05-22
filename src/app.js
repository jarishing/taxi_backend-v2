const express = require('express'),
      debug   = require('debug')('Server'),
      passport = require("passport"),
      apiError = require('server-api-errors'),
      path = require('path');

const App = function(){
    
    passport.use('local', require('./utils/passport.local'));
    passport.use('admin', require('./utils/passport.admin'));

    const app = express();
    
    /**
     * 
     * Base middleware
     * 
     */
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(require("helmet").noCache());
    // if ( process.env.NODE_ENV == "development")
        app.use(require('morgan')('dev'));
    app.use(require('body-parser').json());
    app.use(require('body-parser').urlencoded({ extended: false }));
    app.use(require('cookie-parser')());
    app.use(require('cors')());

     /**
     * 
     * public folder
     * 
     */

    // if( process.env.NODE_ENV === 'development')
    app.use(express.static(__dirname + '/public'));
    /**
     * 
     * Mount Routes
     * 
     */
    app.use("/api", require('./index.route'));
    // Catch the 404 error and pass it to the error handler

    app.use(express.static(path.resolve( __dirname, 'build')));  

    app.get('*', (req, res) => {
        res.sendFile(path.resolve( __dirname, 'build', 'index.html'));
    });

    app.use( (req, res, next ) => {
        const error = new apiError.NotFound();
        return next( error);
    });

    app.use(( error, req, res, next ) => {
        if ( error.name === 'UnauthorizedError')
            return next(apiError.Unauthorized());
        else 
            return next(error);
    });

    app.use(apiError.catchError);

    return app;
}();

module.exports = App;