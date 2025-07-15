//Selectores
const categoriasSelect = document.querySelector('#categorias');
const resultados = document.querySelector('#resultados');
const favoritosDiv = document.querySelector('.favoritos');

//Instanciar el modal de bootstrap
const modal = new bootstrap.Modal('#modal', {});

//Objeto Global para guardar en favoritos
let favoritos = [];

function iniciarApp(){
    //Pagina de inicio 
    if(categoriasSelect){
        //Obtener las recetas
        categoriasSelect.addEventListener('change', obtenerRecetas);

        //Mostrar las categorias en el select
        obtenerCategorias();
    }

    //Pagina para mostrar favoritos
    if(favoritosDiv){
        mostrarFavoritos();
    }

    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    scrollClass();
}

//Cargar las funciones y el documento
document.addEventListener('DOMContentLoaded', iniciarApp);


//Funciones////////////////////////////////////////////////////////////////////////////////////////////////S
//Categorias////
function obtenerCategorias(){
    //Obtener la URL
    const URL = `https://www.themealdb.com/api/json/v1/1/categories.php`;

    //Utilizar Fetch
    fetch(URL)
        .then(respuesta => respuesta.json())
        .then(categorias => {
            //Pasar los resultados para listar
            mostrarCategorias(categorias.categories)
        })
}

function mostrarCategorias(categorias = []){
    //Iterar en el arreglo de categorias para mostrarlas
    categorias.forEach(categoria => {
        //Crear elemento HTML
        const optionCategoria = document.createElement('option');
        optionCategoria.textContent = categoria.strCategory;
        optionCategoria.value = categoria.strCategory;

        categoriasSelect.appendChild(optionCategoria);
    });

}

