function GEO() {

};

GEO.prototype.distance = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = Math.toRad(lat2 - lat1);
    var dLon = Math.toRad(lon2 - lon1);
    var lat1 = Math.toRad(lat1);
    var lat2 = Math.toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d*1000;
};