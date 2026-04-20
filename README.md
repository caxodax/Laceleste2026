# 🍔 La Celeste - Sistema Web para Restaurante

Sistema web completo para **La Celeste**, restaurante de hamburguesas artesanales en Barquisimeto, Venezuela.

![La Celeste](https://img.shields.io/badge/La%20Celeste-Hamburguesas-0ea5e9?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase)

## ✨ Características

### Para Clientes
- 🍔 **Menú interactivo** con categorías y productos
- 🛒 **Carrito de compras** persistente
- 📱 **Pedidos por WhatsApp** integrado
- 💳 **Múltiples métodos de pago** (Zelle, Binance, Pago Móvil, Efectivo)
- 📍 **Información de contacto** y horarios
- 🎨 **Diseño responsive** y moderno

### Para Administradores
- 📊 **Dashboard** con estadísticas en tiempo real
- 📦 **Gestión de pedidos** con estados
- 🧾 **Sistema de facturación** completo
- 🍕 **Gestión de productos** y categorías
- 👤 **Autenticación** segura con Firebase
- ⚙️ **Configuración** del restaurante

## 🚀 Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Estado:** Zustand
- **Backend:** Firebase (Auth, Firestore, Hosting)
- **Formularios:** React Hook Form
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase (opcional para desarrollo local)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd la-celeste-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

4. **Iniciar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔥 Configuración de Firebase

### 1. Crear proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Authentication** (Email/Password)
4. Habilita **Firestore Database**
5. Habilita **Hosting**

### 2. Configurar Firestore
Las reglas de seguridad están en `firestore.rules`. Despliégalas con:
```bash
firebase deploy --only firestore:rules
```

### 3. Crear usuario administrador
En Firebase Console > Authentication:
1. Agrega un usuario con email y contraseña
2. En Firestore, crea un documento en `users/{userId}`:
```json
{
  "email": "admin@laceleste.com",
  "displayName": "Administrador",
  "role": "admin",
  "createdAt": "timestamp"
}
```

### 4. Poblar datos iniciales
Los productos y categorías están en `src/data/menu.ts`. Puedes:
- Usarlos directamente (modo estático)
- Migrarlos a Firestore usando los servicios en `src/lib/services/`

## 🌐 Despliegue

### Firebase Hosting

1. **Instalar Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Iniciar sesión**
```bash
firebase login
```

3. **Inicializar proyecto**
```bash
firebase init
```
Selecciona: Hosting, Firestore

4. **Construir y desplegar**
```bash
npm run build
firebase deploy
```

O usa el script combinado:
```bash
npm run firebase:deploy
```

### Vercel (Alternativa)
```bash
npx vercel
```

## 📁 Estructura del Proyecto

```
la-celeste-web/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── page.tsx           # Inicio
│   │   ├── menu/              # Menú
│   │   ├── pedido/            # Checkout
│   │   ├── carrito/           # Carrito
│   │   ├── contacto/          # Contacto
│   │   ├── login/             # Login admin
│   │   └── admin/             # Panel admin
│   │       ├── page.tsx       # Dashboard
│   │       ├── pedidos/       # Gestión pedidos
│   │       ├── facturas/      # Facturación
│   │       └── productos/     # Gestión productos
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   ├── layout/            # Header, Footer, etc.
│   │   ├── menu/              # Componentes del menú
│   │   └── cart/              # Componentes del carrito
│   ├── lib/
│   │   ├── firebase.ts        # Configuración Firebase
│   │   ├── utils.ts           # Utilidades
│   │   └── services/          # Servicios Firestore
│   ├── store/
│   │   ├── authStore.ts       # Estado autenticación
│   │   └── cartStore.ts       # Estado carrito
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   └── data/
│       └── menu.ts            # Datos del menú
├── public/                     # Assets estáticos
├── firebase.json              # Config Firebase
├── firestore.rules            # Reglas Firestore
└── tailwind.config.ts         # Config Tailwind
```

## 🎨 Personalización

### Colores
Los colores de La Celeste están en `tailwind.config.ts`:
- **Celeste:** Azul principal (#0ea5e9)
- **Gold:** Dorado para acentos (#eab308)
- **Cream:** Fondo crema (#fdf8f0)

### Logo y Branding
- Actualiza el logo en `src/components/ui/Logo.tsx`
- Cambia las fuentes en `src/app/globals.css`

### Datos del Restaurante
Edita `src/data/menu.ts`:
- `restaurantSettings`: Información del restaurante
- `products`: Productos del menú
- `categories`: Categorías
- `paymentMethods`: Métodos de pago

## 📱 Métodos de Pago Configurados

| Método | Detalles |
|--------|----------|
| 💳 Zelle | BofA 2244418858 |
| 🪙 Binance | Antoniocarpentierilecce@gmail.com |
| 📱 Pago Móvil | Cédula: 24.159.676, Tel: 0412 122 7176, Banco: Banesco |
| 💵 Efectivo | Pago al momento de entrega |

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso completo al panel |
| `staff` | Gestión de pedidos |
| `customer` | Solo cliente |

## 📞 Contacto

- **Instagram:** [@lacelestebqto](https://instagram.com/lacelestebqto)
- **WhatsApp:** 0424-5645357
- **Horario:** Martes a Domingo, 5PM - 12AM

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para La Celeste.

---

Desarrollado con ❤️ para La Celeste 🍔
