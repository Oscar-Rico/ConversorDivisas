# Conversor de divisas

Aplicación web sencilla y visual para convertir cantidades entre distintas monedas en tiempo real. Está desarrollada con HTML, CSS y JavaScript puro, y utiliza una API pública de tipos de cambio para mostrar cotizaciones actualizadas.

## Descripción

Este proyecto ofrece una interfaz moderna para:

- introducir una cantidad a convertir,
- seleccionar la moneda de origen,
- ver el resultado en múltiples divisas,
- consultar cotizaciones actualizadas al instante,
- alternar entre una vista de tarjetas y una tabla comparativa.

La aplicación se centra en una experiencia clara, accesible y rápida para usuarios que necesitan calcular cambios de moneda sin complejidades adicionales.

## Funcionalidades

- Conversión de cantidades con soporte para decimales con coma o punto.
- Selección de divisa base entre monedas principales y secundarias.
- Carga de cotizaciones desde una API de referencia.
- Actualización manual de tasas con botón de refresco.
- Vista en tarjetas y vista tabulada.
- Indicadores visuales de validación y estados de carga.
- Diseño responsive para escritorio, tablet y móvil.

## Stack tecnológico

- HTML5
- CSS3
- JavaScript ES6+
- API pública: Open Exchange Rates / ExchangeRate API
- CDN para banderas y tipografías

## Estructura del proyecto

```text
CONVERSOR_DIVISAS/
├── index.html
├── main.js
├── style.css
├── README.md
└── assets / (si se añaden en el futuro)
```

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Conexión a internet para cargar la API de cotizaciones
- Python 3 (opcional, para servir el proyecto localmente)

## Instalación y ejecución

### Opción 1: abrir directamente

1. Abre la carpeta `CONVERSOR_DIVISAS`.
2. Haz doble clic en `index.html`.
3. La aplicación se ejecutará en el navegador.

### Opción 2: ejecutar un servidor local

Desde la raíz del proyecto:

```bash
cd CONVERSOR_DIVISAS
python -m http.server 8000
```

Luego abre en el navegador:

```text
http://localhost:8000
```

## Cómo usar la app

1. Escribe la cantidad que deseas convertir.
2. Selecciona la divisa de origen.
3. Pulsa `Convertir`.
4. La app mostrará el valor equivalente en el resto de monedas disponibles.
5. Puedes cambiar la vista entre `Cajas` y `Tabla` para comparar resultados.
6. Usa `Actualizar` para recargar las cotizaciones.

## Nota sobre los tipos de cambio

Las cotizaciones mostradas son orientativas y pueden variar según el proveedor, el horario o la moneda. El proyecto está pensado como una herramienta visual y educativa, no como referencia financiera oficial.

## Mejoras futuras

- Añadir conversión entre dos divisas seleccionadas de forma más explícita.
- Guardar historial de conversiones recientes.
- Soportar más monedas y tasas personalizadas.
- Integrar un backend para gestionar caché y mayor estabilidad.

## Licencia

Este proyecto está desarrollado con fines educativos y puede reutilizarse libremente para aprendizaje o prototipos.
