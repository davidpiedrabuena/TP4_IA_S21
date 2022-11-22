var Hough = function Hough(imagen, type) {
    return new Hough.fn.init(imagen, type);
};

var lineaHough = function lineaHough(parent) {
    return new lineaHough.fn.init(parent);
};


Hough.fn = Hough.prototype = {
    imagenOriginal: Image,
    canvasOriginal: HTMLCanvasElement,
    contextOriginal: CanvasRenderingContext2D,
    imageDataOriginal: ImageData,
    imagenHough: Array,
    filteredHoughImageData: Array,
    numEdgePixels: Number,
    edgePixels: Array,
    inputContainer: Object,
    init: function (imagen, type) {
        this.setupImage(imagen);
        this.houghImageFinishedEvent = new CustomEvent("houghImageFinished");        
        this.filteredHoughImageFinishedEvent = new CustomEvent("filteredHoughImageFinished");       
        this.resultImageFinishedEvent = new CustomEvent("resultImageFinished");            
        this.inputContainer = document.querySelector("#hough-input");
        switch (type) {
            case "lineas":
                this.analyser = new lineaHough(this);
                break;
            case "circulos":
                this.analyser = new CircleHoughAnalyser(this);
                break;
            default:
                console.log("Opción incorrecta: " + type);
        }
    },
    setupImage: function (imagen) {
        this.createInMemoryCopies(imagen);

        this.numEdgePixels = 0;
        this.edgePixels = [];

        var imageDataLength = this.imageDataOriginal.data.length;
        var factor =  Math.floor(4 * this.imageDataOriginal.width);

        for(var i = 0; i < imageDataLength; i+=4){
            if(this.imageDataOriginal.data[i] > 0){
                var edgePixel = [];

                edgePixel.x = Math.round(i % factor) * 0.25;
                edgePixel.y = Math.round(i / factor);
                edgePixel.i = i;

                this.edgePixels.push(edgePixel);
            }
        }
        this.numEdgePixels = this.edgePixels.length;
    },
    createInMemoryCopies: function (source) {

        this.imagenOriginal = new Image();
        this.canvasOriginal = document.createElement('canvas');
        this.contextOriginal = this.canvasOriginal.getContext('2d');

        this.imagenOriginal.src = source.src;
        this.canvasOriginal.width = source.width;
        this.canvasOriginal.height = source.height;

        this.contextOriginal.drawImage(this.imagenOriginal, 0, 0);
        this.imageDataOriginal = this.contextOriginal.getImageData(0, 0, this.imagenOriginal.width, this.imagenOriginal.height);

    },
    run: function () {
        this.analyser.start();

    },
    createSlider: function (container, labelText, id, stepSize, minValue, maxValue, value) {
        var li01 = document.createElement('li');
        var form01 = document.createElement('form');
        var label01 = document.createElement('label');
        var input01 = document.createElement('input');

        input01.id = id;
        input01.type = "range";
        input01.step = stepSize;
        input01.min = minValue;
        input01.max = maxValue;
        input01.value = value;


        label01.setAttribute("for", id);
        label01.innerHTML = labelText;

        form01.appendChild(label01);
        form01.appendChild(input01);
        li01.appendChild(form01);

        this.inputContainer.appendChild(li01);

        return li01;

    },
    
    actualizarEstado: function(message){
        var statusUpdate = new CustomEvent("status", {
            detail: {
                message: (message)
            }
        });
        document.dispatchEvent(statusUpdate);
    },
    
    houghImageFinished: function(){
        var event =  new CustomEvent("houghImageFinished");
        document.dispatchEvent(event);
    },
    
    filteredHoughImageFinished: function(){
        var event =  new CustomEvent("filteredHoughImageFinished");
        document.dispatchEvent(event);
    },
    
    resultImageFinished: function(){
        var event =  new CustomEvent("resultImageFinished");
        document.dispatchEvent(event);
    },
    
    clearInput: function () {
        var container = document.querySelector("#hough-input");
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
    }
}

