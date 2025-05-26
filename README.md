# Wheels - App de Transporte Universitario

<img src="./assets/images/icon.png" alt="Logo Wheels" width="100" />

---

## Descripción

**Wheels** es una aplicación móvil diseñada para facilitar el transporte universitario, conectando estudiantes que necesitan viajar hacia o desde la universidad con conductores particulares que ofrecen viajes compartidos. La plataforma ofrece una experiencia segura, eficiente y económica, con funcionalidades de reserva, seguimiento en tiempo real y verificación de pasajeros mediante QR, optimizando el transporte dentro del campus y sus alrededores.

---

## Funcionalidades Principales

- **Registro y autenticación de usuarios y conductores** mediante Firebase Authentication.
- **Creación y reserva de viajes:**
  - Los conductores pueden crear viajes con detalles como hora de inicio, sector de salida y llegada, precio sugerido, y puntos de parada.
  - Los pasajeros pueden buscar y reservar viajes filtrando por sector, tipo (hacia o desde la universidad) y precio.
- **Verificación de pasajeros vía escaneo de código QR** al abordar el vehículo.
- **Notificaciones en tiempo real** para conductores y pasajeros sobre el estado del viaje, paradas y confirmaciones.
- **Seguimiento del viaje en tiempo real**, con actualización del progreso y paradas.
- **Gestión de paradas y puntos de encuentro** para viajes compartidos.
- **Sistema de puntuación para conductores**, fomentando confianza y calidad en el servicio.
- **Interfaz intuitiva y accesible** para diferentes roles (conductor y pasajero).
- **Modalidades de viaje con anticipación mínima** (al menos 2 horas antes de iniciar).
- **Soporte para reportes y PQRS** dentro de la app.
- **Filtro avanzado** para búsqueda de viajes según sector, fecha, precio y tipo.

---

## Tecnologías Utilizadas

- **React Native:** Framework principal para desarrollo de la app móvil, permitiendo soporte multiplataforma (Android/iOS).
- **Expo:** Plataforma para facilitar el desarrollo, construcción y despliegue de aplicaciones React Native.
- **TypeScript:** Uso de tipado estático para mayor robustez y calidad del código.
- **Firebase:**
  - **Firebase Authentication:** Gestión segura de usuarios y roles (pasajero, conductor).
  - **Cloud Firestore:** Base de datos en tiempo real para almacenar viajes, usuarios, puntos, reservas y estados.
  - **Firebase Cloud Messaging (FCM):** Envío de notificaciones push en tiempo real.
  - **Firebase Storage:** (opcional) para almacenamiento de fotos de perfil o documentos.
- **Expo Router:** Para manejar la navegación basada en rutas y roles de usuario.
- **React Native Paper:** Componentes UI modernos y accesibles.
- **Google Maps API / MapView:** Para mostrar mapas y rutas, geolocalización en tiempo real y visualización de viajes.
- **Gemini API:** Integración de chatbot para asistencia y comunicación directa dentro de la aplicación.

---

## Modelo de Negocio

- **Segmentos de clientes:**
  - Estudiantes universitarios que necesitan transporte eficiente y económico.
  - Conductores particulares interesados en ofrecer viajes compartidos y generar ingresos.
  - Instituciones educativas que pueden establecer alianzas para facilitar la movilidad estudiantil.
  
- **Propuesta de valor:**
  - Transporte seguro y confiable con verificación de pasajeros.
  - Plataforma intuitiva para gestionar viajes y reservas.
  - Seguimiento en tiempo real y notificaciones para mejorar la experiencia.
  - Servicio más económico y personalizado frente a alternativas tradicionales.
  
- **Fuentes de ingresos:**
  - Comisión por cada viaje reservado.
  - Servicios premium para conductores (prioridad en viajes, perfiles destacados).
  - Publicidad dirigida dentro de la app.
  
- **Canales:**
  - Aplicación móvil (Android e iOS).
  - Promoción dentro del campus universitario y redes sociales.
  
- **Relación con clientes:**
  - Atención automatizada vía app y soporte para reportes.
  - Actualizaciones continuas basadas en feedback.

---

## Estructura del Proyecto

- `/app`: Contiene las pantallas organizadas por roles y funcionalidades.
- `/components`: Componentes reutilizables de UI y lógica.
- `/context`: Contextos React para gestión de estados globales como autenticación, viajes y selección.
- `/utils`: Funciones auxiliares y configuración (p. ej. Firebase).
- `/styles`: Archivos con temas y colores.
- `/assets`: Imágenes, iconos y recursos estáticos.

---

## Requisitos Previos

- Node.js (v16+ recomendado)
- Expo CLI (`npm install -g expo-cli`)
- Cuenta Firebase configurada con Authentication, Firestore y FCM habilitados.
- Claves y configuraciones para Google Maps API.
- Acceso a la API de Gemini para chatbot.
- Dispositivo móvil o emulador para pruebas.

---


## Instalación y Ejecución

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/merchito12/wheels-app.git
   cd wheels-app

2. Instalación de Dependencias

      ```bash
      npm install

3. Configurar variables de entorno para Firebase, Google Maps y Gemini API.

4. Ejecutar la app en modo desarrollo:

   ```bash
   npm start
   ```



# Buenas Prácticas

- Uso de TypeScript para tipado estricto y evitar errores comunes.
- Manejo de estados globales mediante React Context para autenticación y gestión de viajes.
- Control estricto de roles y permisos para evitar accesos no autorizados.
- Modularización de componentes para facilitar mantenimiento y escalabilidad.
- Manejo de notificaciones push para comunicación en tiempo real.
- Verificación del flujo de reservas para asegurar la confiabilidad del servicio.
- Implementación de filtros avanzados para mejorar la experiencia del usuario.

# Posibles Mejoras Futuras

- Implementación de geolocalización en tiempo real para conductores y pasajeros.
- Sistema de chat integrado para comunicación directa.
- Integración con sistemas de pago para cobro automatizado.
- Panel administrativo web para gestión y estadísticas.
- IA para optimización de rutas y sugerencias inteligentes.
- Más opciones de filtros y personalización de viajes.
- Integración con servicios externos como Google Places para autocomplete de direcciones.



# Licencia

Este proyecto está bajo la licencia MIT. Ver archivo LICENSE para más detalles.

# Contacto

Para preguntas o soporte, contactar a:  
**Brandon Eduardo Merchan Sandoval**  
**Rita Trindade da Cruz**
