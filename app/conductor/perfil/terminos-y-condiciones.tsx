import React from 'react';
import { View, StyleSheet } from 'react-native';
import TerminosYCondiciones from '@/components/shared/TerminosYCondiciones';

export default function TerminosScreen() {
  return (
    <View style={styles.container}>
      <TerminosYCondiciones />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
