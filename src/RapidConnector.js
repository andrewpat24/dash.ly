import $ from 'jquery';
import rapid from 'rapid-io';

var GameSession;

var API_KEY = "NDA1OWE0MWo1b3AzYm41LnJhcGlkLmlv";
var gameId = 1;
var clientPlayer = "Harjit";
var currentLev = 1;
var currentWordSet;
const rapidClient = rapid.createClient(API_KEY);
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
export function GetPlayers()
{
	return GameSession.players;
}

export function SetPlayerName(name)
{
	clientPlayer = name;
	return clientPlayer;
}

//returns game session object. in case you need something. let me know if you need something that I am not offering
//we will eventually want to stray away from allowing access to the entire game...
export function GetGameSession()
{


	return GameSession;
}

export function GetPlayer(player)
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
export function GetPoints(player)
{
	var p = GetPlayer(player);
	return p.points;
}

export function AddPoints(player, points)
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

export function SubtractPoints(player, points)
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

export function LevelUp(player)
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

export function LevelDown(player)
{
	var p = GetPlayer(player);
	var name = p.name;
	if(currentLev > 1){
		currentLev -= 1;

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

export function setGameSession(session){
	GameSession = session;
	currentLev = GetPlayer(clientPlayer).level;
	// if(currentLev > 1){
	// 	currentLev = 1;
	// }
	UpdateWordFilterSubscription();
}

export function setWordSet(words){
	currentWordSet = [];
	for(var index=0; index<words.length; index++)
	{
		var word = words[index];
		currentWordSet.push(word);
	}
}

export function UpdateWordFilterSubscription()
{
	if(wordSubscription != null){
		wordSubscription.unsubscribe();
	}

	wordSubscription = rapidClient.collection("List3")
		.document("level"+currentLev)
		.subscribe(words => {
			setWordSet(words.body.words)
		});
}
//
// export function SetClientPlayer(name)
// {
// 	clientPlayer = name;
// 	p = GetPlayer(clientPlayer);
// 	UpdateWordFilterSubscription();
// }

export function UpdateGameOnSubscription()
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

export function GetWords()
{
	
	return currentWordSet;
}

$(function(){

	UpdateGameOnSubscription();
});
