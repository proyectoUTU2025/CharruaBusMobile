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
npx react-native doctor

## Clonar el repositorio

```cmd
git clone https://github.com/proyectoUTU2025/CharruaBusMobile.git
cd CharruaBusMobile
```

## Instalar las dependencias del proyecto
```
npm install
```
## 📱 Ejecutar la app en Android

Podés ejecutar la app en:

- 📱 Un celular Android real con Depuración USB activada.

- 🖥️ Un emulador Android creado desde Android Studio.

Asegurate de tener al menos un dispositivo/emulador encendido antes de ejecutar el siguiente comando.

### Verifica que el dispositivo esté disponible
adb devices

### Comando para ejecutar
```
npx react-native run-android
```
### Para especificar un dispositivo específico
#### Para buscar un dispositivo
```
adb device
```
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

🔗 [CharruaBus.apk](https://drive.google.com/uc?export=download&id=1yekRl0MtEzKw166p0UkX6WCDPPtW-7C6)
