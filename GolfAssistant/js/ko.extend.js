ko.observableArray.fn.insert = function (index, value) {
	this[index] = value;
	this.notifySubscribers(this);
};