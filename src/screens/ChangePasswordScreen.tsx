import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { changePassword } from '../services/passwordService';

import { ChangePasswordData, PasswordRequirement } from '../types/passwordType';

interface PasswordRequirementsProps {
  password: string;
  requirements: PasswordRequirement[];
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ 
  password, 
  requirements 
}) => {
  if (!password) return null;

  return (
    <View style={styles.passwordRequirements}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          <Icon 
            name={req.valid ? "check-circle" : "cancel"} 
            size={16} 
            color={req.valid ? "#10B981" : "#EF4444"} 
          />
          <Text style={[styles.requirementText, req.valid && styles.requirementValid]}>
            {req.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  successMessage?: string;
  showPassword: boolean;
  onChangeText: (text: string) => void;
  onToggleVisibility: () => void;
  children?: React.ReactNode;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  error,
  successMessage,
  showPassword,
  onChangeText,
  onToggleVisibility,
  children
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.passwordContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={onToggleVisibility}
        >
          <Icon 
            name={showPassword ? "visibility" : "visibility-off"} 
            size={20} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Componentes adicionales (como PasswordRequirements) */}
      {children}
      
      {/* Mensajes de error y éxito */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
    </View>
  );
};

interface ChangePasswordScreenProps {
  onGoBack: () => void;
  onSuccess: () => void;
  token: string;
}

export default function ChangePasswordScreen({ 
  onGoBack, 
  onSuccess, 
  token 
}: ChangePasswordScreenProps) {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    state,
    getPasswordRequirements,
    validateCurrentPassword,
    validateNewPassword,
    validateConfirmPassword,
    validateAll,
    setFieldError,
  } = usePasswordValidation();

  // Función para verificar si el formulario es válido
  const isFormValid = (): boolean => {
    // Verificar que todos los campos estén llenos
    if (!state.currentPassword || !state.newPassword || !state.confirmPassword) {
      return false;
    }

    // Verificar que no haya errores
    if (state.currentPasswordError || state.newPasswordError || state.confirmPasswordError) {
      return false;
    }

    // Verificar que la nueva contraseña cumpla todos los requisitos
    const passwordRequirements = getPasswordRequirements(state.newPassword);
    const allRequirementsMet = passwordRequirements.every(req => req.valid);
    
    if (!allRequirementsMet) {
      return false;
    }

    // Verificar que las contraseñas coincidan
    if (state.newPassword !== state.confirmPassword) {
      return false;
    }

    return true;
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    const validation = validateAll();
    
    if (!validation.isValid) {
      return;
    }

    setLoading(true);

    try {
      const passwordData: ChangePasswordData = {
        currentPassword: state.currentPassword,
        newPassword: state.newPassword,
        confirmPassword: state.confirmPassword,
      };

      const result = await changePassword(token, passwordData);
      
      if (result.success) {
        Alert.alert(
          "¡Contraseña cambiada!",
          "Tu contraseña ha sido actualizada exitosamente.",
          [{ text: "Aceptar", onPress: onSuccess }]
        );
      } else {
        handlePasswordChangeError(result.message);
      }
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido';
      handlePasswordChangeError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeError = (errorMessage: string) => {
    if (errorMessage === 'CURRENT_PASSWORD_INCORRECT' || 
        errorMessage.includes('contraseña actual es incorrecta')) {
      setFieldError('currentPasswordError', 'La contraseña actual es incorrecta');
    } else if (errorMessage === 'SAME_PASSWORD' || 
               errorMessage.includes('debe ser diferente')) {
      setFieldError('newPasswordError', 'La nueva contraseña debe ser diferente a la actual');
    } else if (errorMessage === 'PASSWORDS_DONT_MATCH' || 
               errorMessage.includes('no coinciden')) {
      setFieldError('confirmPasswordError', 'Las contraseñas no coinciden');
    } else if (errorMessage === 'VALIDATION_ERROR') {
      setFieldError('currentPasswordError', 'Por favor, verifica tu contraseña actual');
    } else {
      Alert.alert("Error", errorMessage);
    }
  };

  const passwordsMatch = state.confirmPassword && 
                        state.newPassword === state.confirmPassword && 
                        getPasswordRequirements(state.newPassword).every(req => req.valid);

  // Variable para determinar si el botón debe estar habilitado
  const isButtonEnabled = isFormValid() && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground 
        source={require("../assets/background.png")} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Cambiar contraseña</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.formContainer}>
              {/* Contraseña actual */}
              <PasswordInput
                label="Contraseña actual"
                placeholder="Contraseña actual"
                value={state.currentPassword}
                error={state.currentPasswordError}
                showPassword={showPasswords.current}
                onChangeText={validateCurrentPassword}
                onToggleVisibility={() => togglePasswordVisibility('current')}
              />

              {/* Nueva contraseña */}
              <PasswordInput
                label="Nueva contraseña"
                placeholder="Nueva contraseña"
                value={state.newPassword}
                error={state.newPasswordError}
                showPassword={showPasswords.new}
                onChangeText={validateNewPassword}
                onToggleVisibility={() => togglePasswordVisibility('new')}
              >
                <PasswordRequirements 
                  password={state.newPassword}
                  requirements={getPasswordRequirements(state.newPassword)}
                />
              </PasswordInput>

              {/* Confirmar nueva contraseña */}
              <PasswordInput
                label="Confirmar nueva contraseña"
                placeholder="Confirmar nueva contraseña"
                value={state.confirmPassword}
                error={state.confirmPasswordError}
                successMessage={passwordsMatch ? "✓ Las contraseñas coinciden y cumplen los requisitos" : undefined}
                showPassword={showPasswords.confirm}
                onChangeText={validateConfirmPassword}
                onToggleVisibility={() => togglePasswordVisibility('confirm')}
              />

              {/* Botón cambiar contraseña - ACTUALIZADO */}
              <TouchableOpacity 
                style={[
                  styles.changeButton, 
                  !isButtonEnabled && styles.changeButtonDisabled
                ]} 
                activeOpacity={isButtonEnabled ? 0.8 : 1} 
                onPress={handleChangePassword}
                disabled={!isButtonEnabled}
              >
                <Text style={[
                  styles.changeButtonText,
                  !isButtonEnabled && styles.changeButtonTextDisabled
                ]}>
                  {loading ? "Cambiando..." : "Cambiar contraseña"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingTop: StatusBar.currentHeight || 42,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeButton: {
    padding: 15,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  passwordRequirements: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 6,
  },
  requirementValid: {
    color: '#10B981',
  },
  changeButton: {
    backgroundColor: "#3B82F6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  changeButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  changeButtonTextDisabled: {
    color: "#FFFFFF",
    opacity: 0.7,
  },
});