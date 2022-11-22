//TP4 - IA - David Piedrabuena

//Listado de imágenes con líneas
var listadoImagenes = 
    [{file: "lineas.png"},
    {file: "lineas2.png"},
    {file: "lineas3.png"},
    {file:"rectangulo.png"},
    {file:"circulo.png"},
    {file:"circulos.png"}];



function mostrarImagen(){
    borrarImagenes();
    var statusDiv = document.querySelector('#status');
    statusDiv.innerHTML  = "";

    var auxImagen;
    if(!this.value){ //Si no se selecciona ninguno por defecto será el primero
        auxImagen = listadoImagenes[0].file;
    }  else {
        auxImagen = listadoImagenes[this.value].file;
    }
    //Se carga la imagen seleccionada
    var image = new Image();
    image.src = "img/" + auxImagen;

    var imgContenedor = document.querySelector('#imgOriginal');

    while(imgContenedor.hasChildNodes()){
        imgContenedor.removeChild(imgContenedor.lastChild);
    }
    imgContenedor.appendChild(image);
}

function borrarImagenes(){
    var temp =  document.querySelector('#imgAcumulador');
    while(temp.hasChildNodes()){
        temp.removeChild(temp.lastChild);
    }
    var temp =  document.querySelector('#imgAcumuladorFiltrada');
    while(temp.hasChildNodes()){
        temp.removeChild(temp.lastChild);
    }
    var temp =  document.querySelector('#imgLineasOriginales');
    while(temp.hasChildNodes()){
        temp.removeChild(temp.lastChild);
    }
}



//Función para listar las imágenes para testear
function crearListado(){
    for(var i=0; i< listadoImagenes.length; i++){
        var option = document.createElement('option');
        option.value = i;
        option.textContent = listadoImagenes[i].file; 
        document.querySelector('#imgSeleccionada').appendChild(option);
        document.querySelector('#imgSeleccionada').addEventListener('change', mostrarImagen);
    }
}

//Inicializamos la imagen que se muestra por defecto
function inicializar(){
    crearListado();
    mostrarImagen();
};


var hough;

//Función que se ejecuta cuando se presiona el botón
function transformar(){
    borrarImagenes(); //Se borran las imágenes

    //Se carga la imagen original en una variable y se pasa como parámetro 
    //para procesarla
    var imagenOriginal  = document.querySelector('#imgOriginal').firstChild;
    var requestedType  = document.querySelector('#hough-select').selectedOptions[0].value;
    hough = new Hough(imagenOriginal, requestedType);
    hough.run();
}

document.addEventListener("houghImageFinished", function(e) {
    var temp =  document.querySelector('#imgAcumulador');
    while(temp.hasChildNodes()){
        temp.removeChild(temp.lastChild);
    }

    var imgSinFiltrado = document.querySelector('#imgAcumulador')
    for(var i = 0; i < hough.imagenHough.length; i++){
        var canvas = document.createElement('canvas');
        canvas.width = hough.imagenHough[i].width;
        canvas.height = hough.imagenHough[i].height;

        var context = canvas.getContext('2d');

        context.putImageData(hough.imagenHough[i], 0, 0);

        var div = document.createElement('div');
        div.classList.add('imgContenedor');
        div.classList.add('left');
        div.appendChild(canvas);
        imgSinFiltrado.appendChild(div);
    }
    console.log("appending")
    document.querySelector('#imgAcumulador').appendChild(imgSinFiltrado);
});



document.addEventListener("filteredHoughImageFinished", function(e){
    var contenedor =  document.querySelector('#imgAcumuladorFiltrada');
    while(contenedor.hasChildNodes()){
        contenedor.removeChild(contenedor.lastChild);
    }

    var canvas = document.createElement('canvas');
    canvas.width = hough.filteredHoughImageData[0].width;
    canvas.height = hough.filteredHoughImageData[0].height;

    var context = canvas.getContext('2d');
    context.putImageData(hough.filteredHoughImageData[0], 0, 0);

    contenedor.appendChild(canvas);
});

document.addEventListener("resultImageFinished", function(e) {

    var contenedor = document.querySelector('#imgLineasOriginales');
    while(contenedor.hasChildNodes()){
        contenedor.removeChild(contenedor.lastChild);
    }

    contenedor.appendChild(hough.resultImage);
});

document.addEventListener("status", function(e) {
    var statusDiv = document.querySelector('#status');
    statusDiv.innerHTML  = e.detail.message;
})



inicializar();