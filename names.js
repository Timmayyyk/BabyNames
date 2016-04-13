
// Timothy Davis, ID #1332245
// Section AH
// Homework 9, names js file
// This file contains the javascript code that handles events on the page
// Extra features:

"use strict";

// module pattern
(function() {

	// global constants
	var URL_BASE = "https://webster.cs.washington.edu/cse154/babynames.php?type=";
	
	// initialization function
	window.onload = function() {
		$("search").onclick = search;
		
		// querys with only type list to get the list of names
		query("list", "", "");
	};
	
	// fetches information from the supplied URL, adding passed parameters
	function query(type, name, gender) {
		var request = new XMLHttpRequest();
		
		if (type == "list") {request.onload = setList;}
		if (type == "meaning") {request.onload = setMeaning;}
		if (type == "rank") {request.onload = setRank;}
		if (type == "celebs") {request.onload = setCelebs;}
		
		request.open("GET", URL_BASE + type + name + gender, true);
		request.send();
	}
	
	// handles searching for a name's corresponding information through querys
	function search() {
		clearPage();
		setLoader("meaning", "");
		setLoader("graph", "");
		setLoader("celebs", "");
	
		$("resultsarea").style.display = "";
		
		var type;
		var name = "&name=" + $("allnames").value;
		var gender = "&gender=" + getGender();
	
		type = "meaning";
		query(type, name, "");
		
		type = "rank";
		query(type, name, gender);
		
		type = "celebs";
		query(type, name, gender);
	}
		
	// sets the list of names upon page load
	function setList() {
		if (hasErrors(this)) {
			handleErrors(this);
		} else {
			var nameSelect = $("allnames");
			nameSelect.disabled = false;
			
			setLoader("names", "none");
			
			var names = (this.responseText).split("\n");
			
			for (var i = 0; i < names.length; i++) {
				var option = document.createElement("option");
				var name = names[i];
				
				option.value = name;
				option.innerHTML = name;
				
				nameSelect.appendChild(option);
			}
		}
	}
	
	// sets the meaning of the selected name in the page, upon clicking search
	function setMeaning() {
		if (hasErrors(this)) {
			handleErrors(this);
		} else {
			var meaningArea = $("meaning");
			meaningArea.innerHTML = this.responseText;
			
			setLoader("meaning", "none");
		}
	}
	
	// sets the graph of the selected name in the page, upon clicking search
	function setRank() {
		if (hasErrors(this)) {
			handleErrors(this);
		} else {
			var graphArea = $("graph");
			
			setLoader("graph", "none");
			
			// this error is given by not having any graph information for the given name/gender combo
			if (this.status == 410) {
				// show graph error message
				$("norankdata").style.display = "";
			} else {
				// hide graph error message
				$("norankdata").style.display = "none";
				
				var graphInfo = this.responseXML.querySelectorAll("rank");
			
				// row 1 = headers (years)
				var row1 = document.createElement("tr");
				// row 2 = ranks
				var row2 = document.createElement("tr");
				
				// go through each rank
				for (var i = 0; i < graphInfo.length; i++) {
					var header = document.createElement("th");
					header.innerHTML = graphInfo[i].getAttribute("year");
					
					var data = document.createElement("td");
					var div = document.createElement("div");
					
					var rank = graphInfo[i].textContent;
					div.innerHTML = rank;
					
					var height;
					if (rank == 0) {
						height = 0;
					} else {
						height = parseInt((1000 - rank) / 4);
					}
					div.style.height = height + "px";
					
					if (rank <= 10 && rank > 0) {
						div.className = "popular";
					}
					
					data.appendChild(div);
					
					row1.appendChild(header);
					row2.appendChild(data);
				}
				
				graphArea.appendChild(row1);
				graphArea.appendChild(row2);
			}
		}
	}
	
	// sets the celebs sharing the same name of the selected name, upon clicking search
	function setCelebs() {
		if (hasErrors(this)) {
			handleErrors(this);
		} else {
			var celebsArea = $("celebs");
			
			setLoader("celebs", "none");
			
			var actorList = JSON.parse(this.responseText);
			
			// go through the actors
			for (var i = 0; i < actorList.actors.length; i++) {
				var first = actorList.actors[i].firstName;
				var last = actorList.actors[i].lastName;
				var filmCount = actorList.actors[i].filmCount;
				
				// put actor information in an li
				var listItem = document.createElement("li");
				listItem.innerHTML = first + " " + last + " (" + filmCount + " films)";
				
				celebsArea.appendChild(listItem);
			}
		}
	}
	
	// -- HELPER FUNCTIONS --
	
	// this factors out getting elements by id's
	function $(name) {
		return document.getElementById(name);
	}
	
	// returns the selected gender
	function getGender() {
		// if male is selected
		if ($("genderm").checked) {
			return "m";
		}
		// female must be selected
		return "f";
	}
	
	// clears the content areas on the page
	function clearPage() {
		$("meaning").innerHTML = "";
		$("graph").innerHTML = "";
		$("celebs").innerHTML = "";
		$("errors").innerHTML = "";
	}
	
	// sets the display of the given type, to the given status
	function setLoader(type, status) {
		$("loading" + type).style.display = status;
	}
	
	// checks if there are errors other than the sometimes expected error
	function hasErrors(request) {
		// 410 is okay to get
		if (request.status != 200  && request.status != 410) {
			return true;
		}
		return false;
	}
	
	// handles html on the page when there are errors
	function handleErrors(request) {
		$("errors").innerHTML = "Error " + request.status + ": " + request.statusText;
		
		// stop loading images
		setLoader("names", "none");
		setLoader("meaning", "none");
		setLoader("graph", "none");
		setLoader("celebs", "none");
	}
})();
