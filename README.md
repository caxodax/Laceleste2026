# 🍔 La Celeste - Sistema Web para Restaurante (V4 - Performance & Intelligence)

Sistema web premium de **alto rendimiento** para **La Celeste**, restaurante de hamburguesas artesanales en Barquisimeto, Venezuela. Esta versión se enfoca en la inteligencia de negocio, una experiencia de usuario ultra-fluida y visibilidad máxima en buscadores.

![La Celeste](https://img.shields.io/badge/La%20Celeste-Hamburguesas-0ea5e9?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=for-the-badge&logo=supabase)

## 🆕 Novedades Recientes (V4)

- 📊 **Panel de Estadísticas Avanzado:** Inteligencia de negocio real en el Admin con gráficos de tendencia de ventas, ranking de productos y distribución de métodos de pago.
- 🍔 **Vista Detallada de Producto:** Nuevo modal premium con imágenes de alta resolución, descripciones detalladas y selector de cantidad dinámico.
- ⚡ **Ultra-Fast Performance:** Optimización agresiva con `next/image`, Skeleton Screens y transiciones reducidas a 150ms para una sensación de respuesta instantánea.
- 🔍 **SEO & Social Brillante:** Metadatos dinámicos, autogeneración de Sitemap.xml y Robots.txt, junto con una imagen de previsualización (OG Image) de alta fidelidad.

## ✨ Características Principales

### 🌟 Experiencia de Usuario (UX)
- 🖼️ **Optimización de Medios:** Imágenes servidas en WebP/AVIF con lazy loading automático mediante `next/image`.
- 🦴 **Carga Elegante:** Implementación de Skeletons para eliminar el salto visual durante la carga de datos.
- 🖱️ **Interactividad Premium:** Modales Split-Screen y navegación por categorías con scroll-spy.

### 💰 Inteligencia Administrativa
- 💹 **Dashboard Analítico:** Visualización de métricas clave (Ticket promedio, crecimiento vs ayer, tendencias semanales).
- 🇻🇪 **Tasa Cambiaria Inteligente:** Sincronización automática con el BCV y posibilidad de ajuste manual instantáneo.
- 🧾 **Gestión de Notas de Entrega:** Control total del flujo de caja e inventario con formatos listos para imprimir.

### 🔍 Presencia Digital
- 📱 **Social Cards:** Previsualización profesional en WhatsApp, Instagram y Twitter.
- 🗺️ **SEO Estructurado:** Títulos dinámicos por sección y mapa del sitio optimizado para Google.
- 📍 **Ubicación Integrada:** Mapa interactivo de Google Maps para fácil localización.

## 🚀 Tecnologías

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Base de Datos & Auth:** Supabase (PostgreSQL)
- **Visualización de Datos:** Custom SVG Charts con Framer Motion
- **Animaciones:** Framer Motion (Transiciones ultra-rápidas)
- **Estado Global:** Zustand con persistencia
- **Estilos:** Tailwind CSS con tokens de marca premium

## 📦 Instalación y Despliegue

1. **Clonar repositorio:**
   ```bash
   git clone <repo-url>
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Variables de Entorno:**
   Configura tu `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Base de Datos:**
   Aplica el `schema.sql` en el SQL Editor de Supabase para tener la estructura y datos iniciales.
5. **Ejecutar:**
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
la-celeste-web/
├── src/
│   ├── app/                    # App Router (Home, Menu, Admin, Admin/Stats)
│   ├── components/            
│   │   ├── admin/             # Componentes de gráficas y gestión
│   │   ├── menu/              # Modales de detalle y filtros
│   │   ├── layout/            # Navbar, Footer, AppInit
│   │   └── ui/                # Base System (Cards, Modals, Buttons)
│   ├── lib/                   # Servicios (Orders, DeliveryNotes, Utils)
│   ├── store/                 # Zustand Stores (Cart, Settings)
│   └── types/                 # TypeScript interfaces
├── public/                    # Logos y Social OG-Images
└── schema.sql                 # Estructura de DB Supabase
```

## 🎨 Identidad de Marca

- **Celeste:** `#0ea5e9` - El corazón de la marca.
- **Gold:** `#eab308` - Calidad y premium feel.
- **Cream:** `#fdf8f0` - Elegancia y confort visual.

---
Desarrollado para **La Celeste** 🍔 | Barquisimeto, Venezuela
