(function (window, undefined) {

    var

    callbackQue = [],

    hashTriggers = document.querySelectorAll('[data-hasher-href]'),

    tracker = {
        oldUrl: undefined,
        oldHash: undefined,
    },

    hasher = {

        hashchange: function (callback) {
            callbackQue.push(callback);
            callback.call(null, { oldUrl: undefined, newUrl: tracker.oldUrl, oldHash: undefined, newHash: tracker.oldHash });
        },

        gotoHash: function (hash) {
            window.location.href = window.location.href.split('#')[0] + '#' + hash;
        }
    },
    
    hashchangeEventHandler = function (e) {
        var
            oldUrl = e.oldURL || tracker.oldUrl,
            newUrl = e.newURL || window.location.href,
            oldHash = oldUrl.split('#')[1],
            newHash = newUrl.split('#')[1];

        tracker.oldUrl = newUrl;
        tracker.oldHash = newHash;

        for (var i = 0; i < callbackQue.length; i++) {
            callbackQue[i].call(null, { oldUrl: oldUrl, newUrl: newUrl, oldHash: oldHash, newHash: newHash });
        };
    },

    hashTriggerClicked = function (hashTrigger) {
        hasher.gotoHash(hashTrigger.getAttribute('data-hasher-href'));
    },

    initHasher = function () {
        var initialHash = window.location.href.split('#')[1];
        if (initialHash) {
            tracker.oldUrl = window.location.href;
            tracker.oldHash = initialHash;
        }
    };

    window.addEventListener("hashchange", hashchangeEventHandler, false);

    for (var i = 0; i < hashTriggers.length; i++) {
        (function (i) {
            hashTriggers[i].addEventListener('click', function () {
                hashTriggerClicked(hashTriggers[i]);
            }, null)
        })(i);
    };

    initHasher();

    window.hasher = hasher;

})(window);