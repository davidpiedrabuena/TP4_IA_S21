
//Declaración de variables necesarias para el graficado
var radianes = [];
var seno  = [];
var coseno = [];
var radRango = 0;

function calcularMaxIntFactor(arreglo){
    var maxAcumulado = Number.MIN_VALUE;
    var minAcumulado = Number.MAX_VALUE;

    for(var i = 0; i  < arreglo.length; i++){
        for(var j = 0; j < arreglo[0].length; j++){
            if(arreglo[i][j] < minAcumulado && arreglo[i][j] != 0){
                minAcumulado = arreglo[i][j] ;
            }
            if(arreglo[i][j] > maxAcumulado && arreglo[i][j] != 0){
                maxAcumulado = arreglo[i][j];
            }
        }
    }
    return 255 / maxAcumulado;

}

//Creación del acumulador
function crearAcumulador(source){
    var radianesStep = Math.PI / source.width;
    radianes = [];
    seno  = [];
    coseno = [];


    for(var auxRad = 0, i = 0; auxRad < Math.PI; auxRad += radianesStep, i++){
        radianes[i] = auxRad;
        seno[i]   = Math.sin(auxRad);
        coseno[i]  = Math.cos(auxRad);
    }

    var imagen   = new Image();
    var canvas  = document.createElement('canvas');
    var context = canvas.getContext('2d');

    imagen.src = source.src;
    canvas.width = imagen.width;
    canvas.height = imagen.height;

    context.dibujarImagen(imagen, 0, 0);

    var posCenterX = Math.floor(source.width * 0.5);
    var posCenterY = Math.floor(source.height * 0.5);

    var auxImg = context.getImageData(0, 0, source.width, source.height);
    var ditanciaMax = Math.sqrt((imagen.width * imagen.width) + (imagen.height * imagen.height)) * 0.5;
    var overAllRadii = [];

    for(var i = 0, j = 0, posX = -posCenterX, posY = posCenterY;
        i < auxImg.data.length;
        i+=4, j++, posX++){

        if(i % (4 * source.width) == 0 && i != 0){
            posY--;
            posX = -posCenterX;
        }

        if(auxImg.data[i] == 0 && auxImg.data[i+1] == 0 && auxImg.data[i+2] == 0){
            continue;
        }

        var currentRadii = [];

        for(var a = 0; a < radianes.length; a++){
            currentRadii[a] = Math.floor((posX * coseno[a]) + (posY * seno[a])) ;
        }
        overAllRadii.push(currentRadii);
    }

    var maxValueRadii = Number.MIN_VALUE;
    var minValueRadii = Number.MAX_VALUE;

    for(var i = 0; i < overAllRadii.length; i++){
        for(var j = 0; j < overAllRadii[0].length; j++){
            if(overAllRadii[i][j] < minValueRadii){
                minValueRadii = overAllRadii[i][j] ;
            }
            if(overAllRadii[i][j] > maxValueRadii){
                maxValueRadii = overAllRadii[i][j];
            }
        }
    }

    radRango = Math.abs(minValueRadii) + Math.abs(maxValueRadii);
    var matrizAcumulacion = [];

    for(var i = 0; i < radianes.length; i++){
        matrizAcumulacion[i] = [];
        for(var j = 0; j < source.height; j++){
            matrizAcumulacion[i][j] = 0;
        }
    }

    var offset = radRango * 0.5;
    var factorRangeToImage = source.height / radRango;


    for(var currentPoint = 0; currentPoint < overAllRadii.length; currentPoint++){
        for(var auxRad = 0; auxRad < radianes.length; auxRad++){
            var currentValue = overAllRadii[currentPoint][auxRad];
            matrizAcumulacion[auxRad][Math.floor((currentValue + offset) * factorRangeToImage)] += 1;
        }
    }
    return matrizAcumulacion;
}

