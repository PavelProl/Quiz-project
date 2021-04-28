// 1. Функционал перемещения по карточкам, вперед и назад
// 2. Проверка на ввод данных (validate)
// 3. Получение (сбор) данных с карточек
// 4. Запись всех введенных данных
// 5. Реализация работы прогресс бара
// 6. Подсветка рамки для радио и чекбоксов

// объект с сохраненными ответами (сюда будут попадать данные из каждой карточки)
let answers = {
    2: null,
    3: null,
    4: null,
    5: null
}

// --------------------------- ДВИЖЕНИЕ ВПЕРЕД ---------------------------------------
// находим все кнопки с data-аттрибутом "next"
let btnNext = document.querySelectorAll('[data-nav="next"]');
btnNext.forEach(function(button) {
    button.addEventListener("click", function() {
        // this внутри addEventListener ссылается на тот элемент, на котором произошло событие
        // находим текущую карточку
        let thisCard = this.closest("[data-card]");
        // находим номер текущей карточки
        let thisCardNumber = parseInt(thisCard.dataset.card);

        if (thisCard.dataset.validate == "novalidate") {
            // перемещаемся вперед
            navigate("next", thisCard);
            // отображаем прогресс-бар
            updateProgressBar("next", thisCardNumber);
        } else {
            // при движении вперед сохраняем данные в объект
            saveAnswer(thisCardNumber, gatherCardData(thisCardNumber))

            // Валидация на заполненность
            // isFilled(thisCardNumber); //true / false
            // И проверка на обязательные поля
            if (isFilled(thisCardNumber) && checkOnRequired(thisCardNumber)) {
                navigate("next", thisCard);
                updateProgressBar("next", thisCardNumber);
            } else {
                alert("Выберите ответ");
            }
        }
    })
});
// ------------------------------------------------------------------------------------

// --------------------------- ДВИЖЕНИЕ НАЗАД -----------------------------------------
// находим все кнопки с data-аттрибутом "prev"
let btnPrev = document.querySelectorAll('[data-nav="prev"]');
btnPrev.forEach(function(button) {
    button.addEventListener("click", function() {
        // находим текущую карточку
        let thisCard = this.closest("[data-card]");
        // находим номер текущей карточки
        let thisCardNumber = parseInt(thisCard.dataset.card);
        // перемещаемся назад
        navigate("prev", thisCard);
        updateProgressBar("prev", thisCardNumber);
    })
})
// ------------------------------------------------------------------------------------

// ----------------------- ПОДСВЕТКА РАМКИ У РАДИОКНОПОК -----------------------------
// выбираем все радиогруппы, проходимся по ним циклом и добавляем прослушку клика
document.querySelectorAll(".radio-group").forEach(function(item){
    item.addEventListener("click", function(e) {
        // проверяем, где произошел клик, внутри label или нет
        let label = e.target.closest("label");
        if (label) {
            // тогда отменяем активный класс у всех label:
            // поднимаемся вверх к родителю с классом radio-group, а затем снова спускаемся вниз и ищем все label и снимаем с них активный класс
            label.closest(".radio-group").querySelectorAll("label").forEach(function(item) {
                item.classList.remove("radio-block--active");
            })
            // добавляем активный к label, по которому был клик
            label.classList.add("radio-block--active");
        }
    })
})
// ------------------------------------------------------------------------------------

// ----------------------- ПОДСВЕТКА РАМКИ У ЧЕКБОКСОВ --------------------------------
document.querySelectorAll('label.checkbox-block input[type="checkbox"]').forEach(function(item) {
    item.addEventListener("change", function() {
        // смотрим свойство checked:true у отмеченного чекбокса, на основе этого свойства и будем делать проверку
        // console.dir(item);
        if (item.checked) {
            // добавляем класс
            item.closest("label").classList.add("checkbox-block--active");
        } else {
            // убираем класс
            item.closest("label").classList.remove("checkbox-block--active");
        }
    })
})
// ------------------------------------------------------------------------------------

// -------------------- FUNCTION 1 ------------------------------------------------------
// ФУНКЦИЯ ПО НАВИГАЦИИ ВПЕРЕД И НАЗАД
function navigate(direction, thisCard) {
    // получаем номер текущей карточки
    let thisCardNumber = parseInt(thisCard.dataset.card);
    let nextCardNumber;

    //если идем вперед, то плюсуем 1 к номеру карточки, если назад - вычитаем 1
    if (direction == "next") {
        nextCardNumber = thisCardNumber + 1;
    } else if (direction == "prev") {
        nextCardNumber = thisCardNumber - 1;
    }

    // скрываем текущую карточку
    thisCard.classList.add("hidden");
    // ищем следующую карточку
    let nextCard = document.querySelector(`[data-card="${nextCardNumber}"]`);
    // показываем следующую карточку
    nextCard.classList.remove("hidden");  
}
// --------------------- END OF FUNCTION 1 -------------------------------------------

// -------------------- FUNCTION 2 ---------------------------------------------------
// ФУНКЦИЯ ПО СБОРУ ДАННЫХ С КАРТОЧКИ (радиокнопки, чекбоксы, инпуты) и формировать объект data
function gatherCardData(number) {

    let question;
    let result = [];

    // находим карточку по номеру и data-аттрибуту
    let currentCard = document.querySelector(`[data-card="${number}"]`);
    // находим главный вопрос карточки question
    question = currentCard.querySelector("[data-question").innerText;

    // Находим все заполненные значения из радио-кнопок и чекбоксов
    let controls = currentCard.querySelectorAll('[type="checkbox"], [type="radio"]');
    controls.forEach(function(item) {
        if (item.checked) {
            result.push({
                name: item.name,
                value: item.value 
            })
        }
    })

    // Находим все заполненные значения из инпутов
    let inputValues = currentCard.querySelectorAll('[type="text"], [type="email"], [type="number"]');
    inputValues.forEach(function(item) {
        itemValue = item.value;
        // если после удаления пробельных символом не получаем пустую строку, то добавляем в result
        if (itemValue.trim() != "") {
            result.push({
                name: item.name,
                value: item.value
            });
        }
    })

    let data = {
        question: question,
        answer: result
    }

    return data;
}
// --------------------- END OF FUNCTION 2 -------------------------------------------

