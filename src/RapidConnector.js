import $ from 'jquery';
import rapid from 'rapid-io';

var GameSession;
const MAX_PLAYERS = 4;
var API_KEY = "NDA1OWE0MWo1b3AzYm41LnJhcGlkLmlv";
var gameId = 1;
var clientPlayer = "Harjit";
var currentLev = 1;
var currentWordSet;
const rapidClient = rapid.createClient(API_KEY);
var gameSubscription;
var wordSubscription;

/**
Collections to suscribe to: Game, Words
**/
export function init(playerName, sessionName, callback){
	
	try{
		SetClientPlayer(playerName);
		JoinSession(sessionName);
		UpdateWordFilterSubscription();
	} catch(e){
		callback(e.message);
		return;
	}
	//callback('Session is full');
	callback(null);
}

export function JoinSession(sessionName){
	
	// Call a fetch() to see if session exists or not
	rapidClient.collection("Game")
	.document(sessionName)
	.fetch(session => {
		var name = clientPlayer;
		// create session 
		if(session === null){
							
			rapidClient.collection("Game")
			.document(sessionName)
			.mutate({
				"players": [{ "name":name, "level":1, "points": 0, "ready": false}],
				"started": false,
				"completed": false,
				"startCounter": 5
			})
			.then(
				function(){
					SetSubscription(sessionName);
				}
			);

		} else if(session.body.players.length <= MAX_PLAYERS){
			debugger;
			SetSubscription(sessionName);
		}else{
			// return an error and/or window.alert();
			window.alert("Session already full");
			
			return;
		}

	});
	
}
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

export function GetPlayer(playerName)
{		
	// Get the player from the list
	var returnPlayer = {}; 
	var index = 0;
	var players = GetPlayers();
	for(index in players){
		var player = players[index];

		if(player.name === playerName){
			returnPlayer = player;
			break;
		}
	}
	
	return { "id": index, "player": returnPlayer};
}

//get scores for a specific player by name
export function GetPoints(player)
{
	var p = GetPlayer(player).player;
	return p.points;
}

export function AddPoints(player, points)
{
	var p = GetPlayer(player).player;
	var name = p.name;
	if(currentLev < 5){
		currentLev += 1;

		rapidClient.collection('Game')
  		.document('Test')
  			.execute(doc => {
  				doc.body.players[name].points += points;
  				return doc.body;
  			},success => {
  				return GetPlayer(name).player;
  			});
	}
}

export function SubtractPoints(player, points)
{
	var p = GetPlayer(player).player;
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
  			return GetPlayer(name).player;
  		});
}

export function LevelUp(player)
{
	var p = GetPlayer(player).player;
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
  				return GetPlayer(name).player;
  			});
	}

}

export function LevelDown(player)
{
	var p = GetPlayer(player).player;
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
  				return GetPlayer(name).player;
  			});
	}

}

export function SetGameSession(session){
	// TODO: Check if max players already joined
	// If max players, throw error to user
	
	GameSession = session;
	currentLev = GetPlayer(clientPlayer).player.level;
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
export function SetClientPlayer(name)
{ 	clientPlayer = name;
 	//var p = GetPlayer(clientPlayer).player;
 	//UpdateWordFilterSubscription();
}

export function AddPlayerToGame(sessionName)
{
	//var index = GetPlayer(clientPlayer).id;
	rapidClient.collection('Game')
  		.document(sessionName)
  			.execute(doc => {
				if(doc.body.players.length < 4){
					  doc.body.players.push({name: clientPlayer, level: 1, points: 0, ready: false});
					  					  
					  if(doc.body.players.length == 4)
						{
							doc.body.started = true;
						}
					  return doc.body;
				}else{
					window.alert("Game is Full");
					return doc.body;
				}
  			},success => {
  				UpdateWordFilterSubscription();
  				return GetPlayer(clientPlayer).player;
			  });

}
// Set and Update
export function SetSubscription(sessionName)
{
	
			
	if(gameSubscription != null){
		gameSubscription.unsubscribe();
	}
	gameSubscription = rapidClient.collection("Game")
		.document(sessionName)
		.subscribe(game =>{
			SetGameSession(game.body);
	});
}

export function GetWords()
{
	
	return currentWordSet;
}

$(function(){
	window.JoinSession = JoinSession;
	window.GetGameSession = GetGameSession;
	//init();
	//SetSubscription();
});
