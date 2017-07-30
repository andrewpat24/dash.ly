/*
var GameSession = {
	"players" : [
		"Joe" : {
			"name": "Joe",
			"ready": false,
			"level": 1,
			"points": 0
		},
		"Harjit" : {
			"name": "Harjit"
			"ready": false,
			"level": 1,
			"points": 0
		},
		"Bhavesh" : {
			"name": "Bhavesh",
			"ready": false,
			"level": 1,
			"points": 0
		},
		"Andrew" : {
			"name": "Andrew",
			"ready": false,
			"level": 1,
			"points": 0
		}
	],
	"started": false,
	"completed": false,
	"startCounter" : 5

}
*/

var GameSession;
var L1Words = ["are", "ate", "rat", "tar", "pin", "tap", "ski", "sky"];
var L2Words = ["tree", "neat", "tear", "pear", "trap", "prem", "barn", "scar"];
var L3Words = ["burnt", "meant", "paint", "braid", "learn", "rapid", "drear", "point"];
var L4Words = ["parent", "number", "corner", "reader", "seeder", "teeter", "andrew", "harjit", "joseph"];
var L5Words = ["Bhavesh", "letters", "slaters", "columns", "monster", "pranker"];

var API_KEY = "NDA1OWE0MWo1b3AzYm41LnJhcGlkLmlv";
var gameId = 1;
var clientPlayer = "Harjit";
var currentLev = 1;
var currentWordSet;
const rapidClient = Rapid.createClient(API_KEY);
var gameSubscription;
var wordSubscription;

/**
Create Game Session

GetPlayers()

GetScore(player)

GetWords(level)

ChangeLevel(player, level)

LevelUp(player)

LevelDown(player)

ChangePoints(player, points)

AddPoints(player, points)

SubtractPoints(player, points)


Collections to suscribe to: Game, Words
**/

//Returns the array of player objects and everything in them
function GetPlayers()
{
	return GameSession.players;
}

function SetPlayerName(name)
{
	clientPlayer = name;
	return clientPlayer;
}

//returns game session object. in case you need something. let me know if you need something that I am not offering
//we will eventually want to stray away from allowing access to the entire game...
function GetGameSession()
{
	return GameSession;
}

function GetPlayer(player)
{

	if(player.points != null)
	{
		return player;
	}else
	{
		return GetPlayers()[player];
	}
}

//get scores for a specific player by name
function GetPoints(player)
{
	var p = GetPlayer(player);
	return p.points;
}

function AddPoints(player, points)
{
	var p = GetPlayer(player);
	var name = p.name;
	if(currentLev < 5){
		currentLev += 1;

		rapidClient.collection('Game')
  		.document('Test')
  			.execute(doc => {
  				doc.body.players[name].points += points;
  				return doc.body;
  			},success => {
  				return GetPlayer(name);
  			});
	}
}

function SubtractPoints(player, points)
{
	var p = GetPlayer(player);
	var name = p.name;
	rapidClient.collection('Game')
  	.document('Test')
  		.execute(doc => {
  			doc.body.players[name].points -= points;
  			if(doc.body.players[name].points < 0){
  				doc.body.players[name].points = 0;
  			}
  			return doc.body;
  		},success => {
  			return GetPlayer(name);
  		});
}

function LevelUp(player)
{
	var p = GetPlayer(player);
	var name = p.name;
	if(currentLev < 5){
		currentLev += 1;

		rapidClient.collection('Game')
  		.document('Test')
  			.execute(doc => {
  				doc.body.players[name].level += 1;
  				currentLev = doc.body.players[name].level;
  				return doc.body;
  			},success => {
  				UpdateWordFilterSubscription();
  				return GetPlayer(name);
  			});
	}

}

function LevelDown(player)
{
	var p = GetPlayer(player);
	var name = p.name;
	if(currentLev < 5){
		currentLev += 1;

		rapidClient.collection('Game')
  		.document('Test')
  			.execute(doc => {
  				doc.body.players[name].level -= 1;
  				currentLev = doc.body.players[name].level;
  				return doc.body;
  			},success => {
  				UpdateWordFilterSubscription();
  				return GetPlayer(name);
  			});
	}

}

function setGameSession(session){
	GameSession = session;
	currentLev = GetPlayer(clientPlayer).level;
	UpdateWordFilterSubscription();
}

function setWordSet(words){
	currentWordSet = [];
	for(index in words)
	{
		var wordDoc = words[index];
		currentWordSet.push(wordDoc.body.word);
	}
}

function UpdateWordFilterSubscription()
{
	if(wordSubscription != null){
		wordSubscription.unsubscribe();
	}

	wordSubscription = rapidClient.collection("List")
		.filter({level: currentLev})
		.subscribe(words => {
			setWordSet(words)
		});
}
function UpdateGameOnSubscription()
{

	if(gameSubscription != null){
		gameSubscription.unsubscribe();
	}

	gameSubscription = rapidClient.collection("Game")
		.document("Test")
		.subscribe(game =>{
			setGameSession(game.body);
		});


}

function GetWords()
{
	return currentWordSet;
}

$(function(){

	UpdateGameOnSubscription();
});
