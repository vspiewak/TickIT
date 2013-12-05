#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

/**
 *  Define the sample application.
 */
var TickItApp = function() {

    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating TickIt app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */
    
    self.leftPad = function(val) {
      var ret = "" + val;
      var pad = "000";
      return pad.substring(0, pad.length - ret.length) + ret;
    };

    self.readCounter = function() {
        return JSON.parse(fs.readFileSync("counter.json"));
    };

    self.writeCounter = function(counter) {
      fs.writeFile("counter.json", JSON.stringify(counter));
    }

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/api/set'] = function(req, res) {
            
            var start = req.query.start;
            var end = req.query.end;

            var counter = self.readCounter();
            
            if(!start || !end || start < counter.code || start > end) {
               res.send(400);
            }

            counter.code = start - 1;
            counter.end = end;
            self.writeCounter(counter);

            res.send(200);
        };

        self.routes['/api/counter'] = function(req, res) {
            
            var counter = self.readCounter();
            
            if(counter.end && counter.end <= counter.code) {
              res.send(404);
            }

            if(req.query.id != counter.id) {
              counter.code += 1;
              self.writeCounter(counter);
            }
            
            counter.code = self.leftPad(counter.code);
            res.json(counter);
            
        };

        self.routes['/api/status'] = function(req, res) {

            var counter = self.readCounter();
            counter.code = self.leftPad(counter.code);
            res.json(counter);

        };

        self.routes['/api/reset'] = function(req, res) {
            var counter = { id: new Date().getTime(), code: 0 };
            self.writeCounter(counter);

            res.send(200);
        };

    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use("/", express.static(__dirname + '/public'));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  TickIt Application.  */

/**
 *  main():  Main code.
 */
var zapp = new TickItApp();
zapp.initialize();
zapp.start();

