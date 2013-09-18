window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

function viewModel() {
    var self = this;

	this.views = {
		contentView: ko.observable('round'),
		clubTabView: ko.observable('nearest-clubs')
	}

	this.account = {
		name: ko.observable('Tobias Lund'),
		email: ko.observable('tobias.lund@hotmail.com'),
		handicap: ko.observable(18.9),
        gender: ko.observable(1)
	}

	this.round = {
	    started: ko.observable(false),
	    start: function () {
	        hasher.gotoHash('round-select-club');
	        self.round.started(true);
	    }
	}

	this.commonFn = {
	    changeHash: function (hash, viewModel, event) {
	        hasher.gotoHash(hash);
	    }
	}

	this.store = {
	    courses: ko.observableArray([]),
	    clubSearchQuery: ko.observable('')	    
	},

    this.search = {
        filteredCourses: ko.computed(function () {
            var searchQuery = self.store.clubSearchQuery();
            return ko.utils.arrayFilter(this.courses(), function (course) {
                return course.Name.toLowerCase().indexOf(searchQuery) != -1;
            });
        }, self.store)
    }
}
 
 var vm = new viewModel();
 ko.applyBindings(vm);

var mainViews = ['home', 'settings', 'round', 'stats'];
var roundViews = ['']


var courses;
var geo = new GEO();

ajax('mock/Courses.json', function (data) {
    vm.store.courses(JSON.parse(data));
    //console.log(geo.distance(57.779614, 14.164979, courses[1].Lat, courses[1].Lon));
});

hasher.hashchange(function (hashData) {
    vm.views.contentView(hashData.newHash || 'home');
});

