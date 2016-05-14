# Pacemaker

Basic health checks for web applications.

## Install

```bash
$ git clone https://github.com/Lapixx/Pacemaker.git
$ cd Pacemaker
$ npm install
```

## API

### Pacemaker.create()
The Pacemaker package exports a single `create()` method to initialise a new
Pacemaker instance:

```js
const pacemaker = require("pacemaker");
const pm = pacemaker.create();
```

Once you have a new instance, you can use the following methods to control
behaviour:

### pm.interval(minutes)

Sets the interval of performing health checks on your endpoints.

### pm.monitor(url)

Adds a new endpoint to check to your pacemaker instance. You can either provide
a URL string, or an options object with the following properties:

- `url` (string): The URL to check
- `body` (regex): A regular expression to verify that the loaded page is correct (optional)
- `cert` (boolean): Set to false if you want to ignore SSL certificate warnings (optional)

### pm.notify(onError, onRevive)

Define handlers that get triggered when one of your endpoints goes offline, or
when it comes back online again.

**onError()** gets called the when an endpoint becomes unavailable, and receives
3 parameters:

- `endpoint`: The endpoint that is failing (either string or object, depending on what you provided in `monitor()`)
- `error`: The error code
- `details`: Additional details to the error

Errors are defined in `Pacemaker.Errors`, and can be of either of 3 types:

- `CONN_ERR`: Failed to connect to the host. `details` includes the full error object.
- `HTTP_ERR`: The server returned a non-200 status code. `details` includes the returned status code.
- `BODY_ERR`: The page did not match the regex you provided. `details` includes the retrieved contents.

**onRevive()** gets called when an endpoint went offline, and is now back online.

Take note that `onError` only gets called the first time an endpoint goes offline, until it becomes reachable again.

### pm.start()

Start performing health checks on your endpoints.

### pm.stop()

Stop performing health checks on your endpoints.

## Full example:

```js
const pacemaker = require("pacemaker");

pacemaker.create()
    .interval(5)
    .monitor("https://www.example.com")
    .monitor({ url: "http://blog.example.com", body: /<title>example blog/ })
    .monitor({ url: "https://selfsigned.example.com", cert: false })
    .notify(
        (x, err, det) => console.log("Offline: " + (x.url || x)),
        (y) => console.log("OK " + (y.url || y))
    )
    .start();
```
