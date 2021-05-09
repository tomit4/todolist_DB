/*The following code includes the functionality that allows the user to push an existing To Do List
to a basic RethinkDB database.  Due to this being my first attempt at creating/utilizing databases, it's functionality is very crude.
As of right now, the To Do List is inserted in no particular order, although I suspect this is easily solved by a rethinkDB command
that I have yet to come across.

This is also my first experimentation with promises, which will most likely be apparent to any coder/programmer more experienced than myself.
I know that rethinkdb's connection method returns a promise given certain conditions, but like the ordering function referenced beforehand,
it is a method with which I am still getting familiar with.

The use of promises allowed me to simplify my code.  Previously all of the same functionality created in this file was stored within a single function
called saveToDB, which, while taking up less lines of code, had far too much indentation, indicating an overly complex function that was trying to do too much/be too many things.

Per the recommendations of my far more experienced peers, I spent some time learning the basics of the Promise Syntax, which allowed me to divide up my savetoDB function
into multiple functions listed below, and also add some facets to the functionality of the program itself.

It obviously could be more syntactically shortened using more functionality from RethinkDB and it's native query language, as well as the use of the Promise.all method.
But nevertheless, I felt that this was a good point to further document the results and push it to Github.
*/

const r = require('rethinkdb');//npm module that imports rethinkdb and allows use of the RQL.
const prompt = require('prompt-sync')(); //npm module that allows a somewhat intuitive user prompt interface at the terminal,
//I am currently investigating NodeJS's native prompt module, which I'm assuming is somehow better, but perhaps less intuitive than prompt-sync.

let connectPromise; //global variable that initializes the connection promise object, as long as the user indicates they wish to connect to rethink and the connection is a success.
let dbName; //global variable that holds the user's response to a query that asks for the database name
let connection;//global variable that holds the reference to the open rethinkdb connection


function savetoDB() {
    connectPromise = new Promise((res) => { //our first promise ever written.  allows chaining of .then .catch and .finally methods.
        let connectPrompt = prompt('Save to RethinkDB?: ');//user wants to save to the database?
        if (connectPrompt == 'y' || connectPrompt == 'yes' || connectPrompt == 'Yes') { //if yes...
            res(//resolve the Promise to..
                r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {//connect to RethinkDB
                if (err) console.log(err);//if there's an error, log it.
                connection = conn;//otherwise assign the connection to the global variable, connection, so we can reference it in other functions.
                })
            )
            console.log('Connected to RethinkDB');//let the user know what's happened.
        } else {//if the user doesn't wish to connect to the database...
            console.log('List not Saved to RethinkDB');//then the user didn't backup their data like a dumbass.
            return;
        }
    });
}

function promptForDB() {//does the user wish to create a new db? or use an existing one.
	let createDB = prompt('Create a new database?: ');
	if (createDB == 'y' || createDB == 'yes' || createDB == 'Yes') {//if they do wish to create a new db...
		createDBPrompt();//initialize the createDBPrompt function
	} else chooseDB();//otherwise initialize the chooseDB function
}

function createDBPrompt() {//asks the user to Name their new db
	connectPromise.then(() => {//our first promise chain, using .then will make sure that first connectPromise has resolved, and then do the following:
			dbName = prompt('Name your database: ');//the global variable dbName is set to the value returned by the user
			r.dbCreate(`${dbName}`).run(connection, function (err, res) {//rethink function that creates the new DB
				if (err) console.log(err);
				else if (res) console.log('Database Created.');//and lets the user know it was successful.
			});
		}
	);
}

function chooseDB() {//otherwise the user is asked to provide the name of the existing db
	connectPromise.then(() => {//and a different promise chain is followed ...
		dbName = prompt('Name of your database?: ');//where the user provides us with the name of the existing db
	});
}

function insertAMList(arr1) {//this is where the magic happens, and was the best part of the saveToDB function I initially wrote.
	if (arr1.length > 0) {//if the array of objects is greater than 0, i.e. the array exists and isn't empty...
		r.db(`${dbName}`).tableCreate('AM').run(connection, function (err, res) {//create a table called 'AM'
			if (err) console.log(err);
			else if (res) {//and as long as everything was successful... 
				for (let i = 0; i < arr1.length; i++) {//loop through the array
					r.db(`${dbName}`).table('AM')//find the database name and the 'AM' table within...
					.insert([arr1[i]])//and insert each item of the array one by one..
					.run(connection, function (err) {//and run the command over the connection
						if (err) console.log(err);
					})
				}
			console.log('AM Table Created');//let the user know what the hell is going on...
			}
		});
	}
}

function insertPMList(arr1) {//same as above, but for pm, only reason to do this is to create a PM table as well, there might be a better way to do this...
	if (arr1.length > 0) {
		r.db(`${dbName}`).tableCreate('PM').run(connection, function (err, res) {
			if (err) console.log(err);
			else if (res) {
				for (let i = 0; i < arr1.length; i++) {
					r.db(`${dbName}`).table('PM')
					.insert([arr1[i]])
					.run(connection, function (err) {
						if (err) console.log(err);
					})
				}
			console.log('PM Table Created');
			}
		});
	}
}

function pushToDB(arr1, arr2) {//for convenience, we wrap the remaining promise chain in a function, so that it is easily called from our index.js file.
	//Upon further inspection of the Promise.all method and also the Promise.allSettled method, these might be better tools for this job, nevertheless I am pleased with the syntax as of right now.
    connectPromise.then(() => {
        promptForDB();
    }).then(() => {
        insertAMList(arr1);
    }).then(() => {
        insertPMList(arr2);
    })
}

module.exports = {
    connectPromise,
    dbName,
    connection,
    savetoDB,
    pushToDB };