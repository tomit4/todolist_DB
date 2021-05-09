This To Do List Application is a simple JavaScript application that utlizies NodeJS and various modules to
facilitate teaching myself the basics of client/server side web based interfaces as well as best practices when coding.
This application allows the user to create a To Do List that they can save to their local computer or to a server, facilitated
through RethinkDB.

In order to run this program on your own computer, please clone the files from this repository to a directory of your choosing.
Once you have cloned the files, you will need a few simple development tools to utilize the application and test its functionality.

Of course you will need NodeJS, as this is a terminal based application.
From the Command Line install NodeJS and its package manager, NPM.
Since I am using Manjaro on my own system, I will be using the Arch based pacman in the following examples:
If using an Arch based Linux Distribution, run the following commands to install NodeJS and NPM:

sudo pacman -S nodejs

sudo pacman -S npm

Once done, use npm to install the following modules:

npm install prompt-sync

npm install rethinkdb

You will also need to install rethinkdb, so please visit rethinkdb's website and follow their installation instructions:

https://rethinkdb.com/docs/install/

Once all of these have been installed you are pretty much ready to go. Open up two terminal windows as well as your favorite
web browser.

In the first terminal run the following command:

rethinkdb

In your web browser, input the following text in your search field to open up port 8080, from where rethinkdb is running a database on
your local server:

localhost:8080

Lastly, from your second terminal window, run the following command to intialize the to do list app:

node index.js

You will then be prompted if you want to import your list file, I have taken the liberty of providing you with a sample to do list,
when prompted if you'd like to import this list, type 'yes', and then the name of the file, in this case it would be:

samplelist

Please feel free to play around with this very basic application.
Enjoy, and, as always, thanks for reading.
