"use strict";
(function() {
  var constants = {
    'STACK_API_ROOT': 'https://api.stackexchange.com/2.2/'
  };
	var tag = document.querySelector("#stack-overflow-tag"),
		startDate = document.querySelector("#start-date"),
		endDate = document.querySelector("#end-date"),
		timePeriod = document.querySelector("#time-period"),		
		year = new Date().getFullYear(),
		month = new Date().getMonth() + 1,
		daysinMonth = 31,
		questions = {
			tag : "firefox-os",
			startDate : "2014-05-01",
			endDate : "2014-05-31",		
			timePeriod : "month",
			withActivity : {
				total : 0
			},
			unanswered :  {
				total : 0
			},
			topAskers : {
				items  : []
			},
			faq : {
				items  : []
			},
			relatedTags : {
				items  : []
			}
		};

	// Setting up the form
	switch (month){
		case 2:
			daysinMonth = 28;
			break;
		case 4:
		case 6:
		case 9:
		case 11:
			daysinMonth = 30;
			break;
		default:
			daysinMonth = 31;
	}

	month = (month < 10)? "0" + month : month;
	startDate.value = year + "-" + month + "-01";
	endDate.value = year + "-" + month + "-" + daysinMonth;

	document.querySelector("#selection-form").onsubmit = function (evt) {
		checkReports();
		evt.preventDefault();
	};


	function addResults (type) {
		var questionsWithActivity = questions.withActivity.total,
			unansweredQuestions = questions.unanswered.total,
			percentageUnanswered = (questionsWithActivity > 0)? parseFloat((unansweredQuestions/questionsWithActivity) * 100).toFixed(2) : "100";			

		// With activity
		if (type === "withActivity") {
			document.querySelector("#questions-with-activity").innerHTML = questionsWithActivity;
		}

		// With activity or unanswered, to compare results
		if (type === "withActivity" || type === "unanswered") {
			document.querySelector("#questions-results").innerHTML = percentageUnanswered;
		}

		// Unanswered
		if (type === "unanswered") {
			document.querySelector("#unanswered-questions").innerHTML = unansweredQuestions;

			var unanswered = document.querySelector("#unanswered"),
				allUnanswered = questions.unanswered.items;
			if (allUnanswered) {
				var totalUnanswereds = (allUnanswered.length > 10)? 10 : allUnanswered.length,
					unansweredResults = "<ul>";

				for (var i=0,l=totalUnanswereds, question; i<l; i++) {
					question = allUnanswered[i];
					unansweredResults += "<li>" + 
									'<a href="' + question["link"] + '">' +
									question["title"] + "</a><br>" + 
									"<small>" + question["tags"].toString(", ") + "</small></li>";
				}
				unansweredResults += "</ul>";
				unanswered.innerHTML = unansweredResults;
			}
		}

		// Top answerers
		if (type === "topAnswerers") {
			var topAnswerers = document.querySelector("#top-answerers"),
				allTopAnswerers = questions.topAnswerers.items;
			if (allTopAnswerers) {
				var totalTopAnswerers = (allTopAnswerers.length > 5)? 5 : allTopAnswerers.length,
					topAnswerersResults = "<ul>";

				for (var i=0,l=totalTopAnswerers, user; i<l; i++) {
					user = allTopAnswerers[i];
					topAnswerersResults += "<li>" + 
										'<a href="' + user.user["link"] + '">' +
										'<img src="' + user.user["profile_image"] + '" alt="">' + 
										user.user["display_name"] + "</a>" + ", Score: " + user["score"] + " (" + 
										user["post_count"] + " question" + ((user["post_count"] > 1)? "s" : "") + ")</li>";
				};
				topAnswerersResults += "</ul>";
				topAnswerers.innerHTML = topAnswerersResults;
			}
		}

		// Top askers
		if (type === "topAskers") {
			var topAskers = document.querySelector("#top-askers"),
				allTopAskers = questions.topAskers.items;
			if (allTopAskers) {
				var totalTopAskers = (allTopAskers.length > 5)? 5 : allTopAskers.length,
					topAskersResults = "<ul>";

				for (var i=0,l=totalTopAskers, user; i<l; i++) {
					user = allTopAskers[i];
					topAskersResults += "<li>" + 
										'<a href="' + user.user["link"] + '">' +
										'<img src="' + user.user["profile_image"] + '" alt="">' + 
										user.user["display_name"] + "</a>" + ", " + user["post_count"] + " question" + ((user["post_count"] > 1)? "s" : "") + "</li>";
				};
				topAskersResults += "</ul>";
				topAskers.innerHTML = topAskersResults;
			}
		}

		// Frequently asked questions
		if (type === "faq") {
			var faq = document.querySelector("#faq"),
				allFaq = questions.faq.items;
			if (allFaq) {
				var totalFaqs = (allFaq.length > 10)? 10 : allFaq.length,
					faqResults = "<ul>";

				for (var i=0,l=totalFaqs, question; i<l; i++) {
					question = allFaq[i];
					faqResults += "<li>" + 
									'<a href="' + question["link"] + '">' +
									question["title"] + "</a><br>" + 
									"<small>" + question["tags"].toString(", ") + "</small></li>";
				}
				faqResults += "</ul>";
				faq.innerHTML = faqResults;
			}
		}

		// Related tags
		if (type === "relatedTags") {
			var relatedTags = document.querySelector("#related-tags"),
				allRelatedTags = questions.relatedTags.items;
			if (allRelatedTags) {
				var totalRelatedTags = (allRelatedTags.length > 10)? 10 : allRelatedTags.length,
					relatedTagsResults = "<ul>";

				for (var i=0,l=totalRelatedTags, tag; i<l; i++) {
					tag = allRelatedTags[i];
					relatedTagsResults += "<li>" + 
									'<a href="http://stackoverflow.com/questions/tagged/' + tag["name"] + '">' +
									tag["name"] + "</a></li>";
				}
				relatedTagsResults += "</ul>";
				relatedTags.innerHTML = relatedTagsResults;
			}
		}
	}

	function showErrors (name, msg) {
		var error = document.querySelector("#error");
		error.innerHTML = name + "<br>" + msg;
	}

	function getItems(type, url) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				//console.log("Type: " + type);
				//console.log(xhr.response);
				var response = xhr.response,
					quotaRemaining = response["quota_remaining"];

				if (response["error_message"]) {
					showErrors(response["error_name"], response["error_message"]);
				}
				else {
					questions[type] = response;
					addResults(type);
				}				

				// Remining requests today from your IP
				if (quotaRemaining) {
					document.querySelector("#remaining-requests").innerHTML = quotaRemaining;
				}
			}
		};
		
		xhr.open("GET", url, true);
		xhr.responseType = "json";
		xhr.send(null);
	};

	function getQuestionsWithActivity () {
		// All questions for a certain time period - http://api.stackexchange.com/docs/search
		getItems("withActivity", constants.STACK_API_ROOT + "search?fromdate=" + questions.startDate + "&todate=" + questions.	endDate + "&order=desc&sort=activity&tagged=" + questions.tag + "&site=stackoverflow&filter=!9WA((MBIa");
	}

	function getUnansweredQuestions () {
		// All questions without an answer for a certain time period - http://api.stackexchange.com/docs/unanswered-questions
		// "At this time a question must have at least one upvoted answer to be considered answered"
		getItems("unanswered", constants.STACK_API_ROOT + "questions/unanswered?fromdate=" + questions.startDate + "&todate=" + questions.endDate + "&order=desc&sort=activity&tagged=" + questions.tag + "&site=stackoverflow&filter=!9WA((MBIa");
	}

	function topAnswerers () {
		getItems("topAnswerers", constants.STACK_API_ROOT + "tags/" + questions.tag + "/top-answerers/" + questions.timePeriod + "?site=stackoverflow");
	}

	function topAskers () {
		getItems("topAskers", constants.STACK_API_ROOT + "tags/" + questions.tag + "/top-askers/" + questions.timePeriod + "?site=stackoverflow");
	}

	function faq () {
		getItems("faq", constants.STACK_API_ROOT + "tags/" + questions.tag + "/faq?site=stackoverflow");
	}

	function relatedTags () {
		getItems("relatedTags", constants.STACK_API_ROOT + "tags/" + questions.tag + "/related?site=stackoverflow");
	}

	function checkReports () {
		questions.tag = tag.value;
		questions.startDate = startDate.value;
		questions.endDate = endDate.value;		
		questions.timePeriod = timePeriod.value;

		// Get reports
		getQuestionsWithActivity();
		getUnansweredQuestions();
		topAnswerers();
		topAskers();
		faq();
		relatedTags();
	}

	document.querySelector("#check-reports").onclick = checkReports;

	// Run automatically at page load
	checkReports();
})();
