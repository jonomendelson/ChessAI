var DEPTH = 5;
var maxDepth = DEPTH;
var MOVE_TIME = 15;

var tree = {};
var checkTree = {};
var progress = 0;

var counter = 0;

function generateAllMoves(currPieces, side){  //replace with generateAllMoves(pieces)
	var possibleMoves = [];
	for(var i = 0; i < currPieces.length; i++){
		if(currPieces[i].side == side){
			for(var xPos = 0; xPos <= 7; xPos++){
				for(var yPos = 0; yPos <= 7; yPos++){
					if(isLegalMove(currPieces[i], xPos, yPos, side, currPieces, true)){
						possibleMoves.push({piece:currPieces[i], x:xPos, y:yPos, index: i});
					}
				}
			}
		}
	}	
	return possibleMoves;
}

/*function isCheck(currBoard){
	checkTree = {board: cloneBoard(currBoard), score: -5000, levelDeeper: []};
	fillTree(0, checkTree, 1, cloneBoard(currBoard), 1, -5000, 5000);
	var maxScore = -5000;
	for(var i = 0; i < checkTree.levelDeeper.length; i++){
		maxScore = Math.max(maxScore, checkTree.levelDeeper[i].score);
	}
	if(maxScore > 1000){
		return -1; //black in check
	}

	checkTree = {board: cloneBoard(currBoard), score: -5000, levelDeeper: []};
	fillTree(0, checkTree, 0, cloneBoard(currBoard), 1, -5000, 5000);
	var minScore = 5000;
	for(var i = 0; i < checkTree.levelDeeper.length; i++){
		minScore = Math.min(minScore, checkTree.levelDeeper[i].score);
	}
	if(minScore < -1000){
		return 1; //white in check
	}

	return 0;
}*/



function doBestMove(){
	var depthTimeout = window.setInterval(function(){maxDepth--; console.log("Reduced depth to save time.");}, MOVE_TIME*1000);

	progress = 0;
	counter = 0;

	tree = {board: cloneBoard(pieces), score: -5000, levelDeeper: [], alpha: -5000, beta: 5000};
	fillTree(0, tree, 1, cloneBoard(pieces));

	for(var i = 0; i < tree.levelDeeper.length; i++){
		if(isCheck(tree.levelDeeper[i].board) == -1){
			tree.levelDeeper[i].score += 0.5;
		}
	}

	window.clearInterval(depthTimeout);
	maxDepth = DEPTH;

	var maxScore = -5000;
	var index = 0;
	
	if(tree.levelDeeper.length == 0){
		alert("CHECKMATE - YOU WIN!");
	}else{
		for(var i = 0; i < tree.levelDeeper.length; i++){
			if(tree.levelDeeper[i].score > maxScore){
				maxScore = tree.levelDeeper[i].score;
				index = i;
			}
		}

		pieces = tree.levelDeeper[index].board;
		drawGrid(pieces);
	
		if(maxScore > 1000){
			alert("CHECKMATE - YOU LOSE!");
		}

		if(isCheck(cloneBoard(pieces)) == -1){
			alert("CHECK!");
		}
	}
}

//var tree = [{board:pieces, score: -5000, levelDeeper: []}, 

function fillTree(currDepth, objectRef, turn, currBoard){
	counter++;

	if(currDepth >= maxDepth || ((currDepth == maxDepth-1) && (counter > 400000))){
		objectRef.score = evalBoard(cloneBoard(objectRef.board));
		return objectRef.score;
	}	


	var possibleMoves = generateAllMoves(cloneBoard(currBoard), turn);

	if(currDepth == 1){
		progress++;
		console.log(progress + "/" + possibleMoves.length);
	}

	var currScore = 0;
	if(turn == 1){
		currScore = -5000;
	}else{
		currScore = 5000;
	}
	for(var move = 0; move < possibleMoves.length; move++){
		var newBoard = applyMove(possibleMoves[move].index, possibleMoves[move].x, possibleMoves[move].y, cloneBoard(objectRef.board));
		objectRef.levelDeeper.push({board: cloneBoard(newBoard), score: -5000, levelDeeper: [], alpha: objectRef.alpha, beta: objectRef.beta});
		var futureScore = fillTree(currDepth+1, objectRef.levelDeeper[objectRef.levelDeeper.length-1], Math.abs(turn-1), cloneBoard(newBoard));
		objectRef.levelDeeper[objectRef.levelDeeper.length-1].score = futureScore;

		if(turn == 1){
			currScore = Math.max(currScore, futureScore);
			objectRef.alpha = Math.max(objectRef.alpha, futureScore);
			if(futureScore >= objectRef.beta){
				//return currScore;
				return 6000;
			}
		}else{
			currScore = Math.min(currScore, futureScore);
			objectRef.beta = Math.min(objectRef.beta, futureScore);
			if(futureScore <= objectRef.alpha){
				//return currScore;
				return -6000;
			}
		}

		//objectRef.levelDeeper[objectRef.levelDeeper.length-1].alpha = objectRef.alpha;
		//objectRef.levelDeeper[objectRef.levelDeeper.length-1].beta = objectRef.beta;

	}
	if(currScore < -1000){
		return -6000;
	}else{
		return currScore;
	}
}

function doRandomMove(){
	possibleMoves = [];
	generateAllMoves();
	if(possibleMoves.length == 0){
		alert("No possible moves!");
	}else{
		var move = Math.floor(Math.random()*possibleMoves.length);
		var index = pieceAtIndex(possibleMoves[move].piece.x, possibleMoves[move].piece.y);
		movePiece(index, possibleMoves[move].x, possibleMoves[move].y);	
	}
}

function evalBoard(pieces){
	var score = 0;
	for(var i = 0; i < pieces.length; i++){
		if(pieces[i].type == "KING") score += (2*pieces[i].side-1)*2000;
		if(pieces[i].type == "QUEEN") score += (2*pieces[i].side-1)*9;
		if(pieces[i].type == "ROOK") score += (2*pieces[i].side-1)*5;
		if(pieces[i].type == "BISHOP") score += (2*pieces[i].side-1)*3;
		if(pieces[i].type == "KNIGHT") score += (2*pieces[i].side-1)*3;
		if(pieces[i].type == "PAWN") score += ((2*pieces[i].side-1)*1);
	}

/*	for(var i = 0; i < pieces.length; i++){
		var distance = Math.pow(Math.abs(pieces[i].x-4.5), 2)+Math.pow(Math.abs(pieces[i].y-4.5), 2);
		score += 0.02/distance;
	}*/

	return score;
}

function evalBoardCheck(pieces){
	var score = 0;
	for(var i = 0; i < pieces.length; i++){
		if(pieces[i].type == "KING") score += (2*pieces[i].side-1)*2000;
		if(pieces[i].type == "QUEEN") score += (2*pieces[i].side-1)*9;
		if(pieces[i].type == "ROOK") score += (2*pieces[i].side-1)*5;
		if(pieces[i].type == "BISHOP") score += (2*pieces[i].side-1)*3;
		if(pieces[i].type == "KNIGHT") score += (2*pieces[i].side-1)*3;
		if(pieces[i].type == "PAWN") score += ((2*pieces[i].side-1)*1);
	}

	return score;
}

