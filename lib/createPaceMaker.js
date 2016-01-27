"use strict";

// dependencies
const getRequest = require("./getRequest");
const errorCodes = require("./errorCodes");

const createPaceMaker = () => {

    const endpoints = new Set();
    const deadEndpoints = new Set();
    let notifyErr, notifyOk;
    let interval = 1000 * 60 * 5;

    const killEndpoint = (endpoint, err, details) => {

        if (deadEndpoints.has(endpoint)) return;
        deadEndpoints.add(endpoint);

        notifyErr && notifyErr(endpoint, err, details);
    };

    const healEndpoint = (endpoint) => {

        if (!deadEndpoints.has(endpoint)) return;
        deadEndpoints.delete(endpoint);

        notifyOk && notifyOk(endpoint);
    };

    const doHealthCheck = () => {

        endpoints.forEach(endpoint => {

            const url = typeof endpoint === "string" ? endpoint : endpoint.url;

            getRequest({ url, response: !!endpoint.body, cert: endpoint.cert })
            .then(res => {

                // bad status code
                if (res.statusCode !== 200)
                    killEndpoint(endpoint, errorCodes.HTTP_ERR, res.statusCode);

                // bad page contents
                else if (endpoint.body && !endpoint.body.test(res.data))
                    killEndpoint(endpoint, errorCodes.BODY_ERR, res.data);

                // looks healthy!
                else
                    healEndpoint(endpoint);

            })
            .catch(err => {

                // connection error
                killEndpoint(endpoint, errorCodes.CONN_ERR, err);
            });
        });
    };

    let loop = null;
    const startLoop = (x) => {

        if (loop) return;

        loop = setInterval(doHealthCheck, interval);
        setImmediate(doHealthCheck);
    };

    const stopLoop = () => {

        if (!loop) return;

        clearInterval(loop);
        loop = null;
    };

    // build API object
    const api = {};

    api.monitor = opts => {
        endpoints.add(opts);
        return api;
    };
    api.interval = sec => {
        interval = sec * 1000;
        return api;
    };
    api.notify = (fn, gn) => {
        notifyErr = fn;
        notifyOk = gn;
        return api;
    };
    api.start = () => startLoop();
    api.stop = () => stopLoop();

    return api;
};

module.exports = createPaceMaker;
