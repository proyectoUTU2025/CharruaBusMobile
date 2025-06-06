import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Tipos para los datos del usuario
interface TipoDocumento {
  id: number;
  nombre: string;
  codigo: string;
}

interface UserProfile {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // ISO date string
  fechaCreacion: string; // ISO date string
  documento: string;
  tipoDocumento: TipoDocumento;
}

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Datos de ejemplo (remover cuando se conecte con el backend)
  const mockUserProfile: UserProfile = {
    nombre: "Juan Carlos",
    apellido: "González",
    email: "juan.gonzalez@email.com",
    fechaNacimiento: "1990-05-15",
    fechaCreacion: "2024-01-10",
    documento: "12345678",
    tipoDocumento: {
      id: 1,
      nombre: "Cédula de Identidad",
      codigo: "CI"
    }
  };

  // Función para cargar los datos del perfil (placeholder para el endpoint)
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // TODO: Reemplazar con la llamada real al endpoint
      // const response = await fetch('/api/user/profile');
      // const data = await response.json();
      
      // Simulamos una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserProfile(mockUserProfile);
      
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar la información del perfil. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar los datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-UY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para calcular la edad
  const calculateAge = (birthDate: string) => {
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  };

  // Componente para mostrar un campo de información
  const InfoField = ({ 
    icon, 
    label, 
    value, 
    subtitle 
  }: { 
    icon: string; 
    label: string; 
    value: string; 
    subtitle?: string;
  }) => (
    <View style={styles.infoField}>
      <View style={styles.infoFieldHeader}>
        <Icon name={icon} size={20} color="#3B82F6" style={styles.fieldIcon} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <Text style={styles.fieldValue}>{value}</Text>
      {subtitle && <Text style={styles.fieldSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#CAC4D0" />
        <Text style={styles.errorTitle}>Error al cargar el perfil</Text>
        <Text style={styles.errorSubtitle}>
          No se pudo obtener la información del usuario
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header del perfil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={48} color="#3B82F6" />
          </View>
        </View>
        <Text style={styles.userName}>
          {userProfile.nombre} {userProfile.apellido}
        </Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      {/* Información personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <InfoField
          icon="person"
          label="Nombre"
          value={userProfile.nombre}
        />
        
        <InfoField
          icon="person-outline"
          label="Apellido"
          value={userProfile.apellido}
        />
        
        <InfoField
          icon="email"
          label="Correo Electrónico"
          value={userProfile.email}
        />
        
        <InfoField
          icon="cake"
          label="Fecha de Nacimiento"
          value={formatDate(userProfile.fechaNacimiento)}
          subtitle={`${calculateAge(userProfile.fechaNacimiento)} años`}
        />
      </View>

      {/* Información de documento */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documento de Identidad</Text>
        
        <InfoField
          icon="badge"
          label="Tipo de Documento"
          value={userProfile.tipoDocumento.nombre}
          subtitle={`Código: ${userProfile.tipoDocumento.codigo}`}
        />
        
        <InfoField
          icon="credit-card"
          label="Número de Documento"
          value={userProfile.documento}
        />
      </View>

      {/* Información de cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Cuenta</Text>
        
        <InfoField
          icon="schedule"
          label="Miembro desde"
          value={formatDate(userProfile.fechaCreacion)}
        />
      </View>

      {/* Botón de editar perfil */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            // TODO: Navegar a la pantalla de edición de perfil
            Alert.alert('Información', 'Funcionalidad de edición próximamente');
          }}
        >
          <Icon name="edit" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBFE',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#49454F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBFE',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1B1F',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#79747E',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#49454F',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1F4',
  },
  infoFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#79747E',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '400',
    marginLeft: 28,
  },
  fieldSubtitle: {
    fontSize: 14,
    color: '#79747E',
    marginLeft: 28,
    marginTop: 2,
  },
  actionSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;