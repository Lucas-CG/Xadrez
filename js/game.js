var canvas = document.getElementById('renderCanvas');
var engine = new BABYLON.Engine(canvas, true);
var scene;
var chess;



//constantes
var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
var COLUMNS = "abcdefgh".split('');
var REFERENCE_POSITION = new BABYLON.Vector3(-3.975, 0.6, -3.975) //posição da torre branca da esquerda (a1)


//manutenção do estado do jogo
var selectedPiece = null;
var selectedPieceType = null; //identificação do tipo de peça
var highlights = [];
var chess;
var blackPieceMaterial;
var whitePieceMaterial;
var chosenPromotion = 'q';


//configuráveis
var texture = localStorage.getItem("texture") === null ? "standard" : localStorage.getItem("texture"); //definir no menu principal


//comprimento do movimento: 1,125
//x: esquerda negativa, direita positiva
//z: para trás negativo, para frente positivo

function chooseTexture() {

	swal({   title: "Cor do conjunto das peças",   text: "Escolha a cor do conjunto das peças!",   type: "input",   showCancelButton: true,   closeOnConfirm: false,   animation: "slide-from-top",   inputPlaceholder: "Digite padrão para o conjunto padrão, ou madeira para o conjunto de madeira." }, function(inputValue, Callback){   if (inputValue === false) return false;      if (inputValue === "") {     swal.showInputError("É necessário escrever algo!");     return false   }   if (inputValue === 'padrão') texture === "standard"; Callback();      if (inputValue === 'madeira') texture === 'wooden'; Callback();      swal("OK!", "You wrote: " + inputValue, "success"); });

}


window.addEventListener('DOMContentLoaded', function(){	init();
}, false);

window.addEventListener('keyup',function(event){if (event.keyCode == 82){     chooseTexture(); }});

function init() {

	//começar a registrar o jogo
	chess = new Chess();
	swal("Bem-vindo(a)!", "Este é o Xadrez! Este jogo é para dois jogadores locais. Para jogar, basta clicar em uma peça e visualizar quais movimentos são possiveis de ser feitos. \n \n Você também pode rodar a câmera para visualizar o jogo clicando e arrastando o mouse e escolher a cor das peças apertando R. \n \n Este jogo é de autoria de Lucas de Carvalho Gomes, aluno de Engenharia de Computação e Informação da UFRJ em 2015.2.")

	scene = createScene();

	engine.runRenderLoop(function() {
		scene.render();
	});




}

window.addEventListener('resize', function() {

	engine.resize();

});



//Funções usadas

