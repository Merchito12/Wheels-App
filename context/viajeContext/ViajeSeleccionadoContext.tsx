// context/viajeContext/ViajeSeleccionadoContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Viaje {
  fecha: string;
  // Define aquí las propiedades mínimas que usarás
  id: string;
  direccion?: string;
  horaSalida?: string;
  precio?: number | string;
  estado?: string;
  haciaLaU?: boolean;
  puntos?: any[]; // Puedes hacer una interfaz para puntos si quieres
}

interface ViajeSeleccionadoContextProps {
  viaje: Viaje | null;
  setViaje: (v: Viaje | null) => void;
}

const ViajeSeleccionadoContext = createContext<ViajeSeleccionadoContextProps>({
  viaje: null,
  setViaje: () => {},
});

interface ViajeSeleccionadoProviderProps {
  children: ReactNode;
}

export const ViajeSeleccionadoProvider: React.FC<ViajeSeleccionadoProviderProps> = ({ children }) => {
  const [viaje, setViaje] = useState<Viaje | null>(null);

  return (
    <ViajeSeleccionadoContext.Provider value={{ viaje, setViaje }}>
      {children}
    </ViajeSeleccionadoContext.Provider>
  );
};

export const useViajeSeleccionado = () => {
  const context = useContext(ViajeSeleccionadoContext);
  if (!context) {
    throw new Error('useViajeSeleccionado debe usarse dentro de ViajeSeleccionadoProvider');
  }
  return context;
};