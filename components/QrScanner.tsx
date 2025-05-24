import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

interface QRScannerProps {
  onScanned: (data: string) => void; // callback cuando se escanea QR
  onCancel: () => void;
}

export default function QRScanner({ onScanned, onCancel }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScanned(data);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso para la cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se dio permiso para usar la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Escanear de nuevo"} onPress={() => setScanned(false)} />
      )}
      <Button title="Cancelar" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
