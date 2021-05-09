/*This To Do List Application is a simple JavaScript application that utlizies NodeJS and various modules to
assist in teaching myself the basics of client/server side web based interfaces as well as best practices when coding.
This application allows the user to create a To Do List that they can save to their local computer or to a server, facilitated
through RethinkDB.
*/


//this index file puts everything together and references both funcs.js and rethink.js
//it allows the user to create a to do list, reference an existing to do list, add and remove items from the to do list, as well as save the list to their local directory, and also to a database

//first we have to grab all our references...
const prompt = require('prompt-sync')();//a node module that prompts the user.
const fs = require('fs');//a native nodejs module that allows reading and writing files to the local directory.
const r = require('rethinkdb');//a npm module that allows this file to connect to RethinkDB and also use it's query language, RQL.
const currentDate = new Date();//used later in the program to get today's date.

const readlist = require("./funcs.js");//import our functions.
const rethink = require("./rethink.js");//import our database features.

//destructuring probably allows this to be less verbose, essentially all we're doing here is making the code a little less syntactically nightmarish.
//as discussed with my peers, this is probably better done by exporting functions/variables within a more localized scope so that it can be referenced by a single command or name.
let currentRoutineAM = readlist.currentRoutineAM;
    currentRoutinePM = readlist.currentRoutinePM;
    twelvesArrAM = readlist.twelvesArrAM;
    twelvesArrPM = readlist.twelvesArrPM;
    finishedAMArr = readlist.finishedAMArr;
    finishedPMArr = readlist.finishedPMArr;
    newRoutineItem = readlist.newRoutineItem,
    readFile = readlist.readFile, 
    removeAMPMLines = readlist.removeAMPMLines,
    splitEm = readlist.splitEm,
    getAMPM = readlist.getAMPM,
    removeAt = readlist.removeAt,
    doubleUp = readlist.doubleUp,
    getMins = readlist.getMins,
    getHrs = readlist.getHrs,
    fileInput = readlist.fileInput,
    twelveFirst = readlist.twelveFirst,
    prettier = readlist.prettier,
    getUserInput = readlist.getUserInput,
    firstPrompt = readlist.firstPrompt,
    makeAnother = readlist.makeAnother,
    removeIt = readlist.removeIt,
    removeItems = readlist.removeItems,
    removeAnother = readlist.removeAnother,
    getTime = readlist.getTime,
    alertMe = readlist.alertMe,
    currentHour = currentDate.getHours(),
    currentMinutes = currentDate.getMinutes(),
    currentTime = getTime(currentHour),
    writeIt = readlist.writeIt,
    connectPromise = rethink.connectPromise,
    dbName = rethink.dbName,
    connection = rethink.connection,
    savetoDB = rethink.savetoDB,
    pushToDB = rethink.pushToDB;


//for specifics on how the following functions work, please see the notation in the funcs.js file.

newRoutineItem();//we first define the rules of how a to do list item looks, ie we create an object constructor function here that creates
//a new object with TASK, HR, MIN, and AMPM properties.

let fileSplit = readFile().split('\n');//whatever strings were returned by the readFile function are then split into an array, divided up only when a new line is detected.

removeAMPMLines(fileSplit);//we then remove the AM PM demarcation lines.

const splitArrWords = [];//we create empty arrays to store the strings returned by splitEm function.
const splitArrNums = [];//and the same for the numbers

splitEm(fileSplit, splitArrWords, splitArrNums);

const splitArrAMPM = [];//and the same for AMPM returned by the getAMPM function.

getAMPM(splitArrWords, splitArrAMPM);

removeAt(splitArrWords);//and we remove the string 'at ' from the end of the splitArrWords strings.

const doubleNums = [];//and we create an empty array to store our doubled up numbers, which will become our HR and MIN properties later on.

doubleUp(splitArrNums, doubleNums);

const mins = [];//then we use some janky function to check whether the doubleNums array index is even or odd, and define them as either hrs or mins based off of their index number...

getMins(doubleNums, mins);//if it's odd, it's a minute.

const hrs = [];//yep, empty array for HR properties to be stored.

getHrs(doubleNums, hrs);//if it's even, it's an hr.

fileInput(splitArrWords, hrs, mins, splitArrAMPM);//then we take those arrays and assign them to their respective TASK, HR, MIN, and AMPM properties using the newRoutineItem function
//and push them to the currentRoutineAM and currentRoutinePM arrays respectively.

currentRoutineAM = currentRoutineAM.sort((a, b) => a.MIN - b.MIN);//we then sort them by minute...
currentRoutineAM = currentRoutineAM.sort((a, b) => a.HR - b.HR);//and then by hour...when I tried this by hour first, it demonstrated some stange behavior that didn't quite work right and I don't know why.

twelveFirst(currentRoutineAM);//then we push the items at midnight to a twelvesArr array.
twelveFirst(currentRoutinePM);//and same for the items at noon.

twelvesArrAM = twelvesArrAM.sort((a,b) => a.MIN - b.MIN);//and once again sort by minute so that the items with 12 as their HR property are still sorted acccording to minutes.
twelvesArrPM = twelvesArrPM.sort((a,b) => a.MIN - b.MIN);

