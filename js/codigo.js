const lienzo = document.getElementById('tablero-juego');
const ctx = lienzo.getContext('2d');
const lienzoPrevia = document.getElementById('vista-previa');
const ctxPrevia = lienzoPrevia.getContext('2d');
const COLUMNAS = 10;
const FILAS = 20;
const TAMANO_BLOQUE = 20;
ctx.scale(TAMANO_BLOQUE, TAMANO_BLOQUE);
ctxPrevia.scale(18, 18);

document.getElementById('reiniciar').addEventListener('click', reiniciarJuego);

function reiniciarJuego() {
    tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));
    fichaActual = obtenerFichaAleatoria();
    siguienteFicha = obtenerFichaAleatoria();
    posXActual = 4;
    posYActual = 0;
    lineasEliminadas = 0;
    puntaje = 0;
    nivel = 0;
    contadorLineas.textContent = `LINEAS: ${lineasEliminadas}`;
    puntajeDisplay.textContent = `PUNTAJE: ${puntaje}`;
    nivelDisplay.textContent = `NIVEL: ${nivel}`;
    actualizarVelocidad();
    dibujar();
}



const PIEZAS = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
];

let tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));
let fichaActual = obtenerFichaAleatoria();
let siguienteFicha = obtenerFichaAleatoria();
let posXActual = 4;
let posYActual = 0;
let lineasEliminadas = 0;
let puntaje = 0;
let nivel = 0;

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
}

function dibujarTablero() {
    ctx.clearRect(0, 0, COLUMNAS, FILAS);
    tablero.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            ctx.fillStyle = valor ? 'red' : '#ecf0f1';
            ctx.fillRect(x, y, 1, 1);

            // Borde negro
            ctx.strokeStyle = '#dcdcdc';
            ctx.lineWidth = 0.05;
            ctx.strokeRect(x, y, 1, 1);
        });
    });
}

function dibujarFicha() {
    fichaActual.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                ctx.fillStyle = 'red';
                ctx.fillRect(x + posXActual, y + posYActual, 1, 1);
                ctx.strokeRect(x + posXActual, y + posYActual, 1, 1);
            }
        });
    });
}

function dibujarPrevia() {
    ctxPrevia.clearRect(0, 0, 4, 4);

    const anchoFicha = siguienteFicha[0].length;
    const offsetX = Math.floor((4 - anchoFicha) / 2);

    siguienteFicha.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                ctxPrevia.fillStyle = 'red';
                ctxPrevia.fillRect(x + offsetX, y, 1, 1);

                // Borde negro
                ctxPrevia.strokeStyle = 'black';
                ctxPrevia.lineWidth = 0.05;
                ctxPrevia.strokeRect(x + offsetX, y, 1, 1);
            }
        });
    });
}

function bajarFicha() {
    posYActual++;
    if (hayColision()) {
        posYActual--;
        fusionarFicha();
        calcularPuntajeYEliminarLineas();
        fichaActual = siguienteFicha;
        siguienteFicha = obtenerFichaAleatoria();
        posXActual = 4;
        posYActual = 0;
        if (hayColision()) {
            alert('Juego terminado');
            tablero = Array.from({ length: FILAS }, () => Array(COLUMNAS).fill(0));
            lineasEliminadas = 0;
            puntaje = 0;
            nivel = 0;
        }
    }
    dibujar();
}

function hayColision() {
    return fichaActual.some((fila, y) =>
        fila.some((valor, x) =>
            valor &&
            (tablero[y + posYActual]?.[x + posXActual] === undefined ||
                tablero[y + posYActual][x + posXActual])
        )
    );
}

function fusionarFicha() {
    fichaActual.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                tablero[y + posYActual][x + posXActual] = valor;
            }
        });
    });
}

function calcularPuntajeYEliminarLineas() {
    let lineasEliminadasSimultaneas = 0;

    for (let y = 0; y < FILAS; y++) {
        if (tablero[y].every(celda => celda !== 0)) {
            tablero.splice(y, 1);
            tablero.unshift(new Array(COLUMNAS).fill(0));
            lineasEliminadasSimultaneas++;
        }
    }

    if (lineasEliminadasSimultaneas > 0) {
        const puntosPorLinea = [0, 100, 200, 400, 800];
        puntaje += puntosPorLinea[lineasEliminadasSimultaneas];
        lineasEliminadas += lineasEliminadasSimultaneas;
        contadorLineas.textContent = `LINEAS: ${lineasEliminadas}`;
        puntajeDisplay.textContent = `PUNTAJE: ${puntaje}`;

        if (Math.floor(lineasEliminadas / 10) > nivel) {
            nivel++;
            nivelDisplay.textContent = `NIVEL: ${nivel}`;
            actualizarVelocidad();
        }
    }
}

function actualizarVelocidad() {
    for (let nivelMax in VELOCIDAD_CAIDA) {
        if (nivel >= nivelMax) {
            velocidadCaida = VELOCIDAD_CAIDA[nivelMax];
        }
    }
    reiniciarTemporizador();
}

function reiniciarTemporizador() {
    clearInterval(temporizadorCaida);
    temporizadorCaida = setInterval(bajarFicha, velocidadCaida);
}
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
}
// Control del teclado
document.addEventListener('keydown', (evento) => {
    switch (evento.key) {
        case 'ArrowLeft':
            posXActual--;
            if (hayColision()) posXActual++;
            dibujar();
            break;

        case 'ArrowRight':
            posXActual++;
            if (hayColision()) posXActual--;
            dibujar();
            break;

        case 'ArrowUp':
            fichaActual = rotarFicha(fichaActual);
            if (hayColision()) fichaActual = rotarFicha(fichaActual, true);
            dibujar();
            break;

        case 'ArrowDown':
            bajarFicha();
            break;
    }
});

function rotarFicha(ficha, revertir = false) {
    const nuevaFicha = ficha[0].map((_, i) => ficha.map(row => row[i]));
    return revertir ? nuevaFicha.reverse() : nuevaFicha.map(row => row.reverse());
}

function dibujar() {
    dibujarTablero();
    dibujarFicha();
    dibujarPrevia();
}
function manejarCambioDeVisibilidad() {
    if (document.hidden) {
        juegoPausado = true;
        clearInterval(temporizadorCaida);
    } else {
        juegoPausado = false;
        reiniciarTemporizador();
    }
}

document.addEventListener('visibilitychange', manejarCambioDeVisibilidad);


actualizarVelocidad();
dibujar();
