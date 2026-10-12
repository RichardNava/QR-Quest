<!--
Sync Impact Report
- Version change: (plantilla sin rellenar) → 1.0.0
- Principios añadidos: I. Simplicidad ante todo; II. Español de España; III. Cero alcance fantasma;
  IV. Verificable por una persona no técnica; V. Bien securizada; VI. Login solo para el usuario master
- Secciones añadidas: Qué es QR Quest
- Secciones eliminadas: SECTION_2 y SECTION_3 de la plantilla (innecesarias; se pidió brevedad)
- TODOs pendientes: ninguno
-->
# QR Quest Constitution

## Qué es QR Quest

Aplicación web para crear aventuras o búsquedas del tesoro con códigos QR. Cada aventura tiene una
rejilla imprimible donde se colocan códigos QR que enlazan a páginas de la propia web. Cada página
contiene un puzzle (texto/imágenes) que se resuelve con una contraseña o código; al acertar, se
muestra una imagen o descripción con la pista siguiente.

## Core Principles

### I. Simplicidad ante todo
Entre dos soluciones, se elige siempre la más simple. Esto es una versión 1: no se prepara
complejidad para el futuro.

### II. Español de España
Toda la interfaz, los mensajes y la documentación están en español de España.

### III. Cero alcance fantasma
NO se implementa nada que no esté escrito en la especificación. Si surge una idea nueva, se
propone; no se construye hasta que entre en la especificación.

### IV. Verificable por una persona no técnica
Cada criterio de éxito DEBE poder comprobarse usando la aplicación, sin leer código.

### V. Bien securizada
Las páginas de cada aventura SOLO son accesibles desde el enlace que genera su código QR. El
identificador de la página en la URL va cifrado (no es adivinable ni deducible), de modo que los
jugadores no puedan saltarse pasos ni acceder a otras páginas del juego.

### VI. Login solo para el usuario master
Solo quien crea la aventura (usuario master) necesita iniciar sesión. Los jugadores acceden sin
cuenta ni login.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Toda especificación, plan y
tarea DEBE cumplirla; cualquier excepción se justifica por escrito. Las modificaciones se
documentan y suben de versión: MAJOR si se elimina o redefine un principio, MINOR si se añade o
amplía uno, PATCH para aclaraciones de redacción.

**Version**: 1.0.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
