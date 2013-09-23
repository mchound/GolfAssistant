var GEO = function () {
    this.lat = undefined;
    this.lon = undefined;
    this.position = undefined;
    this.watchId = undefined;
    this.status = 'stopped';
    this.subscribers = [];
    this.waiters = [];
    this.options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };
};

GEO.prototype.distance = function (lat1, lon1, lat2, lon2) {
    var
    R = 6371, // km
    dLat = Math.toRad(lat2 - lat1),
    dLon = Math.toRad(lon2 - lon1),
    lat1 = Math.toRad(lat1),
    lat2 = Math.toRad(lat2),

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
    d = R * c;
    return d*1000;
};

GEO.prototype.start = function (callback) {
    
    if ("geolocation" in navigator) {
        var self = this;
        this.status = 'pending';
        this.watchId = navigator.geolocation.watchPosition(function (position) {
            self.status = 'locked';
            if (callback) callback.call(self, position);
            self.update.call(self, position);
        }, this.error, this.options)
    }
    else throw new TypeError("Geolocation isn't supported in browser");
};

GEO.prototype.stop = function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.clearWatch(this.watchId);
        this.status = 'stopped';
    }
};

GEO.prototype.update = function (position) {
    this.lat = position.coords.latitude;
    this.lon = position.coords.longitude;
    this.position = position;

    for (var i = 0; i < this.subscribers.length; i++) {
        this.subscribers[i].call(this, position);        
    };

    for (var i = 0; i < this.waiters.length; i++) {
        this.waiters[i].call(this, position);
    };

    this.waiters = [];
};

GEO.prototype.error = function (error) {
    console.log('ERROR(' + error.code + '): ' + error.message);
};

GEO.prototype.subscribe = function (callback) {
    if (typeof callback !== 'function') return;

    this.subscribers.push(callback);
};

GEO.prototype.getPosition = function (callback) {
    if (this.status === 'stopped') {
        this.start(callback);
    }
    else if (this.status === 'pending') {
        this.waiters(callback);
    }
    else {
        callback.call(this, this.position);
    }
};