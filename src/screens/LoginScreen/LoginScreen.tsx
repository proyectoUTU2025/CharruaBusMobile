import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../../types/navigationType';
import { useAuth } from "../../context/AuthContext";
import { styles } from './LoginScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("Main");
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(value) ? "" : "Formato de correo no válido");
    setEmail(value);
  };

  const validatePassword = (value: string) => {
    setPasswordError(value.length < 1 ? "La contraseña es obligatoria" : "");
    setPassword(value);
  };

  const handleLogin = async () => {
    clearError();

    let hasErrors = false;

    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio");
      hasErrors = true;
    } else if (emailError) {
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria");
      hasErrors = true;
    }

    if (hasErrors) return;

    await login(email.trim(), password);
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ResetPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/CharruaBusLogo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.welcomeText}>Bienvenido</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={20} color="#EF4444" />
                <Text style={styles.generalErrorText}>{error}</Text>
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, emailError && styles.inputInvalid]}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={validateEmail}
                  editable={!loading}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={[styles.passwordContainer, passwordError && styles.inputInvalid]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    value={password}
                    onChangeText={validatePassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Icon name={showPassword ? "visibility-off" : "visibility"} size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.loginButtonText, styles.loadingText]}>Iniciando sesión...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <TouchableOpacity onPress={handleRegister} disabled={loading}>
                  <Text style={[styles.footerLink, loading && styles.disabledLink]}>Registrarse</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                  <Text style={[styles.footerLink, loading && styles.disabledLink]}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}