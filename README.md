#  Movie Ticket Booking System — Frontend

Aplicación web para la compra de entradas de cine: cartelera pública, selección de butacas, flujo de pago y un panel de administración con control de acceso por roles. Construida con **Next.js 16 (App Router)** y **React 19**.

> **Backend / API:** este frontend consume la API del proyecto
> [MovieTicketBookingSystem-API](https://github.com/miguepity/MovieTicketBookingSystem-API).

---

##  Características

- **Cartelera pública** — películas, funciones, cines y ciudades.
- **Reserva de butacas** — mapa de asientos interactivo con temporizador de reserva (control de concurrencia).
- **Checkout y pagos** — flujo de compra con resumen, cupones de descuento y página de resultado de pago.
- **Cuenta de usuario** — registro, login, recuperación de contraseña, perfil, historial de reservas y solicitud de reembolsos.
- **Panel de administración** — gestión de películas, funciones, salas, cines, ciudades, géneros, idiomas, usuarios, roles, cupones, políticas, reservas, pagos, reembolsos y reportes.
- **Control de acceso por roles** — `ADMIN`, `RECEPCIONISTA` y usuario estándar, aplicado vía middleware de Next.js.

##  Stack tecnológico

| Categoría        | Tecnología                          |
| ---------------- | ----------------------------------- |
| Framework        | Next.js 16 (App Router)             |
| UI               | React 19, Tailwind CSS 4            |
| Cliente HTTP     | Axios                               |
| Iconos           | lucide-react                        |
| Notificaciones   | sonner, react-toastify              |
| Fechas           | date-fns                            |
| Lenguaje         | TypeScript                          |

##  Puesta en marcha

### Requisitos previos

- Node.js 18.18+ (recomendado 20+)
- Una instancia del [backend / API](https://github.com/miguepity/MovieTicketBookingSystem-API) en ejecución
- pnpm (recomendado), o npm / yarn / bun

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd movie-ticket-booking-system-frontend

# Instalar dependencias
pnpm install
```

### Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL base de la API del backend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> Si no se define, el cliente Axios usa `http://localhost:4000` por defecto (ver `src/lib/axios.ts`).

### Ejecución en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.


## 📁 Estructura del proyecto

```
src/
├── app/                  # Rutas (App Router), agrupadas por contexto
│   ├── (auth)/           # Login, registro, recuperación de contraseña
│   ├── (public)/         # Cartelera, películas, funciones, cines, perfil, reservas
│   ├── (checkout)/       # Checkout, pago y resultado de pago
│   └── (dashboard)/      # Panel de administración (/admin)
├── components/           # Componentes reutilizables (layout, seats, booking, tables, ui)
├── contexts/             # AuthContext (estado de sesión)
├── services/             # Llamadas a la API por dominio (movies, reservations, payments...)
├── lib/                  # Cliente Axios, auth y utilidades
├── types/                # Definiciones de tipos TypeScript
└── middleware.ts         # Protección de rutas y control de acceso por roles
```

##  Autenticación y roles

La sesión se almacena en `localStorage` (`movie_auth_session`) y el token se inyecta automáticamente en cada petición mediante un interceptor de Axios. El `middleware.ts` protege las rutas según el rol:

- **ADMIN** — acceso completo al panel de administración.
- **RECEPCIONISTA** — acceso restringido a reservas, pagos, reportes y usuarios.
- **Usuario estándar** — perfil, reservas y checkout.

##  Proyecto relacionado

- **Backend / API:** [MovieTicketBookingSystem-API](https://github.com/miguepity/MovieTicketBookingSystem-API)
