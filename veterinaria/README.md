# Veterinaria

Aplicacion web Angular para digitalizar el flujo de atencion de una clinica veterinaria.

## Contexto y problema

La clinica tenia un proceso manual y lento:

- Citas por llamada sin control de horarios.
- Sin calendario digital de disponibilidad.
- Sin historial centralizado por mascota.

Esto causaba quejas, retrasos y perdida de citas.

## Solucion implementada

La app resuelve el problema con 3 flujos principales:

- Registro de mascotas y duenos.
- Agenda de citas con disponibilidad por fecha.
- Historial de atencion por mascota.

## Flujos de usuario

1. Login del personal.
2. Registro de mascota y datos del dueno.
3. Agendamiento de cita seleccionando fecha y hora disponible.
4. Actualizacion del estado de cita (confirmar, completar, cancelar).
5. Consulta del historial por mascota con resumen de atencion.

No usa base de datos ni backend: toda la persistencia se realiza en `localStorage`.

## Arquitectura del proyecto

Se uso Angular + TypeScript con modulos por funcionalidad:

- `auth`: login del personal.
- `mascotas`: formulario y listado de mascotas.
- `citas`: agenda y estado de citas.
- `historial`: consultas de atencion por mascota.
- `shared`: utilidades reutilizables (pipe, directiva, formularios/reactive forms).
- `core`: modelos, servicios, guardas y logica de negocio.

Pantallas principales implementadas:

- Login del personal.
- Registro y listado de mascotas.
- Agenda/calendario de citas.
- Historial clinico por mascota.

## Elementos Angular y TypeScript aplicados

- `ReactiveForms` con validaciones tipadas.
- Interfaces y servicios fuertemente tipados.
- Clase `AgendaScheduler` para reglas de agenda (POO basica).
- Pipe personalizado: `estadoCita`.
- Directiva personalizada: `appResaltarProximaCita`.
- Guards de rutas para control de sesion.

## Credenciales demo

- Usuario: `admin`
- Contrasena: `vet2026`

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm start
```

Abre `http://localhost:4200/`.

## Build

```bash
npm run build
```

El resultado se genera en `dist/`.

## Pruebas

```bash
npm test
```

## Nota de almacenamiento local

La informacion se guarda en el navegador con las claves:

- `veterinaria_session`
- `veterinaria_mascotas`
- `veterinaria_citas`
