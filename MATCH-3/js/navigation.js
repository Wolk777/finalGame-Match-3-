const state = {page: null};
let userName = null;

let localPage = window.location.hash ? window.location.href.split('#')[0] : window.location.href;

const updateState = () => {
    let pageHTML;
    switch(state.page){
        case null:
        case 'main': 
            state.page = 'main';
            window.location.href = `${localPage}#${state.page}`;// при загрузке выводим главную страницу
            /*создаём поле и панель управления и информации*/
            pageHTML = '<div id="player_info">\
            <div id ="scoreEnd"></div><div id ="level"></div>\
            <div id ="scoreText"><div id ="score"></div></div>\
            <div id ="timer"><div id ="timerStrip"></div></div>\
            <div class="btn" id="btnStart"><a>Start</a></div>\
            <div class="btn" id="btnMix"><a>Mix</a></div></div>';
            $('#site_content').html(pageHTML);
            start();
            break;

        case 'rules': // заполняем правила игры
            pageHTML = '<div id="textBox"><header><h1>Казуальная игра в стиле "MATCH-3"</h1>\
            <p>"Три в ряд" — тип игровой механики казуальных головоломок, получивший огромную \
            популярность за счет своей простоты и гибкости. Суть игры сводится к передвижению \
            фишек по игровому полю и составлению цепочек или линеек из трех и более элементов. \
            Пространство, на котором располагаются фишки, представляет собой орнамент из \
            квадратов. И хотя свои нынешние формы жанр "три в ряд" обрёл совсем недавно, но, так \
            или иначе, игры этого жанра  своими корнями уходят в самые древние времена.</p>\
            </header><section><h2>Правила игры</h2><ul><li>Основная задача — собирать цепочки\
            из фишек, имеющие в своём составе не менее трёх элементов одного типа. Для победы\
            игрок должен набрать необходимое количество очков, за выделенное время.</li><li>\
            Управление осуществляется с помощью мыши. Сперва щёлкните на выбранный элемент,\
            а затем на элемент с которым бы хотели его поменять.</li><li>С каждым пройденым уровнем\
            количество очков, необходимое для победы, растёт, а время уменьшается.</li><li>При\
            отсутствии доступных ходов, нажмите кнопку "Mix" для перемешивания элементов.</li>\
            <li>При сборе цепочек от четырёх и более элементов, начисляются дополнительные \
            бонусные очки.</li></ul></section></div>';
            window.location.href = `${localPage}#${state.page}`;
            $('#site_content').html(pageHTML);
            break;

        case 'results':  // создаём и заполняем таблицу результатов из Local Storage
            pageHTML = '<div id="textBox"><H1>Результаты игры</H1><div id="tableResult">\
            <table id="table"><tr><th>Имя игрока</th><th>Результаты</th></tr>';
            if(localStorage.getItem("userData")){
                let savedUser = JSON.parse(window.localStorage.getItem("userData"));
                let arrUser = [];
                for(let key in savedUser){ // преобразуем объект в массив
                    arrUser.push([key, savedUser[key]]);
                };

                arrUser.sort(function (a,b){ // сортировка игроков по счёту
                    return b[1] - a[1];
                });

                arrUser.forEach((item)=>{ // заполняем таблицу
                    pageHTML += '<tr><td>' + item[0] + '</td><td>' + item[1] + '</td></tr>'
                });
            };
            pageHTML += '</table></div></div>';
            window.location.href = `${localPage}#${state.page}`;
            $('#site_content').html(pageHTML);                    
            break;                                       
    };

    updateButtons();
};
// подсветка активной вкладки
const updateButtons = () => {
    $('.links').each(function(value){
        state.page === $(this).attr('href').slice(1) ?
        $(this).addClass('active') :
        $(this).removeClass('active');
    });
};

window.addEventListener('hashchange', function(){ // обработчик на изменение хеша
	state.page = window.location.hash.slice(1);
	updateState();
});
    
$(window).on('load', updateState);
// изменение вкладок в соответствии с нажатым пунктом меню
$('.links').on('click', (e) => {
    e.preventDefault();
    state.page = e.target.getAttribute('href').slice(1);
    updateState();
});