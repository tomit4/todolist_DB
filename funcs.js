/*This To Do List Application is a simple JavaScript application that utlizies NodeJS and various modules to
assist in teaching myself the basics of client/server side web based interfaces as well as best practices when coding.
This application allows the user to create a To Do List that they can save to their local computer or to a server, facilitated
through RethinkDB.
*/

//This funcs file allows the user to access the majority of the functionality of the To Do List App.  This file allows the user to
//read an existing list from a .txt file, create new list objects, delete existing list objects, and then save their current list as
//a .txt file.

const prompt = require('prompt-sync')();
const fs = require('fs');

//A series of empty arrays necessary to push our list objects (i.e. our TASKS)
let currentRoutineAM = [],
	currentRoutinePM = [],
	twelvesArrAM = [],
	twelvesArrPM = [],
	finishedAMArr = [],
	finishedPMArr = [];

//An object constructor function through which the user will pass TASK, HR, MIN, and AMPM properties
function newRoutineItem(TASK, HR, MIN, AMPM) {
	let newObj = new Object();
	newObj.TASK =TASK;
	newObj.HR = HR;
	newObj.MIN = MIN;
	newObj.AMPM = AMPM;
	return newObj;// this return statement now appears odd to me after having created the rethink.js file...
}

//prompts the user if they would like to import their .txt list file
function readFile() {
	let wantFile = prompt('Would you like to import your List file?: ');
	if (wantFile == 'y' || wantFile == 'yes' || wantFile == 'Yes') {
		let fileRead = prompt("What's the name of your List file?: ");
		let readIt = fs.readFileSync(fileRead + '.txt', 'utf8');
		return readIt;
	} else if (wantFile == 'n' || wantFile == 'no' || wantFile == 'No') {
		console.log('No List file imported');
		let fileSplit = '';
		return fileSplit;
	} else {
		console.log('Please enter Yes or No.');
		readFile();
	}
}

//removes the AMPM division lines from our returned array
function removeAMPMLines(arr) {
	for (let i in arr) {
		if (arr[i].includes('at') == false) {//if the string 'at' is NOT in the returned array string, then it is NOT a TASK...
			arr.splice(arr.indexOf(arr[i]), 1);//and is deleted from the array.
		}
	}
}

//iterates over our array of strings, which right now are a series of long strings with the TASK, HR, MIN, and AMPM items still concatenated together, and splits them up into words and numbers
function splitEm (arr, arr2, arr3) {
	for (let i = 0; i < arr.length; i++) {
		arr2.push(arr[i].match(/[\w][\S]*/g));//pushes all word characters followed by a space to splitArrWords
		arr3.push(arr[i].match(/\d/g))//pushes all numbers to splitArrNums
	}
}

//removes the 'AM' or 'PM' string from the splitArrWords array and pushes it into an array called splitArrAMPM
function getAMPM (arr, arr2) {
	for (let i = 0; i < arr.length; i++) {//the first time I've used a nested series of for loops (just two in this case), as we must first iterate through the array of strings...
		for (let j = 0; j < arr[i].length; j++) {//to then iterate over the string characters themselves
			if (arr[i][j].match(/[AP]M/)) {//if the string characters match either AM or PM
				arr2.push(arr[i][j].charAt(arr[i][j].length -2).concat//push the second to last character of that string...
				(arr[i][j].charAt(arr[i][j].length - 1)));//concatenated with the last character of that string..
				arr[i].splice(arr[i].indexOf(arr[i][j]));//and then delete the character at that index. 
			}
		}arr[i] = (arr[i].join(' '));//finally the spaces are removed from the original splitArrWords array.
	}
}

//function that removes the remaining 'at' string from each of our TASK strings
function removeAt (arr) {
	for (let i = 0; i < arr.length; i++) {//iterate over the splitArrWords array
		arr[i] = arr[i].slice(0, -3);//and remove the ' at', which at this point is always the last three characters of the string.
	}
}

