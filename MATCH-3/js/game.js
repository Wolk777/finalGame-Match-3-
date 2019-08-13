let start = function(){

  /* ------------------------------ view ----------------------------- */
let view = {
	init: function(){
		this.drawBackground();
	},

	drawBackground: function(){ // создаём холст и рисуем фон для игры
		let canvas = document.createElement("canvas");
		let ctx = canvas.getContext("2d");
		canvas.width = 750;
		canvas.height = 490;
		$("#site_content").append(canvas);

		ctx.globalAlpha = .8;
		ctx.fillStyle = '#887eb2'; 
		ctx.fillRect(0, 0, 727, 480);
		ctx.fillStyle = '#a9747a';  		
		ctx.globalAlpha = .5;
		for (i = 0; i < 7; i += 2){
			for (j = 0; j < 7; j += 2) {
				ctx.fillRect(0 + i * 60, 0 + j * 60, 60, 60);
				ctx.fillRect(0 + (i + 1) * 60, 0 + (j + 1) * 60, 60, 60);
			};
		};
	},
	/*отрисовка счёта*/
	drawScore: function(score, scoreEnd){
		$("#scoreText").html("Score:" + score);
		$("#scoreEnd").html("Цель: " + scoreEnd);
	},
	/*отрисовка уровня*/
	drawLevel: function(level){
		$("#level").html(level);
	},
	/*отрисовка таймера*/
	drawTimer(width){
		$('#timerStrip').css({"width": width + "%"});
	},
	/*скрыть маркер*/
	hideMarker: function (){
		$("#marker").hide();
	},
	/*показать маркер*/
	showMarker: function (row, col, size){
		$("#marker").css("top", row * size).css("left", col * size);
		$("#marker").show();
	},
	/*открыть модальное окно*/
    openModalWindow: function(a, b) {
        a.classList.remove('modal_closed');
        b.classList.remove('modal_closed');
    },
	/*закрыть модальное окно*/
    closeModalWindow: function(a, b) {//dfsgdfgd
        a.classList.add('modal_closed');
        b.classList.add('modal_closed');
    }
};

// ---------------------------- model -----------------------------
let model ={
	init: function(){
		this.shieldSize = 60; // размер элемента
		this.shieldClassId = "shield"; // класс/id элементов
		this.rows = 8; // количество рядов
		this.cols = 8; // количество колонок
		this.shieldArr = []; // двумерный массив щитов на поле
		this.gameState = "ready"; //текущее состояние поля - 'готово', ожидание действий игрока
		this.selectedRow = -1; //выбранный ряд
		this.selectedCol = -1; //выбранный столбец
		this.posX = null; // столбец второго выбранного щита
		this.posY = null; // ряд второго выбранного щита
		this.movingItems = 0; //количество передвигаемых в данный момент щитов
		this.score = 0; //текущий счёт
		this.scoreTotal = 0; //общий счёт
		this.flagStart = "start"; // флаг состояния игры
		this.requestId = null; // id для остановки анимации
		this.user = "player1"; // имя пользователя
		this.level ={    // объект данных уровня
			number: 1,   //номер уровня
			duration: 1,  // время уровня
			score: 500   // цель уровня
		};
		
		this.drawScore(); // отрисовка счёта
		this.drawLevel(); // отрисовка уровня
		this.drawTimer(); //  инициализация таймера
		this.createField(); // создание игрового поля
		this.initSound(); //инициализация звука
		this.welcome(); // запрос имени

	},
	/*инициализация звука*/
	initSound: function(){
        this.audioWin = new Audio;
        this.audioWin.src = 'sound/1.mp3';
        this.audioWin.preload = 'auto';

        this.audioGameOver = new Audio;
        this.audioGameOver.src = 'sound/3.mp3';
        this.audioGameOver.preload = 'auto';        

        this.audioBg = new Audio;
        this.audioBg.src = 'sound/8.mp3';
        this.audioBg.preload = 'auto';
        this.audioBg.volume = '0.2';
        this.audioBg.loop = true;
	},

	/*создаём игроволе поле*/
	createField: function(){
		/*создаём поле*/		
		$("#site_content").append('<div id = "gamefield"></div>');
		$("#gamefield")
		.css({
		  "position": "absolute",
		  "left":"0",
		  "top":"0",
		  "width": (model.cols * model.shieldSize) + "px",
		  "height": (model.rows * model.shieldSize) + "px"
		});
		
		/*создаём маркер*/
		$("#site_content").append('<div id = "marker"></div>');
		$("#marker")
		.css({
			"width": (model.shieldSize ) +"px",
			"height": (model.shieldSize ) +"px",
			"position": "absolute",
			"background-image": "url('./image/shieldSelected.gif')",
			"background-repeat": "no-repeat",
			"z-index":"100"
		});

  		this.hideMarker();
	},
	/*заполняем поле*/
	fillField: function(){
		/* иницализая сетки поля */
		for(i = 0; i < model.rows; i++){
			model.shieldArr[i] = [];
			for(j = 0; j < model.cols; j++){
				model.shieldArr[i][j] = -1;
			};
		};
	/* генерация исходного набора элемента */
		for(i = 0; i < model.rows; i++){
			for(j = 0; j < model.cols; j++){
				/* проверить на наличие кластера и при его появление поменять тип элемента */
				do{
					model.shieldArr[i][j] = Math.floor(Math.random() * 5);
				} while(model.findCluster(i, j));

				$("#gamefield").append(
					'<div class = "' + model.shieldClassId + '" id = "' + model.shieldClassId + '_' + i + '_' + j + '"></div>'
				);
				
				$("#" + model.shieldClassId + "_" + i + "_" + j).css({
					"position": "absolute",			  
					"top": (i * model.shieldSize) + "px",
					"left": (j * model.shieldSize) + "px",
					"width": (model.shieldSize ) +"px",
					"height": (model.shieldSize ) +"px",
					"background-image": "url('./image/" + model.shieldArr[i][j] + ".png')"
				});
			};
		};
	},
	
	/*обработка кликов по полю*/
	clickShield: function(target){
		 // клик по щиту? 
		if($(target).hasClass("shield")){
		 // проверка состояния игры на готовность 
			if(model.gameState == "ready"){
				let size = model.shieldSize;
		
				// определить строку и столбец
				let row = + ($(target).attr("id").split("_")[1]);
				let col = + ($(target).attr("id").split("_")[2]);
				// выделить щит маркером
				this.showMarker(row, col, size);;

				// если ни один элемент не выбран, сохраняем его позицию
				if(model.selectedRow == -1){
					model.selectedRow = row;
					model.selectedCol = col;
				} else {
					/*если элемент уже выбран, проверяем:
					клик по соседнему элементу - меняем элементы местами,
					иначе - выделяем новый элемент
					*/
					if( (Math.abs(model.selectedRow - row) == 1 && model.selectedCol == col) || (Math.abs(model.selectedCol - col) == 1 && model.selectedRow == row) ){
						this.hideMarker();
						// переключить состояние игры
						model.gameState = "switch";
						// сохранить позицию второго выбранного элемента
						model.posX = col;
						model.posY = row;
						// поменять элементы местами
						this.changeShield();
					} else {
						model.selectedRow = row;
						model.selectedCol = col;
					};
				};
			};
		};
	},

	/*Функция changeShield меняет местами два элемента на поле и в массиве shieldArr*/
	changeShield: function(){
		let shiftY = model.selectedRow - model.posY;
		let shiftX = model.selectedCol - model.posX;
		    
		$("#" + model.shieldClassId + "_" + model.selectedRow + "_" + model.selectedCol)
			.addClass("switch")
			.attr("dir", "-1");
		$("#" + model.shieldClassId + "_" + model.posY + "_" + model.posX)
			.addClass("switch")
			.attr("dir", "1");
		    
		// анимировать свитч
		$(".switch").each(function(){
			model.movingItems++;
			$(this).animate({
				left: "+=" + shiftX * model.shieldSize * $(this).attr("dir"),
				top: "+=" + shiftY * model.shieldSize * $(this).attr("dir")
				},{
				duration: 200,
				complete: function() {
					// после завершения анимации, проверить, доступен ли такой ход
					model.checkMoving();
				}
			}).removeClass("switch")
		});

		// поменять идентификаторы щитов
		$("#" + model.shieldClassId + "_" + model.selectedRow + "_" + model.selectedCol)
		  .attr("id", "temp");
		$("#" + model.shieldClassId + "_" + model.posY + "_" + model.posX)
		  .attr("id", model.shieldClassId + "_" + model.selectedRow + "_" + model.selectedCol);
		$("#temp")
		  .attr("id", model.shieldClassId + "_" + model.posY + "_" + model.posX);
		    
		// поменять элементы в сетке
		let temp = model.shieldArr[model.selectedRow][model.selectedCol];
		model.shieldArr[model.selectedRow][model.selectedCol] = model.shieldArr[model.posY][model.posX];
		model.shieldArr[model.posY][model.posX] = temp;
	},
	/*проверка состояния игры*/
	checkMoving: function() {
		model.movingItems--;
		// когда закончилась анимация последнего щита
		if(model.movingItems == 0) {
			// действуем в зависимости от состояния игры
			switch(model.gameState) {
				// после передвижения щитов проверяем поле на появление групп сбора
				case "switch":
				case "revert":
					// проверяем, появились ли группы сбора
					if(!model.findCluster(model.selectedRow, model.selectedCol) && !model.findCluster(model.posY, model.posX)) {
						// если групп сбора нет, нужно отменить совершенное движение
						// а если действие уже отменяется, то вернуться к исходному состоянию ожидания выбора
						if(model.gameState != "revert"){
							model.gameState = "revert";
							this.changeShield();
						} else {
							model.gameState = "ready";
							model.selectedRow = -1;
						}
					} else {
						// если группы сбора есть, нужно их удалить
						model.gameState = "remove";
						// сначала отметим все удаляемые элементы
						if(model.findCluster(model.selectedRow, model.selectedCol)){
							this.removeShield(model.selectedRow, model.selectedCol);
						}
						if(model.findCluster(model.posY, model.posX)){
							this.removeShield(model.posY, model.posX);
						}
						// а затем уберем их с поля
						this.hideShield();
					}
					break;

				// после удаления нужно "уронить" оставшиеся элементы, чтобы заполнить пустоты
				case "remove":
					this.checkFalling();
					break;

				// когда все элементы опущены вниз, заполняем пустоты
				case "refill":
					this.placeNewShield();
					break;
			};
		};
	},
	/*помечаем удаляемые элементы классом "remove"*/ 
	removeShield: function(row, col) {
		let prefixId = model.shieldClassId;
		let gemValue = model.shieldArr[row][col];
		let tmp = row;
		let score = 1;

		$("#" + prefixId + "_" + row + "_" + col).addClass("remove");

		if(this.isVerticalStreak(row, col)){
			while(tmp > 0 && model.shieldArr[tmp - 1][col] == gemValue){
				$("#" + prefixId + "_" + (tmp - 1) + "_" + col).addClass("remove");
				model.shieldArr[tmp - 1][col] = -1;
				tmp--;
				score++;

			};
			tmp = row;
			while(tmp < model.rows - 1 && model.shieldArr[tmp + 1][col] == gemValue){
				$("#" + prefixId + "_" + (tmp + 1) + "_" + col).addClass("remove");
				model.shieldArr[tmp + 1][col] = -1;
				tmp++;
				score++;
			};
		};

		if(this.isHorizontalStreak(row, col)){
			tmp = col;
			while(tmp > 0 && model.shieldArr[row][tmp - 1]==gemValue){
				$("#" + prefixId + "_" + row + "_" + (tmp - 1)).addClass("remove");
				model.shieldArr[row][tmp - 1] = -1;
				tmp--;
				score++;				
			};
			tmp = col;
			while(tmp < model.cols - 1 && model.shieldArr[row][tmp + 1]==gemValue){
				$("#" + prefixId + "_" + row + "_" + (tmp + 1)).addClass("remove");
				model.shieldArr[row][tmp + 1] = -1;
				tmp++;
				score++;				
			};
		};	
	
		model.shieldArr[row][col] = -1;
		this.changeScore(score);
	},

	/* удаляем элементы с поля */
	hideShield: function(){
		$.each($(".remove"), function(){
			model.movingItems++;
			$(this).animate({
				opacity:0
			},
			{
				duration: 250,
				complete: function() {
					$(this).remove();
					// снова проверяем состояние поля
					model.checkMoving()
				}
			});
		});
	},

	/*опускаем все элементы, оказавшиеся над пустыми клетками*/
	checkFalling: function(){
	    let fellDown = 0;

	    for(j = 0; j < model.cols; j++) {
			for(i = model.rows - 1; i > 0; i--) {
				if(model.shieldArr[i][j] == -1 && model.shieldArr[i - 1][j] >= 0) {
					$("#" + model.shieldClassId + "_" + (i - 1) + "_" + j)
						.addClass("fall")
						.attr("id", model.shieldClassId + "_" + i + "_" + j);
					model.shieldArr[i][j] = model.shieldArr[i - 1][j];
					model.shieldArr[i - 1][j] = -1;
					fellDown++;
				};
			};
	    };

	    $.each($(".fall"), function() {
			model.movingItems++;
			$(this).animate({
				top: "+=" + model.shieldSize
			},
			{
				duration: 100,
				complete: function() {
					$(this).removeClass("fall");
					model.checkMoving();
				}
			});
	    });
	      
	    // если падать больше нечему, изменяем состояние игры
	    if(fellDown == 0){
	      model.gameState = "refill";
	      model.movingItems = 1;
	      model.checkMoving();
	    }
	},
	/*заполняем поля новыми элементами*/
	placeNewShield: function (){
	    let shieldsPlaced = 0;
	 
	    for(i = 0; i < model.cols; i++) {
			if(model.shieldArr[0][i] == -1) {
				model.shieldArr[0][i] = Math.floor(Math.random() * 5);
				$("#gamefield")
					.append('<div class = "' + model.shieldClassId + '" id = "' + model.shieldClassId + '_0_' + i + '"></div>');
				$("#" + model.shieldClassId + "_0_" + i).css({
					"top": "4px",
					"left": (i * model.shieldSize) + "px",
					"width": (model.shieldSize ) +"px",
					"height": (model.shieldSize ) +"px",
					"position": "absolute",
					"background-image": "url('./image/" + model.shieldArr[0][i] + ".png')"
				});
				shieldsPlaced++;
			};
	    };

	    /* если появились новые элементы, проверить, нужно ли опустить что-то вниз */
	    if( shieldsPlaced ) {
			model.gameState = "remove";
			this.checkFalling();
	    } else {
			/* если новых щитов не появилось, проверяем поле на группы сбора */
			let combo = 0
			for(i = 0; i < model.rows; i++) {
				for(j = 0; j < model.cols; j++) {
					if(j <= model.cols - 3 && model.shieldArr[i][j] == model.shieldArr[i][j + 1] && model.shieldArr[i][j] == model.shieldArr[i][j + 2]){
						combo++;
			
						model.removeShield(i, j);
					}
					if(i <= model.rows - 3 && model.shieldArr[i][j] == model.shieldArr[i + 1][j] && model.shieldArr[i][j] == model.shieldArr[i + 2][j]){
						combo++;
			
						model.removeShield(i, j);
					};
				};
			};
	      
			// удаляем найденные группы сбора
			if(combo > 0){
				model.gameState = "remove";
				model.hideShield();
			} else { // или вновь запускаем цикл игры
				model.gameState = "ready";
				model.selectedRow= -1;
			};
	    };
  	}, 
  	/*найти кластеры*/
	findCluster: function(row, col){
		return this.isVerticalStreak(row, col) || this.isHorizontalStreak(row, col);
	},
	/*вертикальные группы*/
	isVerticalStreak: function(row, col){
		let gemValue = model.shieldArr[row][col];
		let streak = 0;
		let tmp = row;
		while(tmp > 0 && model.shieldArr[tmp - 1][col] == gemValue){
			streak++;
			tmp--;
		}
		tmp = row;
		while(tmp < model.rows - 1 && model.shieldArr[tmp + 1][col] == gemValue){
			streak++;
			tmp++;
		}
		return streak > 1
	},
	/*горизонтальные группы*/
	isHorizontalStreak: function(row, col){
		let gemValue = model.shieldArr[row][col];
		let streak = 0;
		let tmp = col;
		while(tmp > 0 && model.shieldArr[row][tmp - 1] == gemValue){
			streak++;
			tmp--;
		};
		tmp = col;
		while(tmp < model.cols - 1 && model.shieldArr[row][tmp + 1] == gemValue){
			streak++;
			tmp++;
		};
		return streak > 1
	},
	/*показать маркер*/
	showMarker: function(row, col, size){
		view.showMarker(row, col, size);
	},
	/*скрыть маркер*/
	hideMarker: function(){
		view.hideMarker();
	},
	/*изменить счёт*/
	changeScore: function(score){
		if (score >= 5) {
  			let scoreDiff = score*10*1.3;
  			this.score += scoreDiff;
  			this.scoreTotal += scoreDiff;
		} else if (score === 4) {
			let scoreDiff = score*10*1.2;
  			this.score += scoreDiff;			
  			this.scoreTotal += scoreDiff;			
  		} else {
  			let scoreDiff = score*10;
			this.score += scoreDiff;
			this.scoreTotal += scoreDiff;
  		};

  		this.drawScore();
  	},
  	/*запускаем игру по клику на "Старт"*/
	clickStart: function(){
		if(this.flagStart === "start"){			
	  		this.score = 0;
			this.fillField();
			$("#gamefield").show();
			this.startTimer();
			this.audioBg.play();
			this.flagStart = "game";
			this.gameState = "ready";	
		}; 
	},
	/*перемешать элементы*/
	clickMix: function(){
		if(this.flagStart !== "start"){
			this.fillField();
		};
	},

	drawLevel: function(){
		let level = this.level.number;	
		view.drawLevel(level);
	},

	drawScore: function(){
		let score = this.score;
		let scoreEnd = this.level.score;		
		view.drawScore(score, scoreEnd);
	},
	/*запустить таймер*/
	startTimer: function(){
	let duration = this.level.duration * 60 * 1000;
    let startData = Date.now();

	    function timer() {
	        // получить количество секунд, прошедших с запуска таймера
	        let diff = duration - (((Date.now() - startData)) | 0);
	        let widthTimer = ((diff*100)/duration).toFixed(3);
	        model.requestId  = requestAnimationFrame(timer);
			
			model.drawTimer(widthTimer);
			model.checkScore();
	        // если таймер равен нулю - вызываем функцию gameOver
	        if (diff <= 0) {
				model.stopAnimation();
				model.gameOver();
	        };
	        
	    };
        timer();
	},
	/*остановка таймера*/
	stopAnimation: function(){
		cancelAnimationFrame(model.requestId);
	},
	/*отрисовка таймера*/
	drawTimer: function(width){
		view.drawTimer(width);
	},
	/*проверка выполнена ли цель уровня*/
	checkScore: function(){
		if(this.score >= this.level.score){
			this.stopAnimation();
			this.winLevel()
		};
	},
	/*уровень пройден*/
	winLevel: function(){
		let winText = '<header class="modal__header">\
		<a href="#main" class="modal__close close" id="modal-close">[X]</a><h1>' + model.user + '</h1></header>\
		<main class="modal__content"><div class="div_field">Level Win!!!</h1</div></main>';
		$('#modal').html(winText);
		$('#modal-close').bind('click', function(){model.closeModalWindow()});
		this.openModalWindow();
		this.audioWin.play();

		this.level.number += 1;
		this.level.duration -= 0.05;		
		this.level.score += 200;
		this.resetGame();
	},
	/*уровень не пройден*/
	gameOver: function(){
		let gameOverText = '<header class="modal__header">\
		<a href="#main" class="modal__close close" id="modal-close">[X]</a><h1>' + model.user + '</h1></header>\
		<main class="modal__content"><div class="div_field">GameOver..</div></main>';
		$('#modal').html(gameOverText);
		$('#modal-close').bind('click', function(){model.closeModalWindow()});
		this.openModalWindow();
		
		this.audioGameOver.play();		
		this.level.number = 1;
		this.level.duration = 1;
		this.level.score = 500;	
		this.saveData();	
		this.resetGame();
	},

	resetGame: function(){
        this.audioBg.pause();
		this.score = 0;
		this.drawScore();
		this.drawLevel();
		this.drawTimer(100);
		this.flagStart = "start";
		$("." + model.shieldClassId).remove();
		$("#gamefield").hide();
	},
	/*модальное окно с запросом имени*/
	welcome: function(){
		console.log(userName)
		if (userName === null) {
			let welcomeText = '<header class="modal__header">\
			<a href="#main" class="modal__close close" id="modal-close">[X]</a><h1>Введите данные</h1></header>\
			<main class="modal__content"><div class="form-field"><label for="name">Ваше имя:</label>\
			<input class="inputField" type="text" id="name" name="name" required pattern="[a-zA-Zа-яёЁА-Я]{2,20}" >\
			</div></main><footer class="modal__footer"><button id="modal-save" class="modal__save">Сохранить</button>\
	        <button id="modal-cancel" class="modal__cancel close">Отмена</button></footer>';
			$('#modal').html(welcomeText);
			$('.close').bind('click', function(){model.closeModalWindow()});
			$('#modal-save').bind('click', function(){model.checkName()});

			this.openModalWindow();			
		} else {
			this.user = userName;
		}
	},
	/*открыть модальное окно*/
	openModalWindow: function(){
		let modal = $("#modal")[0];
		let modalOverlay = $("#modal-overlay")[0];
		view.openModalWindow(modal, modalOverlay);
	},
	/*закрыть модальное окно*/
	closeModalWindow: function(){
		let modal = $("#modal")[0];
		let modalOverlay = $("#modal-overlay")[0];
		view.closeModalWindow(modal, modalOverlay);
	},
	/*проверка корректности имени*/
	checkName: function(){
		if($('.inputField')[0].validity.valid){
			this.user = $('.inputField')[0].value;
			userName = this.user;
			this.closeModalWindow();
		};
	},
/*сохранение результатов в Local Storage*/
	saveData: function(){
		let savedUser = JSON.parse(window.localStorage.getItem("userData"));
		let name = this.user;
		let score = this.scoreTotal;	
		if(savedUser){
			if(savedUser[name]){//проверка существования имени пользователя
				if(savedUser[name] < score){//если результат лучше предыдущего - перезаписать
					savedUser[name] = score
				};
			}else if(Object.keys(savedUser).length < 5){//сохраняет результаты 5-ти игроков
				savedUser[name] = score;					
			};
		} else {
			savedUser = {};
			savedUser[name] = score;	
		};
		window.localStorage.setItem("userData", JSON.stringify(savedUser));
	}
};

// ---------------------------- controller -----------------------------
/*установка обработчиков событий*/
let controller = {
	events: function(){
		$("#gamefield").on('click', (e) => {
			model.clickShield(e.target);
		});

		$("#btnStart").on('click', () => {
			model.clickStart();
		});

		$("#btnMix").on('click', () => {
			model.clickMix();
		});
	},
};

/* --------------------- initialize function ----------------- */
/*инициализация игры*/
var app = {

        init: function () {
            app.main();
            app.event();
        },

        main: function () {
            model.init();
            view.init();
        },

        event: function () {
            controller.events();
        },
    };
	app.init();
};
