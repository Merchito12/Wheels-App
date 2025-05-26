import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import colors from "@/styles/Colors";

export default function TerminosYCondiciones() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>1. Introducción</Text>
      <Text style={styles.paragraph}>
        Bienvenido a Wheels, la aplicación de transporte que conecta a usuarios y conductores para ofrecer un servicio de transporte eficiente y seguro.
        Al utilizar nuestra aplicación, aceptas cumplir con los siguientes términos y condiciones.
      </Text>

      <Text style={styles.sectionTitle}>2. Uso de la aplicación</Text>
      <Text style={styles.paragraph}>
        2.1 Usuarios y Conductores: Los usuarios pueden utilizar la aplicación para reservar viajes, y los conductores pueden aceptar solicitudes de viaje de los usuarios. La aplicación proporciona un punto de encuentro y una tarifa esperada para cada viaje.
      </Text>
      <Text style={styles.paragraph}>
        2.2 Condiciones de uso: Los usuarios y conductores deben cumplir con las reglas y políticas de la plataforma. Las reservas deben realizarse a través de la aplicación, y ambas partes deben aceptar los términos de la tarifa esperada y el punto de encuentro antes de proceder con el viaje.
      </Text>

      <Text style={styles.sectionTitle}>3. Privacidad y Datos Personales</Text>
      <Text style={styles.paragraph}>
        3.1 Recopilación de Datos: Al utilizar Wheels, el usuario acepta la recopilación de ciertos datos personales para el funcionamiento adecuado de la aplicación, como la ubicación, nombre, y detalles de contacto.
      </Text>
      <Text style={styles.paragraph}>
        3.2 Uso de Datos: Los datos recopilados serán utilizados exclusivamente para fines dentro de la aplicación, tales como la gestión de viajes, tarifas, y estadísticas de uso. Los datos no serán compartidos con empresas externas sin el consentimiento explícito del usuario.
      </Text>
      <Text style={styles.paragraph}>
        3.3 Estadísticas: Los datos recopilados también pueden ser utilizados para generar estadísticas agregadas sobre el uso de la plataforma, con el fin de mejorar la calidad del servicio ofrecido.
      </Text>

      <Text style={styles.sectionTitle}>4. Condiciones de Pago</Text>
      <Text style={styles.paragraph}>
        4.1 Tarifa Esperada: La tarifa del viaje será calculada de manera automática según el punto de inicio, destino y tiempo estimado del viaje. El usuario acepta que la tarifa calculada es una estimación y puede variar en función de factores como el tráfico o cambios en el tiempo estimado.
      </Text>
      <Text style={styles.paragraph}>
        4.2 Métodos de Pago: El pago de los viajes será realizado a través de los métodos habilitados en la aplicación. El usuario debe asegurarse de que su información de pago esté actualizada y disponible en la cuenta.
      </Text>

      <Text style={styles.sectionTitle}>5. Responsabilidades del Usuario</Text>
      <Text style={styles.paragraph}>
        5.1 Responsabilidad del Usuario: El usuario es responsable de proporcionar información precisa y actualizada sobre su ubicación y destino al realizar la solicitud de viaje. Además, el usuario debe asegurarse de que el punto de encuentro sea accesible y seguro para ambos, usuario y conductor.
      </Text>
      <Text style={styles.paragraph}>
        5.2 Comportamiento Apropiado: El usuario se compromete a mantener un comportamiento respetuoso durante el viaje y a no realizar conductas inapropiadas que puedan poner en riesgo la seguridad de las personas.
      </Text>

      <Text style={styles.sectionTitle}>6. Modificaciones de los Términos</Text>
      <Text style={styles.paragraph}>
        Wheels se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Cualquier cambio será comunicado a los usuarios a través de la aplicación o por correo electrónico.
      </Text>

      <Text style={styles.sectionTitle}>7. Aceptación de los Términos</Text>
      <Text style={styles.paragraph}>
        Al utilizar la aplicación, el usuario acepta estos términos y condiciones en su totalidad. Si no estás de acuerdo con estos términos, no utilices la aplicación.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.black,
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 15,
    lineHeight: 20,
  },
});
