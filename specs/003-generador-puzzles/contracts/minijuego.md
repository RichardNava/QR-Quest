# Contrato: formas de datos del minijuego

Tres formas por tipo: lo **guardado** (solo servidor y master), la **vista pública** (lo que recibe el navegador) y la **respuesta** (lo que envía el jugador para que el servidor verifique). Los tipos TypeScript viven en `lib/minijuegos/tipos.ts`.

## Guardado (`puzzles.minijuego`)

```ts
type Nivel = "facil" | "medio" | "dificil";
type TipoMinijuego = "rushhour" | "lightsout" | "mastermind" | "sudoku" | "laberinto";
type Minijuego = { tipo: TipoMinijuego; nivel: Nivel; semilla: number };
```

## Vista pública y respuesta por tipo

La vista pública **nunca** incluye `semilla`, solución ni código secreto.

### rushhour

```ts
vista:     { tamano: 6; salida: { fila: number }; piezas: { id: number; fila: number; col: number; largo: 2 | 3; horizontal: boolean; objetivo: boolean }[] }
respuesta: { movimientos: { id: number; casillas: number }[] }   // casillas con signo: + derecha/abajo, − izquierda/arriba
```
Verificación: cada movimiento desliza una pieza por casillas libres sin saltar otras; al final la pieza `objetivo` toca el borde de la salida.

### lightsout

```ts
vista:     { tamano: 3 | 4 | 5; encendidas: boolean[][] }
respuesta: { pulsadas: { fila: number; col: number }[] }
```
Verificación: aplicar cada pulsación (casilla + vecinas ortogonales) deja todo apagado.

### mastermind

```ts
vista:     { longitud: 4 | 5; simbolos: number; intentos: number; repetidos: boolean }
intento:   { codigo: number[] }                       // valores 0..simbolos-1
pistas:    { enSuSitio: number; enOtroSitio: number }
```
No hay `respuesta` final: cada intento se comprueba con `probarCodigo` (ver [acciones.md](acciones.md)); el código secreto solo existe en el servidor.

### sudoku

```ts
vista:     { casillas: (number | null)[][] }           // 9×9; null = hueco; números 1..9
respuesta: { casillas: number[][] }                    // 9×9 completo
```
Verificación: igual a la solución única derivada de la semilla.

### laberinto

```ts
vista:     { ancho: number; alto: number; paredes: { derecha: boolean[][]; abajo: boolean[][] }; inicio: { fila: 0; col: 0 }; meta: { fila: number; col: number } }
respuesta: { movimientos: ("N" | "S" | "E" | "O")[] }
```
Verificación: partiendo de `inicio`, ningún movimiento cruza una pared ni sale del tablero y el último deja la ficha en `meta`.

## Límites de entrada (el servidor rechaza lo que los supere)

| Dato | Máximo |
|---|---|
| Movimientos de Rush Hour | 500 |
| Pulsaciones de Lights Out | 100 |
| Movimientos de Laberinto | 3 000 |
| Intento de Mastermind | `longitud` valores en `0..simbolos-1` |
| Cuadrícula de Sudoku | exactamente 9×9 con valores 1..9 |