lineaHough.fn = lineaHough.prototype = {
    constructor: lineaHough,
    rad: Array(),
    seno: Array(),
    coseno: Array(),
    knownRadiiRange: Number,
    parent: Object,
    centerOriginal: Array(),
    ditanciaMax: Number,
    arregloHough: Array(),
    arregloHoughFiltrado: Array(),
    selectedThreshold: Number,
    init: function (parent) {
        this.parent = parent;
        this.parent.clearInput();
        this.preCalculate();
        this.generateControls();
    },
    preCalculate: function () {
        this.radiansStep = Math.PI / this.parent.canvasOriginal.width;

        this.rad = [];
        this.seno = [];
        this.coseno = [];

        this.arregloHough = [];
        this.arregloHoughFiltrado = [];

        for (var currentRadian = 0, i = 0; currentRadian < Math.PI; currentRadian += this.radiansStep, i++) {
            this.rad[i] = currentRadian;
            this.seno[i] = Math.sin(currentRadian);
            this.coseno[i] = Math.cos(currentRadian);
        }


        this.centerOriginal["x"] = Math.floor(this.parent.imagenOriginal.width * 0.5);
        this.centerOriginal["y"] = Math.floor(this.parent.imagenOriginal.height * 0.5);


        this.ditanciaMax = Math.sqrt((this.parent.imagenOriginal.width * this.parent.imagenOriginal.width) + (this.parent.imagenOriginal.height * this.parent.imagenOriginal.height)) * 0.5;
    },
    start: function(){
        this.generateHoughImages();
        this.generateFilteredHoughImage();
        this.generateResultImage(this.arregloHoughFiltrado);
    },
    generateHoughImages: function () {
        if (this.arregloHough.length == 0) {
            this.crearArregloHough();
        }
        this.parent.imagenHough = [];
        this.parent.imagenHough[0] = this.generateImageData(this.arregloHough);

        document.dispatchEvent(this.parent.houghImageFinishedEvent);
    },
    generateFilteredHoughImage: function () {
        this.filterHoughArray();

        this.parent.filteredHoughImageData[0] = this.generateImageData(this.arregloHoughFiltrado);

        document.dispatchEvent(this.parent.filteredHoughImageFinishedEvent);
    },
    generateResultImage: function (arreglo) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = this.parent.imagenOriginal.width;
        canvas.height = this.parent.imagenOriginal.height;

        context.drawImage(this.parent.imagenOriginal, 0, 0);

        var maxRadius = Math.floor(Math.sqrt((this.parent.imagenOriginal.height * this.parent.imagenOriginal.height) + (this.parent.imagenOriginal.width * this.parent.imagenOriginal.width)));

        for (var i = 0; i < arreglo.length; i++) {
            for (var j = 0; j < arreglo[0].length; j++) {
                if (arreglo[i][j] > 0) {
                    var radiant = this.rad[i];
                    var radius = j - (maxRadius * 0.5);
                    this.drawLine(context, radius, -radiant, this.centerOriginal.x, this.centerOriginal.y);
                }
            }
        }
        this.parent.resultImage = canvas;

        document.dispatchEvent(this.parent.resultImageFinishedEvent);
    },
    crearArregloHough: function () {

        var datosOriginales = this.parent.imageDataOriginal;
        var imagenOriginal = this.parent.imagenOriginal;

        var matrizAcumulacion = [];
        var maxRadius = Math.floor(Math.sqrt((imagenOriginal.height * imagenOriginal.height) + (imagenOriginal.width * imagenOriginal.width)));

        for (var i = 0; i < this.rad.length; i++) {
            matrizAcumulacion[i] = [];
            for (var j = 0; j < maxRadius; j++) {
                matrizAcumulacion[i][j] = 0;
            }
        }

        for (var i = 0, j = 0, posX = -this.centerOriginal.x, posY = this.centerOriginal.y;
             i < datosOriginales.data.length;
             i += 4, j++, posX++) {

            if (i % (4 * imagenOriginal.width) == 0 && i != 0) {
                posY--;
                posX = -this.centerOriginal.x;
            }

            if (datosOriginales.data[i] == 0 && datosOriginales.data[i + 1] == 0 && datosOriginales.data[i + 2] == 0) {
                continue;
            }

            for (var a = 0; a < this.rad.length; a++) {

                var currentRadius = Math.floor((posX * this.coseno[a]) + (posY * this.seno[a]) + Math.floor(maxRadius * 0.5));
                matrizAcumulacion[a][currentRadius] += 1;
            }
        }

        this.arregloHough = matrizAcumulacion;
    },
    filterHoughArray: function () {
        if (this.arregloHough.length == 0) {
            this.crearArregloHough();
        }

        this.selectedThreshold = document.querySelector('#threshold-select').value;

        for (var i = 0; i < this.arregloHough.length; i++) {
            this.arregloHoughFiltrado[i] = [];
            for (var j = 0; j < this.arregloHough[0].length; j++) {
                if (this.arregloHough[i][j] < this.selectedThreshold) {
                    this.arregloHoughFiltrado[i][j] = 0;
                }
                else {
                    this.arregloHoughFiltrado[i][j] = this.arregloHough[i][j];
                }
            }
        }
        var aux = new Array();

        for (var i = 0; i < this.arregloHoughFiltrado.length; i++) {
            aux[i] = [];
            for (var j = 0; j < this.arregloHoughFiltrado[0].length; j++) {
                aux[i][j] = this.arregloHoughFiltrado[i][j];
            }
        }


        for (var i = 0; i < this.arregloHoughFiltrado.length; i++) {
            for (var j = 0; j < this.arregloHoughFiltrado[0].length; j++) {
                for (var k = i - 3; k < i + 3; k++) {
                    if (k < 0 || k > this.arregloHoughFiltrado.length - 1) {
                        continue;
                    }
                    for (var l = j - 3; l < j + 3; l++) {
                        if (l < 0 || l > this.arregloHoughFiltrado[0].length - 1) {
                            continue;
                        }
                        if (this.arregloHoughFiltrado[k][l] > this.arregloHoughFiltrado[i][j]) {

                            aux[i][j] = 0;
                        }
                    }
                }
            }
        }

        for (var i = 0; i < this.arregloHoughFiltrado.length; i++) {
            for (var j = 0; j < this.arregloHoughFiltrado[0].length; j++) {
                this.arregloHoughFiltrado[i][j] = aux[i][j];
            }
        }
    },
    generateImageData: function (arreglo) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var factorMaxAccumulatedToImage = this.calcularMaxIntFactor(arreglo);

        canvas.height = this.parent.imagenOriginal.height;
        canvas.width = this.parent.imagenOriginal.width;

        var widthFactor = arreglo.length / canvas.width;
        var heightFactor = arreglo[0].length / canvas.height;

        var threshold = document.querySelector('#threshold-select').value;
        var resultImageData = context.createImageData(canvas.width, canvas.height);
        for (var y = 0, i = 0; y < canvas.height; y++) {
            for (var x = 0; x < canvas.width; x++, i += 4) {
                var xIndex = Math.floor(x * widthFactor);
                var yIndex = Math.floor(y * heightFactor);

                var currentValue = Math.floor(arreglo[xIndex][yIndex] * factorMaxAccumulatedToImage);

                resultImageData.data[i] = resultImageData.data[i + 1] = resultImageData.data[i + 2] = currentValue;
                resultImageData.data[i + 3] = 255;
            }
        }
        return resultImageData;


    },
    recalculateThreshold: function () {
        this.arregloHoughFiltrado = [];
        this.generateFilteredHoughImage();
        this.generateResultImage(this.arregloHoughFiltrado);
    },
    generateControls: function () {
        var container = document.querySelector("#hough-input");
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
        this.selectedThreshold = 80;
        this.parent.createSlider(container, "Umbral", "threshold-select", 1, 2, 256, 180);


        document.querySelector('#threshold-select').onchange = this.recalculateThreshold.bind(this);
    },
    
    drawLine: function (context, radius, radiant, centerX, centerY) {

        var y1, y2, x1, x2;

        if (radiant > Math.PI / 4 && radiant < Math.PI * 2 / 3) {
            x1 = -centerX;
            y1 = (radius - x1 * Math.cos(radiant)) / Math.sin(radiant);

            x2 = centerX;
            y2 = (radius - x2 * Math.cos(radiant)) / Math.sin(radiant);
        } else {
            y1 = -centerY;
            x1 = (radius - y1 * Math.sin(radiant)) / Math.cos(radiant);

            y2 = centerY;
            x2 = (radius - y2 * Math.sin(radiant)) / Math.cos(radiant);
        }

        context.strokeStyle = "#FF0000";
        context.beginPath();
        context.moveTo(centerX + x1, centerY + y1 - 1);
        context.lineTo(centerX + x2, centerY + y2 - 1);
        context.stroke();

    },
    calcularMaxIntFactor: function (arreglo) {
        var maxAccumulated = Number.MIN_VALUE;
        var minAccumulated = Number.MAX_VALUE;

        for (var i = 0; i < arreglo.length; i++) {
            for (var j = 0; j < arreglo[0].length; j++) {
                if (arreglo[i][j] < minAccumulated && arreglo[i][j] != 0) {
                    minAccumulated = arreglo[i][j];
                }
                if (arreglo[i][j] > maxAccumulated && arreglo[i][j] != 0) {
                    maxAccumulated = arreglo[i][j];
                }
            }
        }
        return 255 / maxAccumulated;
    }
}




Hough.fn.init.prototype = Hough.prototype;
lineaHough.fn.init.prototype = lineaHough.prototype;
