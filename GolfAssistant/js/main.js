window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

function viewModel() {
    var self = this;

    this.views = {
        contentView: ko.observable('round'),
        clubTabView: ko.observable('nearest-clubs')
    };

    this.account = {
        name: ko.observable('Tobias Lund'),
        email: ko.observable('tobias.lund@hotmail.com'),
        handicap: ko.observable(18.9),
        gender: ko.observable("1")
    };

    this.round = {
        started: ko.observable(false),
        club: ko.observable({ Data: { Courses: [] }}),
        course: ko.observable({}),
        start: function () {
            self.round.started(true);
            hasher.gotoHash('round-select-club');
        },
        clubSelect: function (club) {
            self.round.club(club);
            hasher.gotoHash('round-select-course');
        },
        courseSelect: function (course) {
            self.round.course(course);
            hasher.gotoHash('round-select-tee');
        }
    };

    this.commonFn = {
        changeHash: function (hash, viewModel, event) {
            hasher.gotoHash(hash);
        },

        strokes: function (tee, par) {
            var
            hcp = self.account.handicap();

            return Math.floor(hcp * (tee.SlopeValue / 113) + (tee.CourseRating - par));
        }
    };

    this.store = {
        courses: ko.observableArray([]),
        clubSearchQuery: ko.observable('')
    };

    this.geo = {
        lat: ko.observable(),
        lon: ko.observable()
    };

    this.search = {
        filteredClubs: ko.computed(function () {
            var searchQuery = self.store.clubSearchQuery();
            return ko.utils.arrayFilter(this.courses(), function (course) {
                return course.Name.toLowerCase().indexOf(searchQuery) != -1;
            });
        }, self.store),

        nearest: ko.computed(function () {
            var
            lat = self.geo.lat();
            lon = self.geo.lon();
            return this.courses.sort(function (left, right) {
                var
                leftDistance = geo.distance(left.MapLat, left.MapLng, lat, lon),
                rightDistance = geo.distance(right.MapLat, right.MapLng, lat, lon);
                left.distance = Math.round(leftDistance / 100) / 10;
                right.distance = Math.round(rightDistance / 100) / 10;
                return leftDistance == rightDistance ? 0 : leftDistance > rightDistance ? 1 : -1;
            });
        }, self.store).extend({ throttle: 500 }),

        tees: ko.computed(function () {
            var
            course = self.round.course();
            if (!course.Loop) return [];

            return ko.utils.arrayFilter(course.Loop.Slopes, function (slope) {
                slope.strokes = self.commonFn.strokes(slope, self.round.course().Par);
                return slope.Gender === parseInt(self.account.gender());
            }).sort(function (left, right) {
                return left.strokes === right.strokes ? 0 : left.strokes > right.strokes ? 1 : -1;
            });
        })
    };

    this.views.contentView.subscribe(function (newValue) {
        if (['round-select-club', 'round-select-course', 'round-select-tee'].indexOf(newValue) !== -1 && !self.round.started())
            hasher.gotoHash('round');
        
        if (['round-select-club', 'round-select-course'].indexOf(newValue) !== -1 && self.round.started())
            geo.start();
        else
            geo.stop();
    });

};
 
var mainViews = ['home', 'settings', 'round', 'stats'];
var roundViews = ['']


var courses;

var geo = new GEO();
geo.subscribe(function (position) {
    vm.geo.lat(position.coords.latitude);
    vm.geo.lon(position.coords.longitude);
});

var vm = new viewModel();
ko.applyBindings(vm);

ajax('mock/Courses.json', function (data) {
    vm.store.courses(JSON.parse(data));
    //console.log(geo.distance(57.779614, 14.164979, courses[1].Lat, courses[1].Lon));
});

hasher.hashchange(function (hashData) {
    vm.views.contentView(hashData.newHash || 'home');
});

