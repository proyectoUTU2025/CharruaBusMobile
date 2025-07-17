# 🚌 CharruaBus App - React Native Android

Aplicación móvil de venta de pasajes de ómnibus desarrollada con **React Native CLI**, enfocada exclusivamente en la plataforma **Android**.

---

## 📦 Requisitos previos

Antes de clonar y ejecutar este proyecto, asegurate de tener instalados los siguientes programas en **Windows**:

### 🔧 Herramientas necesarias:

| Herramienta | Versión | Descripción |
|------------|---------|-------------|
| [Node.js](https://nodejs.org/) | `v18.20.8 o superior` | Entorno de ejecución JavaScript |
| [Java JDK](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html) | `21 o superior` | Requerido para compilar Android |
| [Android Studio](https://developer.android.com/studio) | `14.1.3.2024 o superior` | Para emuladores y SDKs de Android |
| [Git](https://git-scm.com/) | `Última` | Para clonar el repositorio |
| [React Native CLI](https://reactnative.dev/docs/environment-setup) | `Global` | ```npm install -g react-native-cli``` |

---

## ⚙️ Configuración del entorno en Windows

### Configurar las variables de entorno (solo la primera vez)

> JAVA_HOME=C:\Program Files\Java\jdk-21

> ANDROID_HOME=C:\Users\<TU_USUARIO>\AppData\Local\Android\Sdk

### Verificar el entorno

```
npx react-native doctor
````

## Clonar el repositorio

```
git clone https://github.com/proyectoUTU2025/CharruaBusMobile.git
cd CharruaBusMobile
```

## 📁 Estructura de carpetas

```
src
├───assets
│   ├───background.png
│   ├───backgroundLoading.png
│   ├───CharruaBusLogo-SinTexto.png
│   ├───CharruaBusLogo.png
│   └───CharruaBusLogoSinFondo.png
├───components
│   └───DeepLinkHandler.tsx
├───context
│   ├───AuthContext.tsx
│   └───NotificationContext.tsx
├───hooks
│   ├───useNotifications.ts
│   ├───usePasswordValidation.ts
│   └───useUser.tsx
├───navigation
│   ├───AppNavigator.tsx
│   ├───BottomTabsNavigator.styles.ts
│   └───BottomTabsNavigator.tsx
├───screens
│   ├───ChangePasswordScreen
│   │   ├───ChangePasswordScreen.styles.ts
│   │   └───ChangePasswordScreen.tsx
│   ├───EditProfileScreen
│   │   ├───EditProfileScreen.styles.ts
│   │   └───EditProfileScreen.tsx
│   ├───LoadingScreen
│   │   ├───LoadingScreen.styles.ts
│   │   └───LoadingScreen.tsx
│   ├───LoginScreen
│   │   ├───LoginScreen.styles.ts
│   │   └───LoginScreen.tsx
│   ├───MainScreen
│   │   ├───MainScreen.styles.ts
│   │   └───MainScreen.tsx
│   ├───OneWayTripScreen
│   │   ├───OneWayTripScreen.styles.ts
│   │   └───OneWayTripScreen.tsx
│   ├───PurchaseDetailScreen
│   │   ├───PurchaseDetailScreen.styles.ts
│   │   └───PurchaseDetailScreen.tsx
│   ├───PurchasesScreen
│   │   ├───PurchasesScreen.styles.ts
│   │   └───PurchasesScreen.tsx
│   ├───RegisterScreen
│   │   ├───RegisterScreen.styles.ts
│   │   └───RegisterScreen.tsx
│   ├───ResetPasswordScreen
│   │   ├───ResetPasswordScreen.styles.ts
│   │   └───ResetPasswordScreen.tsx
│   ├───RoundTripScreen
│   │   ├───RoundTripScreen.styles.ts
│   │   └───RoundTripScreen.tsx
│   ├───SelectSeatScreen
│   │   ├───SelectSeatScreen.styles.ts
│   │   └───SelectSeatScreen.tsx
│   ├───TicketDetailScreen
│   │   ├───TicketDetailScreen.styles.ts
│   │   └───TicketDetailScreen.tsx
│   ├───TicketsScreen
│   │   ├───TicketsScreen.styles.ts
│   │   └───TicketsScreen.tsx
│   ├───TripSelectionScreen
│   │   ├───TripSelectionScreen.styles.ts
│   │   └───TripSelectionScreen.tsx
│   ├───VerifyEmailScreen
│   │   ├───VerifyEmailScreen.styles.ts
│   │   └───VerifyEmailScreen.tsx
│   └───ViewTripsScreen
│       ├───ViewTripsScreen.styles.ts
│       └───ViewTripsScreen.tsx
├───services
│   ├───authService.ts
│   ├───configService.ts
│   ├───locationService.ts
│   ├───notificationApiService.ts
│   ├───notificationService.ts
│   ├───passwordService.ts
│   ├───paymentService.ts
│   ├───purchaseService.ts
│   ├───resetPasswordService.ts
│   ├───ticketService.ts
│   ├───tripService.ts
│   ├───updateUserService.ts
│   └───userService.ts
├───types
│   ├───authType.ts
│   ├───configType.ts
│   ├───locationType.ts
│   ├───navigationType.ts
│   ├───notificationType.ts
│   ├───passwordType.ts
│   ├───purchaseType.ts
│   ├───resetPasswordType.ts
│   ├───roundTripType.ts
│   ├───screenPropsType.ts
│   ├───ticketType.ts
│   ├───tripType.ts
│   └───userType.ts
└───utils
    ├───errorHandler.ts
    ├───httpInterceptor.ts
    ├───notificationUtils.ts
    ├───responsiveDimensions.ts
    └───responsiveTheme.ts
```

## Instalar las dependencias del proyecto

```
npm install
```

## Configuracion del archivo .env

Ajustar API_BASE_URL

Si se usa el emulador, es necesario indicar la ip del pc donde se corre el back (Ejemplo: API_BASE_URL=http://192.168.1.170:8080)

En caso de usar un emulador se puede utilizar localhost (Ejemplo: API_BASE_URL=http://localhost:8080)

Para el caso de estar deployada en algun sitio indicar usar mismo la url del sitio (Ejemplo: API_BASE_URL=https://charruabusbackend-production.up.railway.app)

## Visibilidad del back para red local (En caso de no tener el back deployado)

```
netsh advfirewall firewall add rule name="Spring Boot Dev" dir=in action=allow protocol=TCP localport=8080
```
## 📱 Ejecutar la app en Android

Podés ejecutar la app en:

- 📱 Un celular Android real con Depuración USB activada.

- 🖥️ Un emulador Android creado desde Android Studio.

Asegurate de tener al menos un dispositivo/emulador encendido antes de ejecutar el siguiente comando.

### Verifica que el dispositivo esté disponible

```
adb device
```

### Comando para ejecutar

```
npx react-native run-android
```

### Para especificar un dispositivo específico
#### Ejecutar en el DISPOSITIVO elegido

```
npx react-native run-android --device DISPOSITIVO
```

## 🏗️ Generar APK

```
cd android
./gradlew clean
./gradlew assembleRelease
```

## 📲 Descargar APK
También podés descargar el APK listo para instalar desde la siguiente URL:

🔗 [CharruaBus.apk](https://drive.google.com/drive/folders/1lRBGEulAuHHkOxDK27c1-69uHx6SsU99?usp=sharing)
