(function (document, window, undefined) {
    var

    vars = {
        startX: undefined,
        ongoingSwipe: false
    }

    touch = {
        addSwipeLeftEventListener: function (callback) { swipeLeftEventHandlers.push(callback) },
        addSwipeRightEventListener: function (callback) { swipeRightEventHandlers.push(callback) },
    },

    swipeLeftEventHandlers = [],
    swipeRightEventHandlers = [];

    document.addEventListener('touchstart', function (e) {
        e.preventDefault();
        vars.startX = e.touches[0].pageX;
    }, null);

    document.addEventListener('touchend', function (e) {
        vars.ongoingSwipe = false;
    }, null);

    document.addEventListener('touchmove', function (e) {
        if ((vars.startX - e.touches[0].pageX) > 120 && !vars.ongoingSwipe) {
            vars.ongoingSwipe = true;
            for (var i = 0; i < swipeLeftEventHandlers.length; i++) {
                swipeLeftEventHandlers[i].call(this, e);
            }
        }
        else if ((vars.startX - e.touches[0].pageX) < -120 && !vars.ongoingSwipe) {
            vars.ongoingSwipe = true;
            for (var i = 0; i < swipeRightEventHandlers.length; i++) {
                swipeRightEventHandlers[i].call(this, e);
            }
        }
    }, null);

    window.touch = touch;

})(document, window)