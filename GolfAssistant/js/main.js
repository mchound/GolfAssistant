window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

function viewModel() {
    var self = this;

	this.contentView = {
		viewName: ko.observable('round'),
		viewIndex: ko.observable(0)		
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
	        self.contentView.viewName('round-select-club');
	    }
	}
}
 
 var vm = new viewModel();
 ko.applyBindings(vm);

var mainViews = ['home', 'settings', 'round', 'stats'];
var roundViews = ['']


var courses;
var geo = new GEO();

ajax('mock/Courses.json', function (data) {
    courses = JSON.parse(data);
    console.log(geo.distance(57.779614, 14.164979, courses[1].Lat, courses[1].Lon));
});