//a perhaps overly complicated function that iterates over our array of splitArrNums and doubles them up, simply pairing each number with the one following it.
function doubleUp (arr, arr2) {
	for (let i = 0; i < arr.length; i++) {//another nested for loop...
		for (let j = 0; j < arr[i].length; j++) {//that grabs each number..
			if (arr[i][j+1] !== undefined) {//and as long as it isn't undefined...
			arr2.push(arr[i][j].concat(arr[i][j+1]));//concatenates that number with the following number in the array, and then pushes it to a new array called doubleNums
			arr[i].splice(arr[i][j], 1);//all the while deleting each number from splitArrNums as it goes.
			}
		}
	}
}

//a crude function that takes doubleNums, iterates over it, and pushes every odd indexed number to an array called mins.
function getMins (arr, arr2) {
	for (let i = 0; i < arr.length; i++) {
		if (i !== 0 && i % 2 !== 0) {
			arr2.push(arr[i]);
		}
	}
}

//and another crude function that takes doubleNums, iterates over it, and pushes every even indexed number to an array called hrs.
function getHrs (arr, arr2) {
	for (let i = 0; i < arr.length; i++) {
		if (i == 0 || i % 2 == 0) {
			arr2.push(arr[i]);
		}
	}
}

//this is the essential function that starts to put the whole thing together, it takes our split up arrays, splitArrWords, hrs, mins, splitArrAMPM...
function fileInput(arr, arr2, arr3, arr4) {
	for (i in arr) {// iterates over splitArrWords
		let TASK = arr[i],// assigns the splitArrWords item to the variable TASK
			HR = arr2[i],// assigns the hrs item to the variable HR
			MIN =  arr3[i],// assigns the mins item to the variable MIN
			AMPM  = arr4[i];// assigns the splitArrAMPM item to the variable AMPM
		if (AMPM == 'AM') {//if the AMPM variable is the string 'AM'...
		currentRoutineAM.push(newRoutineItem(TASK, HR, MIN, AMPM));//push it to the global array, currentRoutineAM
		}
		if (AMPM == 'PM') {//and if the AMPM variable is the string 'PM'...
		currentRoutinePM.push(newRoutineItem(TASK, HR, MIN, AMPM));//push it to the global array, currentRoutinePM
		}
	}
} //note that this and everything else will fail if any of these arrays do not have the same amount of items in them.

//now to sorting the currentRoutine arrays according to time, keep in mind in the index.js file, we have already sorted them according to first MINS, and then HRS, using the native .sort method.
function twelveFirst(arr, arr2) {
	for (let i = arr.length - 1; i >= 0; i--) {//because the .sort method sorted the arrays numerically, but we wish to have 12 be the first hour of displayed in our list, we will iterate backwards over it
		//we go over it from the back because 12 is automatically sorted to the end of the array, and we simply wish to push the last item to the front
		if (arr[i].HR === '12') {//therefore if the HR property is equal to the string '12'...
			if (arr2 === undefined) {//and the item is not defined...
				continue;//we will then continue to ...
			}
			arr2.push(arr[i]);//push the item to the beginning of our currentRoutine array..
			arr.pop();//and delete it from the end.
		}
	}
}

//technically the currentRoutine arrays give us two finished arrays of objects, each object having the properties listed nicely and in order for us, but we wish to have it displaynicely to the console, so we'll have to make the whole thing prettier...
function prettier (arr, arr2, arr3) {//so we'll need to take each currentRoutine array, and push them to finishedArr arrays, which basically will concatenate our object's properties into a more readable format.
	for (let i in arr) {// so we iterate over our currentRoutine array...
		arr[i].HR = arr[i].HR.toString();// and make sure the HR properties are converted to Strings if they aren't already...
		if (arr[i].HR.length == 1) {// and if they only contain one number...
			arr[i].HR = '0' + arr[i].HR;//we add a '0' to the beginning of that number
		}
		if (arr[i].HR == '00') {//and if the user specified a military style time for midnight...
			arr[i].HR = '12';//we change it to American civilian time of '12'.
		}
		arr[i].MIN = arr[i].MIN.toString();//and we do the same for the MIN property.
		if (arr[i].MIN.length == 1) { 
			arr[i].MIN = '0' + arr[i].MIN;
		}
		if (arr[i].AMPM == 'AM'){//finally we check the object's AMPM property, and if it has the value of 'AM'...
			arr2.push(arr[i].TASK + ' at ' + arr[i].HR+ ':' + arr[i].MIN + arr[i].AMPM);//we push it to finalAMArr, with all it's properties concatenated with an 'at' between the TASK and the HR string values
		}
		if (arr[i].AMPM == 'PM') {//and do the same for 'PM' and finalPMArr.
			arr3.push(arr[i].TASK + ' at ' + arr[i].HR+ ':' + arr[i].MIN + arr[i].AMPM);
		}
	}
}

//function that prompts the user to create a To Do List Item
//for further functionality we may want to nest a function here that will prompt the user to enter numbers between 1 and 12 for hours, and 0 and 59 for minutes...
function getUserInput (arr1, arr2) {
    let TASK = prompt('What would you like to do?: '),
    	HR = Number(prompt('At what Hour?(double digits): ')),
    	MIN = Number(prompt('And Minutes?(double digits): ')),
    	AMPM = prompt('AM or PM?: ').toUpperCase(),
		newItem = newRoutineItem(TASK, HR, MIN, AMPM);
	if (newItem.AMPM == 'AM') {// if the user specified 'AM' for the AMPM property...
    	arr1.push(newItem);// then we push that created object to the currentRoutineAM array.
	}
	if (newItem.AMPM == 'PM') {// otherwise if they specified 'PM'...
    	arr2.push(newItem);// then we push that created object to the currentRoutinePM array.
	}
}

//the first prompt the user will see after the prompt the retrieve an existing ToDoList .txt file is this, it asks them if they'd like to add to the list
function firstPrompt (arr1, arr2) {
	let makeItem = prompt('Would you like to add to your List?: ');
	if (makeItem == 'y' || makeItem == 'yes' || makeItem == 'Yes') {//if the user chooses to add an item to the list...
    	getUserInput(arr1, arr2);// then they are asked to make a To Do List item through this aforementioned function.
	} else if (makeItem == 'n' || makeItem == 'no' || makeItem == 'No') {//if the user chooses not to do so...
    	console.log('Compiling List ...');//then we just tell them we're 'compiling' their list and continue with our program.
	} else {//if they don't answer either yes or no...
    	console.error('Please answer yes or no.');//we tell them to play our game again, cuz we're controlling freaks like that.
    	firstPrompt();//and recursively call our function in a never ending loop until they play the game as we intended it.
	}
}

//this function allows the user to create as many To Do list items as they like
function makeAnother(arr1, arr2) {
	let again = prompt('Add another Item to your To Do List?: ')
	if (again == 'y' || again == 'yes' || again == 'Yes') {// if they'd like to contiinue making list items...
    	getUserInput(arr1, arr2);//we once again run the program that allows them to do so..
    	makeAnother(arr1, arr2);// and recursively call this function as well until the user answers otherwise.
	} else if (again == 'n' || again == 'no' || again == 'No') {//if the user wishes to no longer create list items
    	console.log('Compiling List ...');//rather than being a dick and recursively asking them to play an infinite input loop game, we take pity on their plight, and allow them to continue.
	} else {//but not if they don't answer yes or no..then we trap them, once again, in an infinite loop until they play the game the way we intended them to...
    	console.error('Please answer yes or no');
    	makeAnother(arr1, arr2);
	}
}

//here we prompt the user if they'd like to now delete an item from their list.
function removeIt(arr, arr2, removeFunc) {
	let removePrompt = prompt('Remove an Item from your List?: ');
	if (removePrompt == 'Y' || 
		removePrompt == 'y' || 
		removePrompt == 'yes' || 
		removePrompt == 'YES') {//if they'd llike to remove an item from their list...
				removeFunc(arr, arr2);//then we run removeItems function and..
				removeAnother();//ask them if they'd like to remove another
	} else {
		console.log('Compiling List ...');//otherwise we continue with the program, note that they will be asked to remove an item one more time after this no matter what.
	}
}