function createScene() {

	var scene = new BABYLON.Scene(engine);

	scene.clearColor = new BABYLON.Color3(0.35, 0.35, 0.35);

	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);

	camera.setTarget(BABYLON.Vector3.Zero());

	camera.attachControl(canvas, false);

	var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

	createBoard(scene);
	//criando o tabuleiro
	//parâmetros

	createChessSet(texture, scene);


	scene.onPointerDown = function(evt, pickResult) {

		if (pickResult.hit && !chess.game_over()) {

			var clickedMesh = pickResult.pickedMesh;

			switch(clickedMesh.name) {

				case "highlight":

					
					//encontrar a posicao do highlight
					//mover a peça para o highlight com animacao
					originSquare = coordsToPosition(selectedPiece.position);
					var pastX = selectedPiece.position.x;
					var pastZ = selectedPiece.position.z;
					destinationSquare = coordsToPosition(clickedMesh.position);

					//captura comum


					selectedPiece.position.x = clickedMesh.position.x;
					selectedPiece.position.z = clickedMesh.position.z;
					var promotionX = clickedMesh.position.x;
					var promotionZ = clickedMesh.position.z;
					
					if(coordsToPosition(clickedMesh.position) === 'c1' && selectedPieceType === 'Wking') {

						//roque grande (O-O-O)

						chess.move("O-O-O");

						for (var meshID = 0; meshID < scene.meshes.length; meshID++) {

							var castlingCoords = positionToCoords('a1', "rook");

							if (scene.meshes[meshID].position.equals(castlingCoords)) {

								
								var rookNewPosition = positionToCoords('d1', "rook");
								scene.meshes[meshID].position.x = rookNewPosition.x;
								scene.meshes[meshID].position.z = rookNewPosition.z;

								break;

							}

						}						

					}

					if(coordsToPosition(clickedMesh.position) === 'g1' && selectedPieceType === 'Wking'){

						//roque pequeno (O-O)

						chess.move("O-O");

						for (var meshID = 0; meshID < scene.meshes.length; meshID++) {

							var castlingCoords = positionToCoords('h1', "rook");
							if (scene.meshes[meshID].position.equals(castlingCoords)) {

								var rookNewPosition = positionToCoords('f1', "rook");
								scene.meshes[meshID].position.x = rookNewPosition.x;
								scene.meshes[meshID].position.z = rookNewPosition.z;

								break;

							}

						}							

					}

					if(coordsToPosition(clickedMesh.position) === 'c8' && selectedPieceType === 'Bking') {

						//roque grande (O-O-O)

						chess.move("O-O-O");

						for (var meshID = 0; meshID < scene.meshes.length; meshID++) {

							var castlingCoords = positionToCoords('a8', "rook");

							if (scene.meshes[meshID].position.equals(castlingCoords)) {

								
								var rookNewPosition = positionToCoords('d8', "rook");
								scene.meshes[meshID].position.x = rookNewPosition.x;
								scene.meshes[meshID].position.z = rookNewPosition.z;

								break;

							}

						}						

					}

					if(coordsToPosition(clickedMesh.position) === 'g8' && selectedPieceType === 'Bking'){

						//roque pequeno (O-O)

						chess.move("O-O");

						for (var meshID = 0; meshID < scene.meshes.length; meshID++) {

							var castlingCoords = positionToCoords('h8', "rook");
							if (scene.meshes[meshID].position.equals(castlingCoords)) {

								var rookNewPosition = positionToCoords('f8', "rook");
								scene.meshes[meshID].position.x = rookNewPosition.x;
								scene.meshes[meshID].position.z = rookNewPosition.z;

								break;

							}

						}							

					}

					chess.move({from: originSquare, to: destinationSquare, promotion: chosenPromotion});

					//captura comum
					for (var meshID = 0; meshID < scene.meshes.length; meshID++) {
						var cantBeDeleted = [selectedPiece.name, "Chess Board", "highlight"];
						if(cantBeDeleted.indexOf(scene.meshes[meshID].name) === -1 && scene.meshes[meshID].position.x === clickedMesh.position.x && scene.meshes[meshID].position.z === clickedMesh.position.z) {

							console.log(scene.meshes[meshID].name);
							scene.meshes[meshID].dispose();

						}

					}		

					//captura en passant

					if (selectedPieceType.slice(1) === "pawn" && pastX != promotionX) {

						if (pastX != promotionX) {

							//se a posição em X mudou, uma captura en passant aconteceu

							//temos que remover a peça da linha abaixo da posição atual do peão
							//que necessariamente é um peão

							capturedColumn = destinationSquare.charAt(0);
							capturedLine = "" + ( ( + destinationSquare.charAt(1) ) - 1);

							capturedPosition = capturedColumn + capturedLine; //"h5", por exemplo
							capturedCoords = positionToCoords(capturedPosition, "pawn");

							for (var meshID = 0; meshID < scene.meshes.length; meshID++) {

								if (scene.meshes[meshID].position.x === capturedCoords.x && scene.meshes[meshID].position.y === capturedCoords.y && scene.meshes[meshID].position.z === capturedCoords.z) {

									scene.meshes[meshID].dispose();
									break;

								}

							}

						}

					}

					//promoção de peão: assumir que é para rainha

					if (destinationSquare.charAt(1) === '8' && selectedPieceType === "Wpawn"){

						var promotedQueen = BABYLON.SceneLoader.ImportMesh("Cylinder", "models/", "rainha.babylon", scene, function(newMeshes) {
							promotedQueen = newMeshes[0];
							promotedQueen.name = "Wqueen";
							promotedQueen.position.x = promotionX;
							promotedQueen.position.y = 0.5;
							promotedQueen.position.z = promotionZ;
							promotedQueen.scaling.x = 0.30;
							promotedQueen.scaling.y = 0.25;
							promotedQueen.scaling.z = 0.30;
							promotedQueen.material = whitePieceMaterial;

						});

						selectedPieceType = null;
						selectedPiece.dispose();
					}

					if (destinationSquare.charAt(1) === '0' && selectedPieceType === "Bpawn"){

						moveToDo = destinationSquare.charAt(0) + "8=Q+";
						chess.move(moveToDo);
						var promotedQueen = BABYLON.SceneLoader.ImportMesh("Cylinder", "models/", "rainha.babylon", scene, function(newMeshes) {
							promotedQueen = newMeshes[0];
							promotedQueen.name = "Bqueen";
							promotedQueen.position.x = promotionX;
							promotedQueen.position.y = 0.5;
							promotedQueen.position.z = promotionZ;
							promotedQueen.scaling.x = 0.30;
							promotedQueen.scaling.y = 0.25;
							promotedQueen.scaling.z = 0.30;
							promotedQueen.material = blackPieceMaterial;

						});

						selectedPieceType = null;
						selectedPiece.dispose();
					}

					//remover o highlight

					for (var i = 0; i < highlights.length; i++){

						highlights[i].dispose();

					}

					//não há mais peças selecionadas

					selectedPiece = null;
					selectedPieceType = null;

					break;

				case "Chess Board":

					break;

				default:

					//armazenar a peça clicada

					selectedPiece = clickedMesh;
					selectedPieceType = clickedMesh.name;;


					//remover highlights anteriores

					for (var i = 0; i < highlights.length; i++){

						highlights[i].dispose();

					}

					var legalMoves = chess.moves({square: coordsToPosition(selectedPiece.position)});

					for (var elem = 0; elem < legalMoves.length; elem++){		

						if(legalMoves[elem] === "O-O" || legalMoves[elem] === "O-O-O") continue;

						temp1 = legalMoves[elem].slice(0, legalMoves[elem].length - 1)

						legalMoves[elem] = legalMoves[elem].replace('x', ''); //caractere de captura
						legalMoves[elem] = legalMoves[elem].replace('=', ''); //caractere de promoção
						legalMoves[elem] = legalMoves[elem].replace('Q', ''); //caractere de promoção
						legalMoves[elem] = legalMoves[elem].replace('R', ''); //caractere de promoção
						legalMoves[elem] = legalMoves[elem].replace('B', ''); //caractere de promoção
						legalMoves[elem] = legalMoves[elem].replace('N', ''); //caractere de promoção
						legalMoves[elem] = legalMoves[elem].replace('+', ''); //movimento vai fazer xeque

						if (legalMoves[elem].length === 3) {
							legalMoves[elem] = legalMoves[elem].slice(1); //tira coluna que não é o destino
						}

					}						

					//gera posições válidas
					for (var pos = 0; pos < legalMoves.length; pos++) {
						
						generateHighlight(legalMoves[pos], scene);

					}

					break;

			}

			if(chess.game_over()) {
				endGame();
			}

		}

	}

	return scene;
}






