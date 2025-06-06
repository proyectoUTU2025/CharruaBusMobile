import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Tipos para los estados del flujo de recuperación
type RecoveryStep = 'email' | 'token' | 'newPassword';

const RecoverPasswordScreen = ({ navigation }: any) => {
  // Estados para manejar el flujo
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para solicitar el token de recuperación
  const handleRequestToken = async () => {
    if (!email || !validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada real al endpoint
      // const response = await fetch('/api/auth/recover-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulamos verificación de correo existente
      if (email === 'noexiste@ejemplo.com') {
        setError('El correo electrónico ingresado no existe en el sistema');
        setLoading(false);
        return;
      }

      // Avanzamos al siguiente paso
      setCurrentStep('token');
      setLoading(false);
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Intenta nuevamente.');
      setLoading(false);
    }
  };

  // Función para validar el token
  const handleValidateToken = async () => {
    if (!token || token.length < 6) {
      setError('Por favor, ingresa el código de verificación completo');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada real al endpoint
      // const response = await fetch('/api/auth/validate-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, token })
      // });
      
      // Simulamos token inválido
      if (token === '000000') {
        setError('El código de verificación es inválido o ha expirado');
        setLoading(false);
        return;
      }

      // Avanzamos al siguiente paso
      setCurrentStep('newPassword');
      setLoading(false);
    } catch (err) {
      setError('Ocurrió un error al validar el código. Intenta nuevamente.');
      setLoading(false);
    }
  };

  // Función para establecer nueva contraseña
  const handleSetNewPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la llamada real al endpoint
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, token, newPassword })
      // });

      // Simulamos éxito
      setLoading(false);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        "¡Contraseña actualizada!",
        "Tu contraseña ha sido actualizada exitosamente.",
        [
          { 
            text: "Iniciar sesión", 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } catch (err) {
      setError('Ocurrió un error al actualizar tu contraseña. Intenta nuevamente.');
      setLoading(false);
    }
  };

  // Función para validar formato de email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Función para volver al paso anterior
  const handleGoBack = () => {
    if (currentStep === 'token') {
      setCurrentStep('email');
    } else if (currentStep === 'newPassword') {
      setCurrentStep('token');
    } else {
      navigation.goBack();
    }
  };

  // Función para reenviar el token
  const handleResendToken = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoading(false);
      Alert.alert(
        "Código reenviado",
        "Se ha enviado un nuevo código de verificación a tu correo electrónico."
      );
    } catch (err) {
      setError('No se pudo reenviar el código. Intenta nuevamente.');
      setLoading(false);
    }
  };

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <Text style={styles.stepTitle}>Recuperación de contraseña</Text>
            <Text style={styles.stepDescription}>
              Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
            </Text>
            
            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#79747E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRequestToken}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Enviar código</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        );
        
      case 'token':
        return (
          <>
            <Text style={styles.stepTitle}>Verificación</Text>
            <Text style={styles.stepDescription}>
              Hemos enviado un código de verificación a <Text style={styles.emailHighlight}>{email}</Text>. 
              Por favor, ingresa el código para continuar.
            </Text>
            
            <View style={styles.inputContainer}>
              <Icon name="vpn-key" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Código de verificación"
                placeholderTextColor="#79747E"
                keyboardType="number-pad"
                value={token}
                onChangeText={setToken}
                maxLength={6}
              />
            </View>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleValidateToken}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verificar código</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleGoBack}>
                <Text style={styles.linkText}>Cambiar correo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleResendToken}>
                <Text style={styles.linkText}>Reenviar código</Text>
              </TouchableOpacity>
            </View>
          </>
        );
        
      case 'newPassword':
        return (
          <>
            <Text style={styles.stepTitle}>Nueva contraseña</Text>
            <Text style={styles.stepDescription}>
              Crea una nueva contraseña segura para tu cuenta.
            </Text>
            
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor="#79747E"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#79747E"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSetNewPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Aceptar</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoBack}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

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
          {/* Header con botón de regreso */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          {/* Logo de la app */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="lock-open" size={40} color="#3B82F6" />
            </View>
          </View>
          
          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            {/* Mensaje de error si existe */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={20} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Paso actual del flujo */}
            {renderStep()}
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
    height: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#49454F',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1C1B1F',
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default RecoverPasswordScreen;