//this function then prompts the user which item they'd like to remove, first specifying the TASK, and then whether or not it is in their AM or PM itinerary.
function removeItems(arr, arr2) {
	let whichOne = prompt('What Item?: ');
	let isAMPM = prompt('AM or PM?: ');
			for (let i in arr) {//it then iterates over the currentRoutineAM array...
				if (arr[i].TASK == whichOne && arr[i].AMPM == isAMPM) {//and matches the TASK and AMPM properties before..
					arr.splice(i, 1);//deleting that object.
				}
			for (let i in arr2) {//same for currentRoutinePM.
				if (arr2[i].TASK == whichOne && arr2[i].AMPM == isAMPM) {
					arr2.splice(i, 1);
				}
			}
			}
}

//this function recursively allows the user to remove as many items from their To Do List as they'd like.
function removeAnother() {
	let again = prompt('Remove another Item from your To Do List?: ')
	if (again == 'y' || again == 'yes' || again == 'Yes') {//if the user would like to remove an item...
		removeItems(currentRoutineAM, currentRoutinePM);//we run the aforementioned removeItems function.
		removeAnother();//and recursively ask them over and over again until they don't answer yes.
	} else if (again == 'n' || again == 'no' || again == 'No') {//once they answer no...
		console.log('Compiling List ...');//we allow the program to continue.
	} else {//but not if they don't answer yes or no.
		console.log('Please answer yes or no');
		removeAnother();
	}
}

//from what I've gathered there is probably an easier way to do this, but essentially the following function takes the current time, which is defined up above, and converts it to civilian American time format.
function getTime (now) {
	if (now > 12) {
		now -= 12;
		if (now < 1) {
			now = '12';
			}
		if (now < 10 && now > 0) {
			now = '0' + now;
		}
		if (currentMinutes < 10) {
			currentMinutes = '0' + currentMinutes;
		}
		return now +':' + currentMinutes + 'PM';
	} if (now < 1) {
		now = '12';
	}
	    if (now < 10) {
			now = '0' + now;
		}
		if (currentMinutes < 10 && currentMinutes !== '00') {
			currentMinutes = '0' + currentMinutes;
		}
		return now + ':' + currentMinutes + 'AM';
}

// this function alerts the user of the current time, and if the current hour and the hour property of our task in our to do list match, then we display to the user which tasks they should complete this hour
// note below that the hour numbers are found from character indexes within the string of our finishedArr arrays
function alertMe (arr, time) {
	for (let i in arr) {
		if (arr[i].charAt(arr[i].length - 7) == time.charAt(0) && 
		arr[i].charAt(arr[i].length - 6) == time.charAt(1) && 
		arr[i].charAt(arr[i].length -2) == time.charAt(5)) {
			console.log("This Hour's Tasks: " + arr[i]);
		}
	}
}


//lastly we prompt the user if they would like to save their list as a txt file
//on further inspection, another added functionality would be to write this file to a subdirectory, which our readFile function could also read from...
function writeIt(finishedArrString) {
	let writePrompt = prompt('Would you like to save your list?: ');
	if (writePrompt == 'y' || writePrompt == 'yes' || writePrompt == 'Yes') {//if the user would like to save their list as a txt file...
		let fileName = prompt('What would you like to name your file?: ');//then we prompt them what they would like to call it..
		fs.writeFile(fileName + '.txt', finishedArrString, () => {//and actually save the file as .txt...
			console.log(fileName + '.txt was saved.');//and we don't leave them in the dark about what just happened.
		});
	}else if (writePrompt == 'n' || writePrompt == 'no' || writePrompt == 'No') {//otherwise if they didn't want to back things up cuz they stupid...
		console.log('List not saved.');//we let them know they stupid.
	} else {//otherwise, once again, we tell them who is in control.
		console.log('Please answer Yes or No.');//and tell them to try again.
		writeIt();//do it again, bitch.
	}
}

//send it off to index.js for further processing...
module.exports = {
	currentRoutineAM,
	currentRoutinePM,
	twelvesArrAM,
	twelvesArrPM,
	finishedAMArr,
	finishedPMArr,
	newRoutineItem,
	readFile,
	removeAMPMLines,
	splitEm,
	getAMPM,
	removeAt,
	doubleUp,
	getMins,
	getHrs,
	fileInput,
	twelveFirst,
	prettier,
	getUserInput,
	firstPrompt,
	makeAnother,
	removeIt,
	removeItems,
	removeAnother,
	getTime,
	alertMe,
	writeIt }