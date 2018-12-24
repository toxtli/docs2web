var app = angular.module('Website_App', ['ngSanitize']);
app.controller('Website_Controller', function($scope, $http) {
	if(window.location.hash) {
		var params = getHashParams();
		if (params.hasOwnProperty('id')) {
			config.url = 'https://docs.google.com/document/d/e/' + params['id'] + '/pub?embedded=true';
		} else if (params.hasOwnProperty('url')) {
			config.url = params['url'] + '?embedded=true';
		}
	}
	$http.get(config.url).success(function (response) {
		var data = formatContent(response);
		$scope.data = data;
	});
});

$(() => {
	$(document).on('click', '.Section_Link', (element) => {
		var sectionId = element.target.id.split('_').pop();
		$('.Section').hide();
		$('#section_' + sectionId).show();
	});
	$(document).on('click', '.Back', (element) => {
		$('.Section').hide();
		$('.Index_Section').show();
	});	
});

function convertToHTML(elements) {
	var html = $('<div/>').append(elements).html();
	return html;
}

function reformatContent(container) {
	$(container + ' a').each((index, element) => {
		var url = $(element).attr('href');
		if (url) {
			var reg = /https:\/\/www.google.com\/url\?q=(.*)&sa=(.*)/g
			url = url.replace(reg, '$1');
			$(element).attr('href', url);
			$(element).attr('target', '_blank');
		}
	});
}

function getHashParams() {
    var hashParams = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);
    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);
    return hashParams;
}

function formatContent(response) {
	var content = {};
	var container = "#temp";
	$(container).html(response);
	reformatContent(container);
	content.title = $(container + " .title").text();
	content.sections = [];
	var sections = $(container + " h1").toArray();
	for (var i = 0; i < sections.length; i++) {
		content.sections[i] = {};
		content.sections[i].title = $(sections[i]).text();
		content.sections[i].sections = [];
		if (i == (sections.length - 1)) {
			content.sections[i].contentAll = $(sections[i]).nextAll();
		} else {
			content.sections[i].contentAll = $(sections[i]).nextUntil(sections[i + 1]);
		}
		var subSections = content.sections[i].contentAll.filter('h2').toArray();
		if (subSections.length > 0) {
			content.sections[i].content = convertToHTML($(sections[i]).nextUntil(subSections[0]));
		} else {
			content.sections[i].content = convertToHTML(content.sections[i].contentAll);
		}
		for (var j = 0; j < subSections.length; j++) {
			content.sections[i].sections[j] = {};
			content.sections[i].sections[j].title = $(subSections[j]).text();
			content.sections[i].sections[j].sections = [];
			if (j == (subSections.length - 1)) {
				if (i == (sections.length - 1)) {
					content.sections[i].sections[j].content = convertToHTML($(subSections[j]).nextAll());
				} else {
					content.sections[i].sections[j].content = convertToHTML($(subSections[j]).nextUntil(sections[i + 1]));
				}
			} else {
				content.sections[i].sections[j].content = convertToHTML($(subSections[j]).nextUntil(subSections[j + 1]));
			}
		}
	}
	$(container).html('');
	return content;
}