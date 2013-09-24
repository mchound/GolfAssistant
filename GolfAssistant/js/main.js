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
        tee: ko.observable({}),
        strokes: ko.observable(0),
        holeNr: ko.observable(0),        
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
            var holes = course.Loop.Holes;
            for (var i = 0; i < holes.length; i++) {
                self.ongoingRound.strokes.push(ko.observable());
            };
            hasher.gotoHash('round-select-tee');
        },
        teeSelect: function (tee) {
            self.round.tee(tee);
            self.round.holeNr(1);
            self.round.strokes(self.commonFn.strokes(tee, self.round.course().Par))
            hasher.gotoHash('round-play');
        },
        nextHole: function () {
            window.scroll(0, 0);
            var holeNr = self.round.holeNr();
            if (++holeNr > self.round.course().Loop.Holes.length)
                self.round.holeNr(1);
            else
                self.round.holeNr(holeNr);
        },
        prevHole: function () {
            window.scroll(0, 0);
            var holeNr = self.round.holeNr();
            if (--holeNr < 1)
                self.round.holeNr(self.round.course().Loop.Holes.length);
            else
                self.round.holeNr(holeNr);
        }
    };

    this.ongoingRound = {
        scoreCahnged: function(val){
            var v = 1;
        },
        strokes: [],        
        hole: ko.computed(function () {
            var holeNr = this.holeNr();
            if (holeNr == 0) return {};
            return this.course().Loop.Holes[holeNr - 1];
        }, self.round),
        length: ko.computed(function () {
            var holeNr = this.holeNr();
            if (holeNr == 0) return -1;
            var tee = this.tee();
            var tees = this.course().Loop.Holes[holeNr - 1].Tees;
            for (var i = 0; i < tees.length; i++) {
                if (tees[i].Color == tee.TeeColor)
                    return tees[i].Length;
            }
        }, self.round),
        showScorecard: ko.observable(false),
        scorecard: ko.computed(function () {
            var hole = self.round.holeNr();
            var course = self.round.course();
            var tee = self.round.tee();
            if (!course.Loop) return {};
            var holes = course.Loop.Holes;
            var strokes = self.ongoingRound.strokes;
            if (strokes.length <= 0) return {};
            var scorecard = [];
            var res = 0;
            for (var i = 0; i < holes.length; i++) {
                var
                index = holes[i].Index,
                par = holes[i].Par,
                length = self.commonFn.lengthByHole(i) + 'm',
                strokeBenefit = self.commonFn.strokeBenefit(holes[i].Index, self.round.strokes(), holes[i].Par, holes.length),
                strokesOnHole = strokes[i](),
                points = strokesOnHole ? par + strokeBenefit + 2 - strokesOnHole : '-';
                res += strokesOnHole ? points : 0;
                scorecard.push({
                    nr: i + 1,
                    index: index,
                    par: par,
                    length: length,
                    strokeBenefit: strokeBenefit,
                    points: points,
                    strokes: strokesOnHole || '-',
                    result: strokesOnHole ? res : ''
                });
            };
            return scorecard;
        })
    };

    this.commonFn = {
        changeHash: function (hash, viewModel, event) {
            hasher.gotoHash(hash);
        },

        strokes: function (tee, par) {
            var
            hcp = self.account.handicap();

            return Math.floor(hcp * (tee.SlopeValue / 113) + (tee.CourseRating - par));
        },

        lengthByHole: function(zeroBasedholeNr){
            var
            tees = self.round.course().Loop.Holes[zeroBasedholeNr].Tees,
            tee = self.round.tee();

            for (var i = 0; i < tees.length; i++) {
                if (tees[i].Color == tee.TeeColor)
                    return tees[i].Length;
            }
        },

        strokeBenefit: function (index, hcpStrokes, holePar, holeCount) {
            var
            base = parseInt(hcpStrokes / holeCount),
            add = hcpStrokes % holeCount,
            strokeBenefit = base + (index <= add ? 1 : 0);
            return strokeBenefit;
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
        if (['round-select-club', 'round-select-course', 'round-select-tee', 'round-play'].indexOf(newValue) !== -1 && !self.round.started())
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

