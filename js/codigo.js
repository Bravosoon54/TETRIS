const lienzo = document.getElementById('tablero-juego');
const contexto = lienzo.getContext('2d');
const lienzoPrevia = document.getElementById('vista-previa');
const contextoPrevia = lienzoPrevia.getContext('2d');
const COLUMNAS = 10;
const FILAS = 20;
const TAMANO_BLOQUE = 20;
contexto.scale(TAMANO_BLOQUE, TAMANO_BLOQUE);
contextoPrevia.scale(18, 18);

document.getElementById('reiniciar').addEventListener('click', reiniciarJuego);
document.getElementById('boton-inicio').addEventListener('click', () => {
    document.getElementById('pantalla-inicio').style.display = 'none';
    document.querySelector('.contenedor-principal').style.display = 'block';
    reiniciarJuego();
  });

  const botonMenu = document.getElementById('boton-menu');
const pantallaInicio = document.getElementById('pantalla-inicio');
const contenedorPrincipal = document.querySelector('.contenedor-principal');

botonMenu.addEventListener('click', () => {
  contenedorPrincipal.style.display = 'none';
  pantallaInicio.style.display = 'flex';
});
  
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
}

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
}

function dibujarTablero() {
    contexto.clearRect(0, 0, COLUMNAS, FILAS);
    tablero.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            contexto.fillStyle = valor ? '#645c84' : '#ecf0f1';
            contexto.fillRect(x, y, 1, 1);
            contexto.strokeStyle = '#dcdcdc';
            contexto.lineWidth = 0.05;
            contexto.strokeRect(x, y, 1, 1);
        });
    });
}

function dibujarFicha() {
    fichaActual.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                contexto.fillStyle = 'red';
                contexto.fillRect(x + posXActual, y + posYActual, 1, 1);
                contexto.strokeRect(x + posXActual, y + posYActual, 1, 1);
            }
        });
    });
}

function dibujarPrevia() {
    contextoPrevia.clearRect(0, 0, 4, 4);
    const anchoFicha = siguienteFicha[0].length;
    const offsetX = Math.floor((4 - anchoFicha) / 2);

    siguienteFicha.forEach((fila, y) => {
        fila.forEach((valor, x) => {
            if (valor) {
                contextoPrevia.fillStyle = 'red';
                contextoPrevia.fillRect(x + offsetX, y, 1, 1);
                contextoPrevia.strokeStyle = 'black';
                contextoPrevia.lineWidth = 0.05;
                contextoPrevia.strokeRect(x + offsetX, y, 1, 1);
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
            setTimeout(() => {
                alert('Juego terminado');
                reiniciarJuego();
            }, 0);
        }
    }
    dibujar();
}

function hayColision() {
    for (let y = 0; y < fichaActual.length; y++) {
        for (let x = 0; x < fichaActual[y].length; x++) {
            if (fichaActual[y][x]) {
                const tableroY = y + posYActual;
                const tableroX = x + posXActual;
                if (tablero[tableroY]?.[tableroX] === undefined || tablero[tableroY][tableroX]) {
                    return true;
                }
            }
        }
    }
    return false;
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
        contadorLineas.textContent = "LINEAS: " + lineasEliminadas;
        puntajeDisplay.textContent = "PUNTAJE: " + puntaje;

        if (Math.floor(lineasEliminadas / 10) > nivel) {
            nivel++;
            nivelDisplay.textContent = "NIVEL: " + nivel;
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

        clearInterval(temporizadorCaida);
    } else {

        reiniciarTemporizador();
    }
}

document.addEventListener('visibilitychange', manejarCambioDeVisibilidad);

reiniciarJuego();