Math.toRad = function (degrees) {
    return degrees * (Math.PI / 180);
};

function ajax(url, callback) {
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//var start = new Date().getTime();
//var interval = setInterval(function () {
//    var elements = document.querySelectorAll('[data-scroll-on-focus]');
//    if (elements.length > 0)
//        bindScrollers(elements);
//    else if (new Date().getTime() - start > 10000)
//        clearInterval(interval);
//}, 200);

//function bindScrollers(elements) {
//    for (var i = 0; i < elements.length; i++) {
//        (function(index){
//            elements[index].addEventListener('focus', function () {
//                setTimeout(function () { window.scrollTo(0, 1000); }, 1000);
//            });
//        })(i);
//    };
//};