function createBoard(scene) {
	
	var xmin = -4.5;
	var zmin = -4.5;
	var xmax = 4.5;
	var zmax = 4.5;
	var precision = {
		"w" : 2,
		"h" : 2
	};

	var subdivisions = {
		"h" : 8,
		"w" : 8
	};

	var chessBoard = new BABYLON.Mesh.CreateTiledGround("Chess Board", xmin, zmin, xmax, zmax,subdivisions, precision, scene);

	var blackMaterial = new BABYLON.StandardMaterial("Black", scene);
	blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

	var whiteMaterial = new BABYLON.StandardMaterial("White", scene);
	whiteMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

	var multimat = new BABYLON.MultiMaterial("multi", scene);
	multimat.subMaterials.push(blackMaterial);
	multimat.subMaterials.push(whiteMaterial);

	chessBoard.material = multimat;

	var verticesCount = chessBoard.getTotalVertices();
	var tileIndicesLength = chessBoard.getIndices().length / (subdivisions.w * subdivisions.h)

	chessBoard.subMeshes = [];
	var base = 0;

	for (var row = 0; row < subdivisions.h; row++) {

		for (var col = 0; col < subdivisions.w; col++) {

			chessBoard.subMeshes.push(new BABYLON.SubMesh(row % 2 ^ col % 2, 0, verticesCount, base, tileIndicesLength, chessBoard));
			base += tileIndicesLength;

		}

	}

}

