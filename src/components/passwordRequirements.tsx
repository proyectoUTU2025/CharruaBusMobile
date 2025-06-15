import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { validatePassword, passwordsMatch } from "../utils/passwordValidator"

interface PasswordRequirementsProps {
  password: string
  confirmPassword?: string
  showMatchValidation?: boolean
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword = "",
  showMatchValidation = false,
}) => {
  const validation = validatePassword(password)
  const doPasswordsMatch = passwordsMatch(password, confirmPassword)

  return (
    <View style={styles.container}>
      <RequirementItem text="Mínimo 8 caracteres" isValid={!validation.errors.length} />
      <RequirementItem text="Al menos una minúscula" isValid={!validation.errors.lowercase} />
      <RequirementItem text="Al menos una mayúscula" isValid={!validation.errors.uppercase} />
      <RequirementItem text="Al menos un número" isValid={!validation.errors.number} />
      <RequirementItem text="Al menos un carácter especial" isValid={!validation.errors.special} />
      {showMatchValidation && confirmPassword.length > 0 && (
        <RequirementItem text="Las contraseñas coinciden" isValid={doPasswordsMatch} />
      )}
    </View>
  )
}

interface RequirementItemProps {
  text: string
  isValid: boolean
}

const RequirementItem: React.FC<RequirementItemProps> = ({ text, isValid }) => {
  return (
    <View style={styles.requirementItem}>
      <Icon name={isValid ? "check-circle" : "cancel"} size={16} color={isValid ? "#4CAF50" : "#F44336"} />
      <Text style={[styles.requirementText, { color: isValid ? "#4CAF50" : "#F44336" }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: "100%",
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
})

export default PasswordRequirements