// -------------------- FUNCTION 3 ---------------------------------------------------
// функция, которая будет записывать все собранные с карточек данные в объект answers
// записывать данные будем только при движении вперед и только те данные, которые отвалидированы
// функция будет обращаться к объекту answers, и будет внутри него либо находить, либо создавать новое свойство с номером карточки [number]
// и будет записывать объект с данными, который возвращает функция gatherCardData (возвращает --> data)
function saveAnswer(number, data) {
    answers[number] = data;
}
// --------------------- END OF FUNCTION 3 -------------------------------------------

// -------------------- FUNCTION 4 ---------------------------------------------------
// ФУНКЦИЯ ПРОВЕРКИ НА ЗАПОЛНЕННОСТЬ
function isFilled(number) {
    // если у объекта answers у текущей карточки внутреннее свойство answer (является массивом) при проверке lenght > 0, возвращаем с true, иначе - false
    return answers[number].answer.length > 0
}
// --------------------- END OF FUNCTION 4 -------------------------------------------

// -------------------- FUNCTION 5 ---------------------------------------------------
// ФУНКЦИЯ ПРОВЕРКИ EMAIL
function validateEmail(email) {
    // паттерн проверки на корректный email
    let pattern = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    // проверяет, соответствует ли введенный email паттерну
    return pattern.test(email);
    // если передали функции верный мэйл, то функция вернет true
}
// --------------------- END OF FUNCTION 5 -------------------------------------------

// -------------------- FUNCTION 6 ---------------------------------------------------
// ФУНКЦИЯ ПРОВЕРКИ НА ЗАПОЛНЕННОСТЬ required чекбоксов и инпутов с email
function checkOnRequired(number) {
    let currentCard = document.querySelector(`[data-card="${number}"]`);
    // считываем все необходимые поля с текущей карточки (в HTML коде добавили значения required к полям с email и checkbox в 5-й карточке)
    let reqiuredFields = currentCard.querySelectorAll("[required]");
    // возвращается Nodelist, то есть массив. Нужно пройтись по каждому элементу и посмотреть, удовлетворяет ли элемент условиям: если чекбокс, то нажат ли он, а если емэйл, то в значении value введен корректрый мэйл или нет

    // создаем массив (пока пустой), который будет "красным флагом" валидации в коде далее, сюда для каждого элемента, который не прошел валидацию, будет записывать false. И если в данном массиве будет хоть один false, то для карточки в целом валидация не пройдена, и мы не пускаем далее
    let isValidArray = []
    // проходимся по найденным полям и выводим в виде объектов type и value (и checked), чтобы посмотреть все ли отмечается
    reqiuredFields.forEach(function(item) {
        // console.dir(item.type);
        // console.dir(item.value);
        // console.dir(item.checked);

        // пишем проверки для всех required полей условием "если НЕ заполнено" (то валидацию не прошли)
        if (item.type == "checkbox" && item.checked == false) {
            isValidArray.push(false);
        } else if (item.type == "email") {
            if (validateEmail(item.value)) {
                isValidArray.push(true);
            } else {
                isValidArray.push(false);
            }
        }
    });

    // если в массиве isValidArray есть хоть один false, то покажется его индекс
    if (isValidArray.indexOf(false) == -1) {
        return true;
    } else {
        return false;
    }
}
// --------------------- END OF FUNCTION 6 -------------------------------------------

// -------------------- FUNCTION 7 ---------------------------------------------------
// ФУНКЦИЯ ОТОБРАЖЕНИЯ ПРОГРЕСС-БАРА
function updateProgressBar(direction, cardNumber) {

    // рассчет количества карточек
    // получаем массив NodeList, состоящий из количества карточек (длина массива)
    let cardsTotalNumber = document.querySelectorAll("[data-card]").length;

    // текущая карточка
    // проверка направления перемещения
    if (direction == "next") {
        cardNumber = cardNumber + 1;
    } else if (direction == "prev") {
        cardNumber = cardNumber - 1;
    }

    // рассчет % прохождения
    let progress = (cardNumber * 100) / cardsTotalNumber;
    // убираем знаки после запятой
    progress = progress.toFixed();

    //  Обновление прогресс-бара
    // ищем актуальную карточку
    let currentCard = document.querySelector(`[data-card="${cardNumber}"]`);
    // ищем в карточке шкалу прогресса
    let progressBar = currentCard.querySelector(".progress");
    if (progressBar) {
        // обновляем значение прогресса
        currentCard.querySelector(".progress__label strong").innerText = `${progress}%`;
        // обновляем полоску прогресса
        currentCard.querySelector(".progress__line-bar").style = `width: ${progress}%`;
    }
}
// --------------------- END OF FUNCTION 7 -------------------------------------------

/*
упрощенная функция checkOnRequired(number) {
    const currentCard = document.querySelector(`[data-card="${number}"]`);
    
    const reqiuredFields = currentCard.querySelectorAll("[required]");

    let isValid = true;

    reqiuredFields.forEach(function(item) {
        if ((item.type == "checkbox" && item.checked == false) || (item.type == "email" && !validateEmail(item.value))) {
            isValid = false;
        }
    });

    return isValid;
}
*/