function createChessSet(texture, scene) {

	switch (texture){

		case "standard":

			blackPieceMaterial = new BABYLON.StandardMaterial("piecematerial1", scene);
			whitePieceMaterial = new BABYLON.StandardMaterial("piecematerial2", scene);

			blackPieceMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.25, 0.25);
			whitePieceMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

			break;

		case "wooden":

			var blackPieceMaterial = new BABYLON.StandardMaterial("piecematerial1", scene);
			var whitePieceMaterial = new BABYLON.StandardMaterial("piecematerial2", scene);    				
			blackPieceMaterial.diffuseTexture = new BABYLON.Texture("textures/dark-wood-texture.png", scene);
			whitePieceMaterial.diffuseTexture = new BABYLON.Texture("textures/wooden.jpg", scene);

			break;

	}

	//criando as peças

	//Importação dos modelos

	var bishop1 = BABYLON.SceneLoader.ImportMesh("bishop", "models/", "bispo.babylon", scene, function(newMeshes) {
		bishop1 = newMeshes[0];
		bishop1.name = "Bbishop";
		bishop1.position.x = -1.725;
		bishop1.position.y = 0.5;
		bishop1.position.z = 3.9;
		bishop1.scaling.x = 0.30;
		bishop1.scaling.y = 0.25;
		bishop1.scaling.z = 0.30;
		bishop1.material = blackPieceMaterial;

		var bishop2 = bishop1.clone("Bbishop");
		bishop2.position.x = 1.65;
		bishop2.position.y = 0.5;
		bishop2.position.z = 3.9;
		bishop2.scaling.x = 0.30;
		bishop2.scaling.y = 0.25;
		bishop2.scaling.z = 0.30;
		bishop2.material = blackPieceMaterial;

		var bishop3 = bishop1.clone("Wbishop");
		bishop3.position.x = -1.725;
		bishop3.position.y = 0.5;
		bishop3.position.z = -3.975;
		bishop3.scaling.x = 0.30;
		bishop3.scaling.y = 0.25;
		bishop3.scaling.z = 0.30;
		bishop3.material = whitePieceMaterial;


		var bishop4 = bishop1.clone("Wbishop");
		bishop4.position.x = 1.65;
		bishop4.position.y = 0.5;
		bishop4.position.z = -3.975;
		bishop4.scaling.x = 0.30;
		bishop4.scaling.y = 0.25;
		bishop4.scaling.z = 0.30;
		bishop4.material = whitePieceMaterial; 


	});

	var knight1 = BABYLON.SceneLoader.ImportMesh("knight", "models/", "cavalo.babylon", scene, function(newMeshes) {
		knight1 = newMeshes[0];
		knight1.name = "Bknight";
		knight1.position.x = -2.85;
		knight1.position.y = 0.95;
		knight1.position.z = 3.9;
		knight1.scaling.x = 0.40;
		knight1.scaling.y = 0.40;
		knight1.scaling.z = 0.40;
		knight1.material = blackPieceMaterial;

		var knight2 = knight1.clone("Bknight");
		knight2.position.x = 2.775;
		knight2.position.y = 0.95;
		knight2.position.z = 3.9;
		knight2.scaling.x = 0.40;
		knight2.scaling.y = 0.40;
		knight2.scaling.z = 0.40;
		knight2.material = blackPieceMaterial;   

		var knight3 = knight1.clone("Wknight");
		knight3.position.x = -2.85;
		knight3.position.y = 0.95;
		knight3.position.z = -3.975;
		knight3.scaling.x = 0.40;
		knight3.scaling.y = 0.40;
		knight3.scaling.z = 0.40;
		knight3.rotation.y = -Math.PI;
		knight3.material = whitePieceMaterial; 

		var knight4 = knight1.clone("Wknight");
		knight4.position.x = 2.775;
		knight4.position.y = 0.95;
		knight4.position.z = -3.975;
		knight4.scaling.x = 0.40;
		knight4.scaling.y = 0.40;
		knight4.scaling.z = 0.40;
		knight4.rotation.y = -Math.PI;
		knight4.material = whitePieceMaterial;


	});

	var rook1 = BABYLON.SceneLoader.ImportMesh("Cylinder", "models/", "torre.babylon", scene, function(newMeshes) {
		rook1 = newMeshes[0];
		rook1.name = "Brook";
		rook1.position.x = -3.975;
		rook1.position.y = 0.6;
		rook1.position.z = 3.9;
		rook1.scaling.x = 0.35;
		rook1.scaling.y = 0.35;
		rook1.scaling.z = 0.35;
		rook1.material = blackPieceMaterial;

		var rook2 = rook1.clone("Brook");
		rook2.position.x = 3.9;
		rook2.position.y = 0.6;
		rook2.position.z = 3.9;
		rook2.scaling.x = 0.35;
		rook2.scaling.y = 0.35;
		rook2.scaling.z = 0.35;
		rook2.material = blackPieceMaterial;

		var rook3 = rook1.clone("Wrook");
		rook3.position.x = -3.975;
		rook3.position.y = 0.6;
		rook3.position.z = -3.975;
		rook3.scaling.x = 0.35;
		rook3.scaling.y = 0.35;
		rook3.scaling.z = 0.35;
		rook3.material = whitePieceMaterial;

		var rook4 = rook1.clone("Wrook");
		rook4.position.x = 3.9;
		rook4.position.y = 0.6;
		rook4.position.z = -3.975;
		rook4.scaling.x = 0.35;
		rook4.scaling.y = 0.35;
		rook4.scaling.z = 0.35;
		rook4.material = whitePieceMaterial;

	});

	var queen1 = BABYLON.SceneLoader.ImportMesh("Cylinder", "models/", "rainha.babylon", scene, function(newMeshes) {
		queen1 = newMeshes[0];
		queen1.name = "Bqueen";
		queen1.position.x = -0.6;
		queen1.position.y = 0.5;
		queen1.position.z = 3.9;
		queen1.scaling.x = 0.30;
		queen1.scaling.y = 0.25;
		queen1.scaling.z = 0.30;
		queen1.material = blackPieceMaterial;

		var queen2 = queen1.clone("Wqueen");
		queen2.position.x = -0.6;
		queen2.position.y = 0.5;
		queen2.position.z = -3.975;
		queen2.scaling.x = 0.30;
		queen2.scaling.y = 0.25;
		queen2.scaling.z = 0.30;
		queen2.material = whitePieceMaterial;


	});

	var king1 = BABYLON.SceneLoader.ImportMesh("king", "models/", "rei.babylon", scene, function(newMeshes) {
		king1 = newMeshes[0];
		king1.name = "Bking";
		king1.position.x = 0.525;
		king1.position.y = 0.6;
		king1.position.z = 3.9;
		king1.scaling.x = 0.30;
		king1.scaling.y = 0.25;
		king1.scaling.z = 0.30;
		king1.material = blackPieceMaterial;

		var king2 = king1.clone("Wking");
		king2.position.x = 0.525;
		king2.position.y = 0.6;
		king2.position.z = -3.975;
		king2.scaling.x = 0.30;
		king2.scaling.y = 0.25;
		king2.scaling.z = 0.30;
		king2.material = whitePieceMaterial;						
	}); 					

	var pawn1 = BABYLON.SceneLoader.ImportMesh("pawn", "models/", "peao.babylon", scene, function(newMeshes) {
		pawn1 = newMeshes[0];
		pawn1.name = "Bpawn";
		pawn1.position.x = -3.975;
		pawn1.position.y = 0.5;
		pawn1.position.z = 2.775;
		pawn1.scaling.x = 0.40;
		pawn1.scaling.y = 0.33;
		pawn1.scaling.z = 0.40;
		pawn1.material = blackPieceMaterial;						


		for (var i = 1; i < 8; i++) {

			var pawn2 = pawn1.clone("Bpawn");
			pawn2.position.x = -3.975 + i * 1.125;
			pawn2.position.y = 0.5;
			pawn2.position.z = 2.775;
			pawn2.scaling.x = 0.40;
			pawn2.scaling.y = 0.33;
			pawn2.scaling.z = 0.40;
			pawn2.material = blackPieceMaterial;


		}


		for (var i = 0; i < 8; i++) {

			var pawn3 = pawn1.clone("Wpawn");
			pawn3.position.x = -3.975 + i * 1.125;
			pawn3.position.y = 0.5;
			pawn3.position.z = -2.85;
			pawn3.scaling.x = 0.40;
			pawn3.scaling.y = 0.33;
			pawn3.scaling.z = 0.40;
			pawn3.material = whitePieceMaterial;

		}

	});	 

}


