//TP4 - IA - David Piedrabuena

//Listado de imágenes con líneas
var listadoImagenes = 
    [{file: "lineas.png"},
    {file: "lineas2.png"},
    {file: "lineas3.png"},
    {file:"rectangulo.png"},
    {file:"circulo.png"},
    {file:"circulos.png"}];

var defaultIndex = 0;

function mostrarImagen(){
    borrarImagenes();
    var statusDiv = document.querySelector('#status');
    statusDiv.innerHTML  = "";

    var selectedImage;
    if(!this.value){
        selectedImage = listadoImagenes[defaultIndex].file;
    }  else {
        selectedImage = listadoImagenes[this.value].file;
    }
    //Se carga la imagen seleccionada
    var image = new Image();
    image.src = "img/" + selectedImage;

    var imageContainer = document.querySelector('#imgOriginal');

    while(imageContainer.hasChildNodes()){
        imageContainer.removeChild(imageContainer.lastChild);
    }
    imageContainer.appendChild(image);
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


function transformar(){
    borrarImagenes();

    var originalImage  = document.querySelector('#imgOriginal').firstChild;
    var requestedType  = document.querySelector('#hough-select').selectedOptions[0].value;
    hough = new HoughAnalyser(originalImage, requestedType);
    hough.run();
}

document.addEventListener("houghImageFinished", function(e) {
    var temp =  document.querySelector('#imgAcumulador');
    while(temp.hasChildNodes()){
        temp.removeChild(temp.lastChild);
    }

    var imgSinFiltrado = document.querySelector('#imgAcumulador')
    for(var i = 0; i < hough.houghImageData.length; i++){
        var canvas = document.createElement('canvas');
        canvas.width = hough.houghImageData[i].width;
        canvas.height = hough.houghImageData[i].height;

        var context = canvas.getContext('2d');

        context.putImageData(hough.houghImageData[i], 0, 0);

        var div = document.createElement('div');
        div.classList.add('imageContainer');
        div.classList.add('left');
        div.appendChild(canvas);
        imgSinFiltrado.appendChild(div);
    }
    console.log("appending")
    document.querySelector('#imgAcumulador').appendChild(imgSinFiltrado);
});



document.addEventListener("filteredHoughImageFinished", function(e){
    var container =  document.querySelector('#imgAcumuladorFiltrada');
    while(container.hasChildNodes()){
        container.removeChild(container.lastChild);
    }

    var canvas = document.createElement('canvas');
    canvas.width = hough.filteredHoughImageData[0].width;
    canvas.height = hough.filteredHoughImageData[0].height;

    var context = canvas.getContext('2d');
    context.putImageData(hough.filteredHoughImageData[0], 0, 0);

    container.appendChild(canvas);
});

document.addEventListener("resultImageFinished", function(e) {

    var container = document.querySelector('#imgLineasOriginales');
    while(container.hasChildNodes()){
        container.removeChild(container.lastChild);
    }

    container.appendChild(hough.resultImage);
});

document.addEventListener("status", function(e) {
    var statusDiv = document.querySelector('#status');
    statusDiv.innerHTML  = e.detail.message;
})



inicializar();