function graficarAcumulador(arreglo, target){
    var canvas  = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var factormaxAcumuladoToImage = calcularMaxIntFactor(arreglo);

    canvas.height =  arreglo[0].length;
    canvas.width  =  arreglo.length;

    var Umbral = document.querySelector('#Umbral-select').value;
    var resultImageData = context.createImageData(canvas.width, canvas.height);
    for(var y = 0, i = 0; y < canvas.height; y++){
        for(var x = 0; x < canvas.width; x++, i+=4){
            var currentValue =  Math.floor(arreglo[x][y] * factormaxAcumuladoToImage);
            resultImageData.data[i] = resultImageData.data[i+1] = resultImageData.data[i+2] = currentValue;
            resultImageData.data[i+3] = 255;
        }
    }
    context.putImageData(resultImageData, 0, 0);

    while(target.hasChildNodes()){
        target.removeChild(target.lastChild);
    }
    target.appendChild(canvas);

}


//Función para dibujar la gráfica
function dibujarLinea(context, radio, radiant, centerX, centerY){
    var y1, y2, x1, x2;

    if(radiant > Math.PI/4 && radiant < Math.PI*2/3){
        x1 = -centerX ;
        y1 = (radio - x1 * Math.cos(radiant)) / Math.sin(radiant);

        x2 = centerX;
        y2 = (radio - x2 * Math.cos(radiant)) /  Math.sin(radiant);
    } else {
        y1 = -centerY;
        x1 = (radio - y1 *  Math.sin(radiant)) / Math.cos(radiant);

        y2 = centerY;
        x2 = (radio - y2 *  Math.sin(radiant)) / Math.cos(radiant);
    }

    context.strokeStyle = "#FF0000";
    context.beginPath();
    context.moveTo(centerX + x1, centerY + y1);
    context.lineTo(centerX + x2, centerY + y2);
    context.stroke();

}

//Dibuja las líneas y se le pasa como parámetro el arreglo
function dibujarLineas(arreglo, source, target){

    while(target.hasChildNodes()){
        target.removeChild(target.lastChild);
    }

    var centerX = Math.round(source.width * 0.5);
    var centerY = Math.round(source.height * 0.5);

    var canvas  = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width  = source.width;
    canvas.height = source.height;

    context.dibujarImagen(source, 0, 0);
    for(var i = 0; i < arreglo.length; i++){
        for(var j = 0; j < arreglo[0].length; j++){
            if(arreglo[i][j] > 0){

                var radiant = radianes[i];
                var radio  = (j * radRango / source.height) - (radRango * 0.5);
                dibujarLinea(context, radio, -radiant, centerX, centerY);
            }
        }
    }

    target.appendChild(canvas);

}

function aplicarUmbral(arreglo){
    for(var i = 0; i < arreglo.length; i++){
        for(var j = 0; j < arreglo[0].length; j++){
            if(arreglo[i][j] < selectedUmbral){
                arreglo[i][j] = 0;
            }
        }
    }
    return arreglo;
}

function determinarMaximo(arreglo){
    for(var i = 0; i < arreglo.length; i++){
        for(var j = 0; j < arreglo[0].length; j++){
            for(var k = i - 3; k < i + 3; k++){
                if(k < 0 || k > arreglo.length - 1){
                    continue;
                }
                for(var l = j - 3; l < j + 3; l++){
                    if(l < 0 ||l > arreglo[0].length - 1){
                        continue;
                    }
                    if(arreglo[k][l] > arreglo[i][j]){
                        arreglo[i][j] = 0;
                    }
                }
            }
        }
    }
    return arreglo;
}


function runApplication(){
    var imagenOriginal  = document.querySelector('#imgOriginal').firstChild;
    var acumuladorDiv = document.querySelector('#imgAcumulador');
    var acumulador         = crearAcumulador(imagenOriginal);
    graficarAcumulador(acumulador, acumuladorDiv);

    var acumuladorDivUmbral = document.querySelector('#imgAcumuladorFiltrada');
    var acumuladorFiltered = determinarMaximo(aplicarUmbral(acumulador));
    graficarAcumulador(acumuladorFiltered, acumuladorDivUmbral);
    var imagenOriginalWithLines  = document.querySelector('#imgLineasOriginales');
    dibujarLineas(acumuladorFiltered, imagenOriginal, imagenOriginalWithLines);
}