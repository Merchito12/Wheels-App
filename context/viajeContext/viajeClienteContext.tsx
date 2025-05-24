import React, { createContext, useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../utils/FirebaseConfig";
import { useAuth } from "../authContext/AuthContext";

export type EstadoViaje = "por iniciar" | "en curso" | "finalizado";
export type EstadoPunto = "pendiente" | "aceptado" | "negado";

export interface Punto {
  idCliente: string;
  direccion: string;
  estado: EstadoPunto;
}

export interface Viaje {
  id: string;
  idConductor: string;
  conductor: string;
  haciaLaU: boolean;
  direccion: string;
  horaSalida: string;
  fecha: string;
  precio: string;
  puntos: Punto[];
  estado: EstadoViaje;
}

interface ClienteContextProps {
  viajes: Viaje[];
  obtenerViajesPorCliente: () => Promise<Viaje[]>;
  obtenerViajesPorEstado: (estado: EstadoViaje) => Promise<Viaje[]>;
  obtenerViajesPorEstadoPunto: (estadoPunto: EstadoPunto) => Promise<Viaje[]>;
  obtenerViajesPorEstadoViajeYEstadoPunto: (
    estadoViaje: EstadoViaje,
    estadoPunto: EstadoPunto
  ) => Promise<Viaje[]>;
  crearPuntoEnViaje: (viajeId: string, punto: Punto) => Promise<void>;
}

const ClienteContext = createContext<ClienteContextProps | undefined>(undefined);

export const ClienteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);

  // Caché local para nombres de conductores
  const cacheConductores: Record<string, string> = {};

  // Obtener nombre conductor con caché
  const obtenerNombreConductor = async (idConductor: string): Promise<string> => {
    if (cacheConductores[idConductor]) {
      return cacheConductores[idConductor];
    }
    const conductorDoc = doc(db, "users", idConductor);
    const conductorSnap = await getDoc(conductorDoc);
    if (conductorSnap.exists()) {
      const data = conductorSnap.data();
      const nombre = data?.displayName || "Conductor desconocido";
      cacheConductores[idConductor] = nombre;
      return nombre;
    }
    cacheConductores[idConductor] = "Conductor desconocido";
    return "Conductor desconocido";
  };

  // 1. Viajes con puntos solicitados por cliente logueado
  const obtenerViajesPorCliente = async (): Promise<Viaje[]> => {
    if (!user) return [];
    const viajesRef = collection(db, "viajes");
    const querySnapshot = await getDocs(viajesRef);
    const resultados: Viaje[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Omit<Viaje, "id" | "conductor"> & { conductor?: string };
      if (data.puntos?.some((p) => p.idCliente === user.uid)) {
        const nombreConductor = await obtenerNombreConductor(data.idConductor);
        resultados.push({
          id: docSnap.id,
          ...data,
          conductor: nombreConductor,
        } as Viaje);
      }
    }
    return resultados;
  };

  // 2. Viajes filtrados por estado de viaje
  const obtenerViajesPorEstado = async (estado: EstadoViaje): Promise<Viaje[]> => {
    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", estado));
    const querySnapshot = await getDocs(q);
    const resultados: Viaje[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Omit<Viaje, "id" | "conductor"> & { conductor?: string };
      const nombreConductor = await obtenerNombreConductor(data.idConductor);
      resultados.push({
        id: docSnap.id,
        ...data,
        conductor: nombreConductor,
      } as Viaje);
    }
    return resultados;
  };

  // 3. Viajes con al menos un punto con estado específico
  const obtenerViajesPorEstadoPunto = async (estadoPunto: EstadoPunto): Promise<Viaje[]> => {
    const viajesRef = collection(db, "viajes");
    const querySnapshot = await getDocs(viajesRef);
    const resultados: Viaje[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Omit<Viaje, "id" | "conductor"> & { conductor?: string };
      if (data.puntos?.some((p) => p.estado === estadoPunto)) {
        const nombreConductor = await obtenerNombreConductor(data.idConductor);
        resultados.push({
          id: docSnap.id,
          ...data,
          conductor: nombreConductor,
        } as Viaje);
      }
    }
    return resultados;
  };

  // 4. Viajes filtrados por estado de viaje y estado de punto
  const obtenerViajesPorEstadoViajeYEstadoPunto = async (
    estadoViaje: EstadoViaje,
    estadoPunto: EstadoPunto
  ): Promise<Viaje[]> => {
    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("estado", "==", estadoViaje));
    const querySnapshot = await getDocs(q);
    const resultados: Viaje[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as Omit<Viaje, "id" | "conductor"> & { conductor?: string };
      if (data.puntos?.some((p) => p.estado === estadoPunto)) {
        const nombreConductor = await obtenerNombreConductor(data.idConductor);
        resultados.push({
          id: docSnap.id,
          ...data,
          conductor: nombreConductor,
        } as Viaje);
      }
    }
    return resultados;
  };

  // 5. Crear punto en viaje
  const crearPuntoEnViaje = async (viajeId: string, punto: Punto): Promise<void> => {
    if (!user) throw new Error("No hay usuario logueado");
    const viajeDoc = doc(db, "viajes", viajeId);

    const puntoAGuardar: Punto = {
      idCliente: user.uid,
      direccion: punto.direccion,
      estado: punto.estado || "pendiente",
    };

    await updateDoc(viajeDoc, {
      puntos: arrayUnion(puntoAGuardar),
    });
  };

  return (
    <ClienteContext.Provider
      value={{
        viajes,
        obtenerViajesPorCliente,
        obtenerViajesPorEstado,
        obtenerViajesPorEstadoPunto,
        obtenerViajesPorEstadoViajeYEstadoPunto,
        crearPuntoEnViaje,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};

export const useCliente = (): ClienteContextProps => {
  const context = useContext(ClienteContext);
  if (!context) throw new Error("useCliente debe usarse dentro de un ClienteProvider");
  return context;
};