//Mostrar recetas
function obtenerRecetas(e){
    //Obtener el valor
    const categoriaReceta = e.target.value;

    //Crear la url e inyectar el valor(categoria)
    const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoriaReceta}`;

    spinner();

    //Utilizar fetch
    fetch(URL)
        .then(respuesta => respuesta.json())
        .then(recetas => {

            setTimeout(() => {
                //Limpiar HTML previo
                limpiarHTML(resultados);

                //Mostrar recetas
                mostrarRecetas(recetas.meals);
            }, 2500);
            
        })
}

function mostrarRecetas(recetas = []){

    //Iterar el arreglo de recetas
    recetas.forEach(receta => {
        const { idMeal, strMeal, strMealThumb } = receta;

        //Crear el HTML
        //Card Div
        const cardDiv = document.createElement('DIV');
        cardDiv.classList.add('col-sm-12', 'col-md-6', 'col-lg-4', 'col-xl-3', 'gap-2', 'mb-3');

        //Card
        const card = document.createElement('DIV');
        card.classList.add('card', 'shadow', 'text-center', 'mb-3');

        //Card image
        const cardImage = document.createElement('IMG');
        cardImage.classList.add('card-img-top');
        cardImage.src = strMealThumb ?? receta.imagen;

        //Card Body
        const cardBody = document.createElement('DIV');
        cardBody.classList.add('card-body', 'py-3');

        //Card Title
        const cardTitle = document.createElement('H5');
        cardTitle.classList.add('card-title', 'mb-3');
        cardTitle.textContent = strMeal ?? receta.nombre;

        //Card Button
        const cardButton = document.createElement('BUTTON');
        cardButton.classList.add('btn', 'btn-warning', 'w-100');
        cardButton.textContent = 'Ver receta';
        cardButton.onclick = () => {
            obtenerDatosReceta(idMeal ?? receta.id);
        }

        //Inyectar al HTML
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardButton);

        card.appendChild(cardImage);
        card.appendChild(cardBody);

        cardDiv.appendChild(card);

        resultados.appendChild(cardDiv); 
    });
}

//Obtener datos de la receta
function obtenerDatosReceta(id){
    //Crear la URL
    const URL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    //Utilizar fetch
    fetch(URL)
        .then(respuesta => respuesta.json())
        .then(DatosReceta => {
            mostrarReceta(DatosReceta.meals[0]);
        });
}

//Mostrar datos de la receta
function mostrarReceta(receta){
    //Variables
    const { idMeal, strMeal, strMealThumb, strInstructions, strYoutube} = receta;

    //Selectores
    const titulo = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body')

    //Limpiar HTML previo
    limpiarHTML(modalBody);

    //Crear el html
    //Titulo
    titulo.textContent = strMeal;

    //Imagen
    const imagen = document.createElement('IMG');
    imagen.classList.add('img-fluid', 'rounded', 'mb-3', 'mx-auto', 'd-block');
    imagen.src = strMealThumb;
    
    //Ingredientes
    const tituloIngredientes = document.createElement('H5');
    tituloIngredientes.textContent = 'Ingredientes:';
    tituloIngredientes.classList.add('mb-3', 'px-3');
    const listaIngredientes = document.createElement('UL');
    listaIngredientes.classList.add('list-group', 'list-group-flush', 'mb-3');
    
    //Mostrar cantidades e ingredientes
    for(let i = 1; i <= 20; i++){
        if(receta[`strIngredient${i}`]){
            const ingrediente = receta[`strIngredient${i}`];
            const cantidad = receta[`strMeasure${i}`];

            //Renderizar los datos en el HTML
            const ingredientes = document.createElement('LI');
            ingredientes.classList.add('list-group-item');
            ingredientes.innerHTML = `<span class="fw-bold">${ingrediente}</span> - ${cantidad}`;

            listaIngredientes.appendChild(ingredientes);
        }
    }

    //Instrucciones
    const instruccionesTitulo = document.createElement('H3');
    instruccionesTitulo.classList.add('mb-3', 'px-3');
    instruccionesTitulo.textContent = 'Instrucciones:';

    const instrucciones = document.createElement('P');
    instrucciones.classList.add('lh-sm', 'mb-3', 'px-3');
    instrucciones.textContent = strInstructions;

    //Boton de Youtube
    const divVideo = document.createElement('DIV');
    divVideo.classList.add('d-grid');
    const video = document.createElement('A');
    video.classList.add('text-center', 'btn', 'btn-outline-danger');
    video.href = strYoutube;
    video.innerHTML = `
        <i class="bi bi-play-btn-fill"></i>
        Ver en Youtube
    `;
    divVideo.appendChild(video);

    modalBody.appendChild(imagen);
    modalBody.appendChild(tituloIngredientes);
    modalBody.appendChild(listaIngredientes);
    modalBody.appendChild(instruccionesTitulo);
    modalBody.appendChild(instrucciones);
    modalBody.appendChild(divVideo);


    //Sección de botones
    const modalFooter = document.querySelector('.modal-footer');

    limpiarHTML(modalFooter);

    //Boton de guardar
    const botonFavorito = document.createElement('BUTTON');
    botonFavorito.classList.add('btn', 'btn-danger', 'col');
    botonFavorito.innerHTML = validarReceta(idMeal) ? `<i class="bi bi-x-circle"></i> Eliminar de favoritos` : `<i class="bi bi-heart"></i> Me gusta`;

    botonFavorito.onclick = function(){
        //Validar si ya esta la receta guardada en favoritos
        if(validarReceta(idMeal)){
            //Mostrar mensaje de exito al eliminar
            Swal.fire({
                icon: "error",
                title: "Se ha borrado de favoritos",
            });

            //Eliminar receta de favoritos
            eliminarFavoritos(idMeal);

            botonFavorito.innerHTML = `
                <i class="bi bi-heart"></i>
                Me gusta
            `;

            return;
        }

        //Pasar la información a la función
        guardarReceta({
            id: idMeal,
            nombre: strMeal,
            imagen: strMealThumb
        });

        Swal.fire({
            title: "Se agrego a favoritos!",
            icon: "success",
            draggable: true
        });

        botonFavorito.innerHTML = `<i class="bi bi-x-circle"></i> Eliminar de favoritos`;
    }

    //Boton Cerrar modal
    const botonCerrar = document.createElement('button');
    botonCerrar.classList.add('btn', 'btn-outline-secondary', 'col', 'text-center')
    botonCerrar.innerHTML = `
        <i class="bi bi-box-arrow-right"></i>
        Salir
    `;
    botonCerrar.onclick = function(){
        modal.hide();
    }

    modalFooter.appendChild(botonFavorito);
    modalFooter.appendChild(botonCerrar);

    modal.show();
}

//Guardar en favoritos las recetas 
function guardarReceta(receta){
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    favoritos = [...favoritos, receta];

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

//Validar si ya existe la receta guardada
function validarReceta(id){
    return favoritos.some(favorito => favorito.id === id);
}

//Eliminar receta de favoritos
function eliminarFavoritos(id){
    favoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

//Mostrar Favoritos
function mostrarFavoritos(){
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    if(favoritos.length){
        mostrarRecetas(favoritos);

        return;
    }

    const encavezado = document.querySelector('.favoritosEncavezado');
    const texto = document.createElement('P')
    texto.classList.add('lead', 'fs-4', 'text-warning');
    texto.textContent = 'Aún no has seleccionado alguna receta favorita'
    encavezado.appendChild(texto);
}

//Helpers
function scrollClass(){
    const navBar = document.querySelector('.navbar');

    if(categoriasSelect){
        window.addEventListener('scroll', function(){
            if(this.window.scrollY > 50){
                navBar.classList.add('bg-dark', 'navbar-sticky');
            }else{
                navBar.classList.remove('bg-dark', 'navbar-sticky');
            }
        });
        return;
    }
    
}

function limpiarHTML(referencia){
    while(referencia.firstChild){
        referencia.removeChild(referencia.firstChild);
    }
}

function spinner(){
    //limpiar html previo
    limpiarHTML(resultados);

    const spinner = document.createElement('DIV');
    spinner.classList.add('text-center');

    spinner.innerHTML = `
        <div class="spinner-border text-warning" style="width: 8rem; height: 8rem;" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;

    resultados.appendChild(spinner);
}