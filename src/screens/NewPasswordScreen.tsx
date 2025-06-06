import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

interface NewPasswordScreenProps {
  navigation?: any;
  onPasswordChanged?: () => void;
}

const NewPasswordScreen: React.FC<NewPasswordScreenProps> = ({ 
  navigation, 
  onPasswordChanged 
}) => {
  // Estados para los campos del formulario
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para validación y carga
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Detectar si hay cambios sin guardar
  useEffect(() => {
    const hasChanges = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [currentPassword, newPassword, confirmPassword]);

  // Interceptar el evento de salir de la pantalla
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = (e: any) => {
        if (!hasUnsavedChanges) {
          // Si no hay cambios, permitir salir normalmente
          return;
        }

        // Prevenir la acción por defecto
        e.preventDefault();

        // Mostrar confirmación
        Alert.alert(
          'Descartar cambios',
          '¿Estás seguro de que deseas salir? Se perderán los cambios realizados.',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => {} },
            {
              text: 'Salir',
              style: 'destructive',
              onPress: () => navigation?.goBack(),
            },
          ]
        );
      };

      // Agregar el listener
      navigation?.addListener('beforeRemove', onBackPress);

      // Cleanup
      return () => navigation?.removeListener('beforeRemove', onBackPress);
    }, [navigation, hasUnsavedChanges])
  );

  // Función para validar la contraseña actual
  const validateCurrentPassword = (password: string) => {
    if (!password) {
      return 'La contraseña actual es obligatoria';
    }
    if (password.length < 1) {
      return 'Ingresa tu contraseña actual';
    }
    return '';
  };

  // Función para validar la nueva contraseña
  const validateNewPassword = (password: string) => {
    if (!password) {
      return 'La nueva contraseña es obligatoria';
    }
    if (password.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    if (password === currentPassword) {
      return 'La nueva contraseña debe ser diferente a la actual';
    }
    return '';
  };

  // Función para validar la confirmación de contraseña
  const validateConfirmPassword = (password: string, newPass: string) => {
    if (!password) {
      return 'Confirma tu nueva contraseña';
    }
    if (password !== newPass) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  };

  // Función para validar todos los campos
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    const currentError = validateCurrentPassword(currentPassword);
    if (currentError) newErrors.currentPassword = currentError;

    const newError = validateNewPassword(newPassword);
    if (newError) newErrors.newPassword = newError;

    const confirmError = validateConfirmPassword(confirmPassword, newPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para simular verificación de contraseña actual
  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    // Aquí iría la llamada real al backend
    // const response = await fetch('/api/auth/verify-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ currentPassword: password })
    // });
    
    // Simulación: contraseña incorrecta si es "wrong"
    await new Promise(resolve => setTimeout(resolve, 1000));
    return password !== 'wrong';
  };

  // Función para actualizar la contraseña
  const updatePassword = async (newPass: string): Promise<boolean> => {
    // Aquí iría la llamada real al backend
    // const response = await fetch('/api/auth/change-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     currentPassword: currentPassword,
    //     newPassword: newPass 
    //   })
    // });
    
    // Simulación de actualización exitosa
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  };

  // Función principal para cambiar contraseña
  const handleChangePassword = async () => {
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Paso 5: Verificar contraseña actual
      const isCurrentPasswordValid = await verifyCurrentPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        // Flujo Alternativo 5.A.1: Contraseña actual incorrecta
        setErrors({ currentPassword: 'La contraseña actual no coincide con la almacenada en la base de datos' });
        setLoading(false);
        return;
      }

      // Paso 6 y 7: Actualizar contraseña en la base de datos
      const updateSuccess = await updatePassword(newPassword);
      
      if (updateSuccess) {
        // Paso 8: Mostrar mensaje de éxito
        setLoading(false);
        
        Alert.alert(
          "¡Contraseña actualizada!",
          "Tu contraseña ha sido cambiada exitosamente.",
          [
            { 
              text: "Aceptar", 
              onPress: () => {
                // Limpiar formulario
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setHasUnsavedChanges(false);
                
                // Callback o navegación
                if (onPasswordChanged) {
                  onPasswordChanged();
                } else if (navigation) {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        throw new Error('Error al actualizar la contraseña');
      }
      
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Error",
        "Ocurrió un error al cambiar tu contraseña. Intenta nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  // Función para cancelar manualmente
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Descartar cambios",
        "¿Estás seguro de que deseas cancelar? Se perderán los cambios realizados.",
        [
          { text: "No", style: "cancel" },
          { 
            text: "Sí", 
            onPress: () => {
              setHasUnsavedChanges(false);
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } else {
      if (navigation) {
        navigation.goBack();
      }
    }
  };

  // Componente para campo de contraseña
  const PasswordField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    showPassword, 
    onToggleShow, 
    error 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleShow: () => void;
    error?: string;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.passwordContainer, error && styles.inputError]}>
        <Icon name="lock" size={20} color="#79747E" style={styles.inputIcon} />
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#79747E"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleShow}
          disabled={loading}
        >
          <Icon 
            name={showPassword ? "visibility-off" : "visibility"} 
            size={20} 
            color="#79747E" 
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header sin flecha */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cambiar contraseña</Text>
          </View>
          
          {/* Icono principal */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Icon name="lock-outline" size={40} color="#3B82F6" />
            </View>
          </View>
          
          {/* Descripción */}
          <Text style={styles.description}>
            Para cambiar tu contraseña, primero confirma tu contraseña actual y luego ingresa la nueva.
          </Text>
          
          {/* Formulario */}
          <View style={styles.formContainer}>
            <PasswordField
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Ingresa tu contraseña actual"
              showPassword={showCurrentPassword}
              onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              error={errors.currentPassword}
            />
            
            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Ingresa tu nueva contraseña"
              showPassword={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
              error={errors.newPassword}
            />
            
            <PasswordField
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirma tu nueva contraseña"
              showPassword={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
            />
          </View>
          
          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Guardar</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#49454F',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#49454F',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#F44336',
  },
  inputIcon: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    color: '#1C1B1F',
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewPasswordScreen;