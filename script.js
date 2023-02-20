async function getProductsList(limit) { //получаем список с API
    let response = await fetch(`https://dummyjson.com/products/?limit=${ limit }`); // отправляем запрос 
    if (response.ok) { // проверяем ответ на отсутсвие ошибок
        let json = await response.json(); // получаем json
        return json; // возвращаем ответ 
    } else {
        return alert("Ошибка HTTP: " + response.status); // в случае ошибки выводим в alert
    }  
}


const sortTypes = { // определяем типы сортировки
    "unsorted": "0",
    "byPrice": "1",
    "byDiscount": "2",
}
const limitSelect = document.querySelector(".limit"); // получаем html элемент селектора лимита
const sortTypeSelect = document.querySelector(".sort"); // получаем html элемент селектора сортировки
const defaultLimit = 10; // определяем значение лимита по умолчанию
const defaultSortType = sortTypes.unsorted; // определяем тип сортировки по умолчанию

// вызываем функцию для отображения списка с параметрами по умолчанию 
getProductsList(defaultLimit).then((json) => {
    displayList(json.products, defaultLimit, defaultSortType);
});
// функция для отображения списка с указанной сортировкой
const displayList = (products, limit, sortType) => {
    // проверяем существует ли уже список, если да, удаляем его
    if (document.querySelector(".productsList")) {  
        document.body.removeChild(document.querySelector(".productsList"));
    }
    // сортируем список
    switch (sortType) {
        case sortTypes.byPrice:
            products.sort((a, b) => b.price - a.price);
            break;
        case sortTypes.byDiscount:
            products.sort((a, b) => b.discountPercentage - a.discountPercentage);
            break;
        default:
            break;
    }
    const productsList = document.createElement("ul"); // создаем элемент списка
    productsList.classList.add("productsList"); // добавляем ему класс productsList
    // проходим по всем элементам списка и создаем html елементы
    const items = products.map((element, index) => {
        const product = document.createElement("li"); // создаем элемент продукта
        product.classList.add("product"); // добавляем ему класс продукт
        product.innerHTML = `<p class="productTitle">${ element.title }<p>`; // заполняем контентом
        const productInformation = document.createElement("div"); // создаем карточку с информацией о товаре
        productInformation.style = `top:${ -(500 - 50) * index / (limit - 1) }px`; // задаем ей вертикальный сдвиг, чтобы карточка не выходила за пределы списка
        productInformation.classList.add("productInformation"); // добавляем ему класс productInformation
        //заполнием контентом
        productInformation.innerHTML = `<img src="${ element.images[0] }"/> 
                                        <h3 class="title">${ element.title }</h3>
                                        <p class="brand">Brand: ${ element.brand }</p>
                                        <p class="description"> ${ element.description }<p>
                                        <p class="price">Price: ${ element.price }$ (-${ element.discountPercentage }%)<p>`

        product.appendChild(productInformation); // добавляем карточку в продукт
        productsList.appendChild(product); // добавляем продукт в список
        return product;
    });

    //drag and drop
    var dragSrcEl = null; // переменная для определения выбранного элемента
    // обработчик начала перетаскивания
    function handleDragStart(e) {
        this.style.opacity = '0.4'; // задаем прозрачность для перетаскиваемого объекта
        dragSrcEl = this; // запоминаем перетаскиваемый объект   
        e.dataTransfer.effectAllowed = 'move'; // задаем эффект перетаскивания
        e.dataTransfer.setData('text', this.innerHTML); // устанавливаем элемент как перетаскиваем
    }
    // обработчик перетаскивания
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // отменяем дефолтное событие
        }
        e.dataTransfer.dropEffect = 'move'; // задаем эффект перетаскивания    
        return false;
    }
    // обработчик перетаскивания
    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();  // останавливаем распостранение события
        }
        // проверяем что текущий элемент не является изначально выбранным
        if (dragSrcEl != this) {
            const secondStyle = this.querySelector(".productInformation").style.top; // запоминаем смещение элемента на который меняем
            const firstStyle = dragSrcEl.querySelector(".productInformation").style.top; // запоминаем смещение элемента который меняем
            
            // меняем элементы и стили местами
            dragSrcEl.innerHTML = this.innerHTML; 
            dragSrcEl.querySelector(".productInformation").style.top = firstStyle; 
            this.innerHTML = e.dataTransfer.getData('text');
            this.querySelector(".productInformation").style.top = secondStyle;
            
        }        
        return false;
    }
    // обработчик окончания перетаскивания
    function handleDragEnd(e) {
        this.style.opacity = "1"; // возвращаем прозрачность
        if (sortTypeSelect.value != 0) { // сбрасываем тип сортировки т.к. элементы больше не отсортированны 
            sortTypeSelect.value = 0;
        }
    }
    // устанавливаем обработчики на элементы списка 
    items.forEach((item) => {
        item.draggable = true;
        item.addEventListener("dragstart", handleDragStart, false);
        item.addEventListener("dragover", handleDragOver, false);
        item.addEventListener("drop", handleDrop, false);
        item.addEventListener("dragend", handleDragEnd, false);
    });

    // добавляем список в тело
    document.body.appendChild(productsList);
};
// обработчик изменения сортировки и лимита 
function handleChange() {
    const limit = limitSelect.value; // получаем значенте лимита
    const sortType = sortTypeSelect.value; // получаем тип сортировки

    //получаем список продуктов и отображаем
    getProductsList(limit).then(products => {
        displayList(products.products, limit, sortType);
    });
}
//устанавливаем обработчики для лимита и сортировки
limitSelect.addEventListener("change", handleChange);
sortTypeSelect.addEventListener("change", handleChange);

