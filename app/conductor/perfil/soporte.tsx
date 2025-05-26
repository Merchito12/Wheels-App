import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import colors from "../../../styles/Colors";  // Asegúrate de tener un archivo de colores

export default function Soporte() {


  const handleWhatsApp = () => {
    const phoneNumber = '+3105437755';  
    const message = 'Hola, tengo una pregunta sobre la aplicación';  

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch((err) => console.error("Error al abrir WhatsApp", err));
  };

  return (
    <ScrollView style={styles.container}>


      {/* Información de contacto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        <Text style={styles.paragraph}>
          Si tienes problemas o preguntas, puedes contactarnos a través del correo electrónico:
        </Text>
        <Text style={styles.contactInfo}>soporte@wheelsapp.com</Text>
        <Text style={styles.paragraph}>O llama al teléfono: 3105437755</Text>
        <TouchableOpacity style={styles.whatsAppButton} onPress={handleWhatsApp}>
          <Text style={styles.buttonText}>Contactar al soporte por WhatsApp</Text>
        </TouchableOpacity>
      </View>
      

      {/* Preguntas frecuentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preguntas Frecuentes (FAQ)</Text>
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>¿Cómo puedo hacer un viaje?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>¿Cómo cambio de carro?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>¿Puedo cancelar un viaje?</Text>
        </TouchableOpacity>
      </View>

     

      {/* Soporte técnico */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte Técnico</Text>
        <Text style={styles.paragraph}>
          Si tienes problemas técnicos con la aplicación, consulta nuestras guías de solución de problemas:
        </Text>
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.guideText}>Solución de problemas con el pago</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.guideText}>Problemas con la ubicación y el punto de encuentro</Text>
        </TouchableOpacity>
      </View>

  


      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: colors.lightGrey,
    padding: 17,
    borderRadius: 10,   
   borderColor: colors.lightGrey,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,    
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    
      
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue,
  },
  faqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey100,
  },
  faqQuestion: {
    fontSize: 16,
    color: colors.black,
  },
  contactButton: {
    backgroundColor: colors.whatsapp,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  contactButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  guideText: {
    fontSize: 16,
    color: colors.black,
  },
  socialButton: {
    backgroundColor: colors.lightBlue,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  socialButtonText: {
    color: colors.blue,
    fontWeight: 'bold',
    fontSize: 16,
  },
  whatsAppButton: {
    backgroundColor: colors.whatsapp,  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