currentRoutineAM = twelvesArrAM.concat(currentRoutineAM);//then we add the 12 items from the twelvesArr array back into the currentRoutine, with the 12s being displayed first finally.
currentRoutinePM = twelvesArrPM.concat(currentRoutinePM);

//as noted in funcs.js, it is important to note that at this point in our code, currentRoutineAM and currentRoutinePM are an array of todo list objects that are sorted according to time.  technically, for a very minimal application, this would be enough,
//but let's make our list a little more huamn readable by invoking our prettier function.

prettier(currentRoutineAM, finishedAMArr, finishedPMArr);//creates a nice string that adds the 'at' string in the middle. displaying our To Do List nicely for the user in the console.
prettier(currentRoutinePM, finishedAMArr, finishedPMArr);

//lastly, we create a finished array that contains the prettier list strings and concatenates them with demacation lines to differentiate them by AM or PM time allotment.
let finishedArr = (['------------------YOUR CURRENT LIST---------------------']).concat
(['-------------------------AM-----------------------------']).concat
(finishedAMArr).concat
(['-------------------------PM-----------------------------']).concat
(finishedPMArr).concat(['--------------------------------------------------------']);

//and then joins them into a single string with a new line break being the joinning factor.  this converts it finally from an array of prettier strings, to a list which can then be imported into a .txt file.
let finishedArrString = finishedArr.join('\n');

console.log(finishedArrString);//show this finished string to the user.

firstPrompt(currentRoutineAM, currentRoutinePM);//prompts the user if they would like to add to their list.

makeAnother(currentRoutineAM, currentRoutinePM);//recursively asks the user if they would like to continue to add to their list until they answer 'no.'


currentRoutineAM = currentRoutineAM.sort((a, b) => a.MIN - b.MIN);//once the user has completed adding todolist items, the currentRoutine arrays need to be resorted...
currentRoutineAM = currentRoutineAM.sort((a, b) => a.HR - b.HR);

currentRoutinePM = currentRoutinePM.sort((a, b) => a.MIN - b.MIN);
currentRoutinePM = currentRoutinePM.sort((a, b) => a.HR - b.HR);

twelvesArrAM = [];
twelvesArrPM = [];

twelveFirst(currentRoutineAM, twelvesArrAM);
twelveFirst(currentRoutinePM, twelvesArrPM);

twelvesArrAM = twelvesArrAM.sort((a,b) => a.MIN - b.MIN);
twelvesArrPM = twelvesArrPM.sort((a,b) => a.MIN - b.MIN);

currentRoutineAM = twelvesArrAM.concat(currentRoutineAM);
currentRoutinePM = twelvesArrPM.concat(currentRoutinePM);

finishedAMArr = [];
finishedPMArr = [];

prettier(currentRoutineAM, finishedAMArr, finishedPMArr);
prettier(currentRoutinePM, finishedAMArr, finishedPMArr);

finishedArr = (['------------------YOUR CURRENT LIST---------------------']).concat
(['-------------------------AM-----------------------------']).concat
(finishedAMArr).concat
(['-------------------------PM-----------------------------']).concat
(finishedPMArr).concat(['--------------------------------------------------------']);

finishedArrString = finishedArr.join('\n');//and we redisplay the resorted list string

console.log(finishedArrString);//and show the changes to the user.

removeIt(currentRoutineAM, currentRoutinePM, removeItems);//we then prompt the user if they would like to remove any items from their to do list.

removeAnother();//and recursively ask if they'd like to remove another item until they answer 'no.'

//unlike adding items above, which would put our list out of order, deleting items leaves the list ordered, and so only certain functions have to be recalled.
finishedAMArr = [];
finishedPMArr = [];

prettier(currentRoutineAM, finishedAMArr, finishedPMArr);
prettier(currentRoutinePM, finishedAMArr, finishedPMArr);

finishedArr = (['------------------YOUR CURRENT LIST---------------------']).concat
(['-------------------------AM-----------------------------']).concat
(finishedAMArr).concat
(['-------------------------PM-----------------------------']).concat
(finishedPMArr).concat(['--------------------------------------------------------']);

finishedArrString = finishedArr.join('\n');

//uncomment the following two lines if you wish to see the state of the currentRoutine arrays, this is useful to see what will be pushed to our database.
// console.log(currentRoutineAM);
// console.log(currentRoutinePM);

console.log(finishedArrString);//display the final string that is the user's To Do List.
alertMe(finishedArr, currentTime);//alert the user of what tasks have to be accomplished this hour.
console.log('The Current Time is: ' + currentTime);//and let them know the current time.

writeIt(finishedArrString);//prompt the user if they would like to save their file as a .txt file in their local directory.

savetoDB();//prompt the user if they would like to save their list to the database.
pushToDB(currentRoutineAM, currentRoutinePM);//and if yes, the currentRoutine Arrays are pushed to the database as AM and PM tables.

//other functionalities to consider are ordering the tables in the database, allowing the user to save the .txt list to a specific subdirectory instead of the local one
//other functionalities from rethinkdb that we have yet to explore should...be explored.