const lienzo = document.getElementById('tablero-juego');
const ctx = lienzo.getContext('2d');
const lienzoPrevia = document.getElementById('vista-previa');
const ctxPrevia = lienzoPrevia.getContext('2d');
const COLUMNAS = 10;
const FILAS = 20;
const TAMANO_BLOQUE = 20;
ctx.scale(TAMANO_BLOQUE, TAMANO_BLOQUE);
ctxPrevia.scale(18, 18);

document.getElementById('boton_inicio').addEventListener('click', () => {
    const opciones = document.querySelector('.inicio');
    const contenedorPrincipal = document.querySelector('.contenedor-principal');

        opciones.style.display = 'none';
        contenedorPrincipal.style.display = 'block';

    reiniciarJuego();
});
let audioMover = document.getElementById('audioMover');
let audioCaer = document.getElementById('audioCaer');
let audioRotar = document.getElementById('audioRotar');

function reproducirAudio(audio) {
    
    if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
    };
    audio.play();
};



let juegoTerminado = false;

document.getElementById('reiniciar-juego').addEventListener('click', () => {
    document.getElementById('game-over-container').style.display = 'none';
    reiniciarJuego();
});
window.addEventListener('load', () => {
    document.getElementById('game-over-container').style.display = 'none';
});

document.getElementById('reiniciar').addEventListener('click', reiniciarJuego);

function mostrarGameOver() {
    document.getElementById('game-over-container').style.display = 'flex';
    juegoTerminado = true;
    clearInterval(temporizadorCaida);
};

const PIEZAS = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];

let tablero, fichaActual, siguienteFicha, posXActual, posYActual, lineasEliminadas, puntaje, nivel;
const contadorLineas = document.getElementById('contador-lineas');
const puntajeDisplay = document.getElementById('puntaje');
const nivelDisplay = document.getElementById('nivel');

const VELOCIDAD_CAIDA = {
    0: 1000 / 1,
    1: 1000 / 2,
    2: 1000 / 3,
    3: 1000 / 4,
    4: 1000 / 5,
    5: 1000 / 6,
    6: 1000 / 7,
    7: 1000 / 8,
    8: 1000 / 9,
    9: 1000 / 10,
    10: 1000 / 13,
    13: 1000 / 16,
    16: 1000 / 19,
    19: 1000 / 22,
    29: 1000 / 38
};

let velocidadCaida = VELOCIDAD_CAIDA[0];
let temporizadorCaida;

function obtenerFichaAleatoria() {
    const indice = Math.floor(Math.random() * PIEZAS.length);
    return PIEZAS[indice];
};

function reiniciarJuego() {
    tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));
    fichaActual = obtenerFichaAleatoria();
    siguienteFicha = obtenerFichaAleatoria();
    posXActual = 4;
    posYActual = 0;
    lineasEliminadas = 0;
    puntaje = 0;
    nivel = 0;
    contadorLineas.textContent = "LINEAS: " + lineasEliminadas;
    puntajeDisplay.textContent = "PUNTAJE: " + puntaje;
    nivelDisplay.textContent = "NIVEL: " + nivel;
    actualizarVelocidad();
    dibujar();
};

function dibujarTablero() {
    ctx.clearRect(0, 0, COLUMNAS, FILAS);
    tablero.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            ctx.fillStyle = valor ? '#645c84' : '#ecf0f1';
            ctx.fillRect(x, y, 1, 1);
            ctx.strokeStyle = '#dcdcdc';
            ctx.lineWidth = 0.05;
            ctx.strokeRect(x, y, 1, 1);
        });
    });
};

function dibujarFicha() {
    fichaActual.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                ctx.fillStyle = 'red';
                ctx.fillRect(x + posXActual, y + posYActual, 1, 1);
                ctx.strokeRect(x + posXActual, y + posYActual, 1, 1);
            };
        });
    });
};

function dibujarPrevia() {
    ctxPrevia.clearRect(0, 0, 4, 4);
    const anchoFicha = siguienteFicha[0].length;
    const offsetX = Math.floor((4 - anchoFicha) / 2);

    siguienteFicha.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                ctxPrevia.fillStyle = 'red';
                ctxPrevia.fillRect(x + offsetX, y, 1, 1);
                ctxPrevia.strokeStyle = 'black';
                ctxPrevia.lineWidth = 0.05;
                ctxPrevia.strokeRect(x + offsetX, y, 1, 1);
            };
        });
    });
};