function generateHighlight(pos, scene){

	if (pos === "O-O") {

		pos = chess.turn() === 'w' ? "g1" : "g8";

	}

	else if (pos === "O-O-O") {

		pos = chess.turn() === 'w' ? "c1" : "c8";

	}




	var highlight = BABYLON.Mesh.CreateCylinder("highlight", 1.0, 1.125, 1.125, 6, 1, scene, true);
	highlight.material = new BABYLON.StandardMaterial("highlightmat", scene);
	highlight.material.emissiveColor = new BABYLON.Color3(0.5, 1.0, 0.5);
	highlight.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);
	highlight.material.diffuseColor = new BABYLON.Color3(0.0, 0.0, 0.0);
	highlight.material.alpha = 0.0;
	highlight.position.x = REFERENCE_POSITION.x + COLUMNS.indexOf(pos.charAt(0)) * 1.125;
	highlight.position.y = 0.5;
	highlight.position.z = REFERENCE_POSITION.z + ( ( + pos.charAt(1)) - 1) * 1.125;
	highlights.push(highlight);


	var highlight2 = BABYLON.Mesh.CreateGround("highlight", 1.125, 1.125, 1, scene, true);
	highlight2.material = new BABYLON.StandardMaterial("highlightmat", scene);
	highlight2.material.emissiveColor = new BABYLON.Color3(0.5, 1.0, 0.5);
	highlight2.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);
	highlight2.material.diffuseColor = new BABYLON.Color3(0.0, 0.0, 0.0);
	highlight2.material.alpha = 0.5;
	highlight2.position.x = REFERENCE_POSITION.x + COLUMNS.indexOf(pos.charAt(0)) * 1.125;
	highlight2.position.y = 0.05;
	highlight2.position.z = REFERENCE_POSITION.z + ( ( + pos.charAt(1)) - 1) * 1.125;
	highlights.push(highlight2);

}

