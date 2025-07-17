import React, { useState, useEffect } from 'react';
import {
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

import { usePasswordValidation } from '../../hooks/usePasswordValidation';
import { changePassword } from '../../services/passwordService';

import { ChangePasswordData, PasswordRequirementsProps } from '../../types/passwordType';
import { styles } from './ChangePasswordScreen.styles';


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
      
      {children}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
    </View>
  );
};

interface ChangePasswordScreenProps {
  onSuccess: () => void;
  token: string;
  handleUnauthorized: () => void;
}

export default function ChangePasswordScreen({  
  onSuccess, 
  token,
  handleUnauthorized
}: ChangePasswordScreenProps & { handleUnauthorized: () => void }) {
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

  useEffect(() => {
    if (state.confirmPassword && state.newPassword !== undefined) {
      validateConfirmPassword(state.confirmPassword);
    }
  }, [state.newPassword]);

  const isFormValid = (): boolean => {
    if (!state.currentPassword || !state.newPassword || !state.confirmPassword) {
      return false;
    }

    if (state.currentPasswordError || state.newPasswordError || state.confirmPasswordError) {
      return false;
    }

    const passwordRequirements = getPasswordRequirements(state.newPassword);
    const allRequirementsMet = passwordRequirements.every(req => req.valid);
    
    if (!allRequirementsMet) {
      return false;
    }

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
        if (result.message === 'Sesión expirada') {
          handleUnauthorized();
          return;
        }
        handlePasswordChangeError(result.message);
      }
      
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
        return;
      }
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

  const isButtonEnabled = isFormValid() && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground 
        source={require("../../assets/background.png")} 
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
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Cambiar contraseña</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.formContainer}>
              <PasswordInput
                label="Contraseña actual"
                placeholder="Contraseña actual"
                value={state.currentPassword}
                error={state.currentPasswordError}
                showPassword={showPasswords.current}
                onChangeText={validateCurrentPassword}
                onToggleVisibility={() => togglePasswordVisibility('current')}
              />

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