function bajarFicha() {
    posYActual++;
    if (hayColision()) {
        posYActual--;
        reproducirAudio(audioCaer);
        fusionarFicha();
        calcularPuntajeYEliminarLineas();
        fichaActual = siguienteFicha;
        siguienteFicha = obtenerFichaAleatoria();
        posXActual = 4;
        posYActual = 0;

        if (hayColision()) {
            setTimeout(() => {
                mostrarGameOver();

            }, 0);
        };
    };
    dibujar();
};

function hayColision() {
    for (let y = 0; y < fichaActual.length; y++) {
        for (let x = 0; x < fichaActual[y].length; x++) {
            if (fichaActual[y][x]) {
                const tableroY = y + posYActual;
                const tableroX = x + posXActual;
                if (tablero[tableroY]?.[tableroX] === undefined || tablero[tableroY][tableroX]) {
                    return true;
                };
            };
        };
    };
    return false;
};

function fusionarFicha() {
    fichaActual.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                tablero[y + posYActual][x + posXActual] = valor;
            };
        });
    });
};

function calcularPuntajeYEliminarLineas() {
    let lineasEliminadasSimultaneas = 0;
    for (let y = 0; y < FILAS; y++) {
        if (tablero[y].every(celda => celda !== 0)) {
            tablero.splice(y, 1);
            tablero.unshift(new Array(COLUMNAS).fill(0));
            lineasEliminadasSimultaneas++;
        };
    };
    if (lineasEliminadasSimultaneas > 0) {
        const puntosPorLinea = [0, 100, 200, 400, 800];
        puntaje += puntosPorLinea[lineasEliminadasSimultaneas];
        lineasEliminadas += lineasEliminadasSimultaneas;
        contadorLineas.textContent = "LINEAS: " + lineasEliminadas;
        puntajeDisplay.textContent = "PUNTAJE: " + puntaje;

        if (Math.floor(lineasEliminadas / 10) > nivel) {
            nivel++;
            nivelDisplay.textContent = "NIVEL: " + nivel;
            actualizarVelocidad();
        };
    };
};

function actualizarVelocidad() {
    for (let nivelMax in VELOCIDAD_CAIDA) {
        if (nivel >= nivelMax) {
            velocidadCaida = VELOCIDAD_CAIDA[nivelMax];
        };
    };
    reiniciarTemporizador();
};

function reiniciarTemporizador() {
    clearInterval(temporizadorCaida);
    temporizadorCaida = setInterval(bajarFicha, velocidadCaida);
};

document.getElementById('izquierda').addEventListener('click', () => {
    posXActual--;
    if (hayColision()) posXActual++;
    dibujar();
});

document.getElementById('derecha').addEventListener('click', () => {
    posXActual++;
    if (hayColision()) posXActual--;
    dibujar();
});

document.getElementById('bajar').addEventListener('click', () => {
    bajarFicha();
});

document.getElementById('rotar').addEventListener('click', () => {
    fichaActual = rotarFicha(fichaActual);
    if (hayColision()) fichaActual = rotarFicha(fichaActual, true);
    dibujar();
});

function rotarFicha(ficha, revertir = false) {
    const nuevaFicha = ficha[0].map((_, i) => ficha.map(row => row[i]));
    return revertir ? nuevaFicha.reverse() : nuevaFicha.map(row => row.reverse());
};

document.addEventListener('keydown', (evento) => {
    if (juegoTerminado) return; 
    switch (evento.key) {
        case 'ArrowLeft':
            posXActual--;
            reproducirAudio(audioMover);
            if (hayColision()) posXActual++;
            dibujar();
            break;
        case 'ArrowRight':
            posXActual++;
            reproducirAudio(audioMover);
            if (hayColision()) posXActual--;
            dibujar();
            break;
        case 'ArrowUp':
            fichaActual = rotarFicha(fichaActual);
            reproducirAudio(audioRotar); 
            if (hayColision()) fichaActual = rotarFicha(fichaActual, true);
            dibujar();
            break;
        case 'ArrowDown':
            reproducirAudio(audioMover);
            bajarFicha();
            break;
    };
});

function rotarFicha(ficha, revertir = false) {
    const nuevaFicha = ficha[0].map((_, i) => ficha.map(row => row[i]));
    return revertir ? nuevaFicha.reverse() : nuevaFicha.map(row => row.reverse());
};

function dibujar() {
    dibujarTablero();
    dibujarFicha();
    dibujarPrevia();
};

function manejarCambioDeVisibilidad() {
    if (document.hidden) {
        juegoPausado = true;
        clearInterval(temporizadorCaida);
    } else {
        juegoPausado = false;
        reiniciarTemporizador();
    };
};

document.addEventListener('visibilitychange', manejarCambioDeVisibilidad);

reiniciarJuego();