//Vector3 de posição -> posição na notação do xadrez
function coordsToPosition(position){
	temp1 = ( (position.z - REFERENCE_POSITION.z) / 1.125) + 1;
	line = "" + temp1;

	//coluna
	temp2 = ( (position.x - REFERENCE_POSITION.x) / 1.125);
	column = "" + (COLUMNS[temp2]);
	position = column + line;

	return position;
}
//Nesse caso position é em notação algébrica, e.g. "f1", piece é o nome da peça
function positionToCoords(position, piece) {

	ret = new BABYLON.Vector3(0, 0, 0);

	switch (piece){

		case "bishop":
			ret.y = 0.5;
			break;

		case "knight":
			ret.y = 0.95;
			break;

		case "rook":
			ret.y = 0.6;
			break;

		case "queen":
			ret.y = 0.5;
			break;

		case "king":
			ret.y = 0.6;
			break;

		case "pawn":
			ret.y = 0.5;
			break;

	}

	//
	var colNum = COLUMNS.indexOf(position.charAt(0));
	ret.x = REFERENCE_POSITION.x + colNum * 1.125;

	ret.z = REFERENCE_POSITION.z + ( ( + position.charAt(1)) - 1) * 1.125;

	return ret;
}

function endGame() {

	if (chess.in_checkmate()) {
		if(chess.turn() === 'w') {
			
			swal({   title: "Xeque-Mate!",   text: "O rei branco foi capturado! \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-up.jpg" });
		}

		else {
			swal({   title: "Xeque-Mate!",   text: "O rei preto foi capturado! \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-up.jpg" });
		}
	}

	else if (chess.in_stalemate()){
		
		if(chess.turn() === 'w') {
			swal({   title: "Rei Afogado",   text: "Fim de jogo! O rei branco está afogado, sem poder ser capturado ou fugir sem ser capturado... \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-down.jpg" });
		}
		
		else {
			swal({   title: "Rei Afogado",   text: "Fim de jogo! O rei preto está afogado, sem poder ser capturado ou fugir sem ser capturado... \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-down.jpg" });
		}		
	}

	else if (chess.in_draw()) {
		if (chess.insufficient.material() ) {
			
			swal({   title: "Empate!",   text: "Nenhum dos lados possui peças suficientes para um xeque-mate! \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-down.jpg" });
		}

		else{
			swal({   title: "Empate!",   text: "50 turnos sem passaram sem capturas de peças ou movimento de peões. \n \n Se quiser jogar outra partida, basta atualizar a página.",   imageUrl: "images/thumbs-up.jpg" });
		}
	}



}

function chooseTexture() {

	swal({   title: "Cor do conjunto das peças",   text: "Escolha a cor do conjunto das peças!",   type: "input",   showCancelButton: true,   closeOnConfirm: false,   animation: "slide-from-top",   inputPlaceholder: "Digite p para o conjunto padrão, ou m para o conjunto de madeira." }, function(inputValue){   if (inputValue === false) return false;      if (inputValue === "") {     swal.showInputError("É necessário escrever algo!");     return false   }   if (inputValue === 'p') localStorage.setItem("texture", "standard");      if (inputValue === 'm') localStorage.setItem("texture", "wooden");      swal("OK!", "Atualize a página para jogar com o conjunto escolhido" , "success"); });

}