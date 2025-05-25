import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../utils/FirebaseConfig";
import { useAuth } from "../authContext/AuthContext";


type EstadoViaje = "por iniciar" | "en curso" | "finalizado";
type EstadoPunto = "pendiente" | "aceptado" | "negado";

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

interface ViajeContextProps {
  viajes: Viaje[];
  crearViaje: (
    nuevoViaje: Omit<Viaje, "id" | "puntos" | "idConductor" | "conductor">
  ) => Promise<string>;
  viajesFiltradosPorEstado: (estado: EstadoViaje) => Promise<Viaje[]>;
  solicitudesDePuntos: () => Promise<{ viaje: Viaje; punto: Punto }[]>;
  solicitudesDePuntosPorEstado: (
    viajeId: string,
    estado: EstadoPunto
  ) => Promise<Punto[]>;
  obtenerPuntosPorEstado: (
    estado: EstadoPunto
  ) => Promise<{ viajeId: string; viajeDireccion: string; punto: Punto }[]>;
  actualizarEstadoPunto: (
    viajeId: string,
    idCliente: string,
    nuevoEstado: EstadoPunto
  ) => Promise<void>;
  actualizarEstadoViaje: (
    viajeId: string,
    nuevoEstado: EstadoViaje
  ) => Promise<void>;
  obtenerPuntosPorEstadoYEstadoViaje: (
    estadoPunto: EstadoPunto,
    estadoViaje: EstadoViaje
  ) => Promise<{ viajeId: string; viajeDireccion: string; punto: Punto }[]>;
}

const ViajeContext = createContext<ViajeContextProps | undefined>(undefined);

export const ViajeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);

  useEffect(() => {
    if (!user) return;

    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("idConductor", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const viajesArray: Viaje[] = [];
      querySnapshot.forEach((doc) => {
        const { id, ...data } = doc.data() as Viaje;
        viajesArray.push({ id: doc.id, ...data });
      });
      setViajes(viajesArray);
    });

    return () => unsubscribe();
  }, [user]);

  const crearViaje = async (
    nuevoViaje: Omit<Viaje, "id" | "puntos" | "idConductor" | "conductor">
  ): Promise<string> => {
    if (!user) throw new Error("No hay usuario logueado");

    const viajeAGuardar = {
      ...nuevoViaje,
      idConductor: user.uid,
      conductor: user.displayName || "Conductor desconocido",
      puntos: [] as Punto[],
    };

    const viajesRef = collection(db, "viajes");
    const docRef = await addDoc(viajesRef, viajeAGuardar);
    return docRef.id;
  };

  const viajesFiltradosPorEstado = async (estado: EstadoViaje) => {
    if (!user) return [];

    const viajesRef = collection(db, "viajes");
    const q = query(
      viajesRef,
      where("idConductor", "==", user.uid),
      where("estado", "==", estado)
    );
    const querySnapshot = await getDocs(q);

    const viajesFiltrados: Viaje[] = [];
    querySnapshot.forEach((doc) => {
      const { id, ...data } = doc.data() as Viaje;
      viajesFiltrados.push({ id: doc.id, ...data });
    });
    return viajesFiltrados;
  };

  const solicitudesDePuntos = async () => {
    if (!user) return [];

    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("idConductor", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const solicitudes: { viaje: Viaje; punto: Punto }[] = [];

    querySnapshot.forEach((doc) => {
      const { id, ...data } = doc.data() as Viaje;
      const viaje = { id: doc.id, ...data };
      viaje.puntos.forEach((punto) => {
        solicitudes.push({ viaje, punto });
      });
    });

    return solicitudes;
  };

  const solicitudesDePuntosPorEstado = async (
    viajeId: string,
    estado: EstadoPunto
  ) => {
    const viajeDoc = doc(db, "viajes", viajeId);
    const viajeSnap = await getDoc(viajeDoc);
    if (!viajeSnap.exists()) return [];

    const viaje = viajeSnap.data() as Viaje;
    return viaje.puntos.filter((p) => p.estado === estado);
  };

  const obtenerPuntosPorEstado = async (
    estado: EstadoPunto
  ): Promise<{ viajeId: string; viajeDireccion: string; punto: Punto }[]> => {
    if (!user) return [];

    const viajesRef = collection(db, "viajes");
    const q = query(viajesRef, where("idConductor", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const resultados: { viajeId: string; viajeDireccion: string; punto: Punto }[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Viaje, "id">;
      const viaje = { id: doc.id, ...data };
      viaje.puntos
        .filter((p) => p.estado === estado)
        .forEach((punto) => {
          resultados.push({
            viajeId: viaje.id,
            viajeDireccion: viaje.direccion,
            punto,
          });
        });
    });

    return resultados;
  };

  const obtenerPuntosPorEstadoYEstadoViaje = async (
    estadoPunto: EstadoPunto,
    estadoViaje: EstadoViaje
  ): Promise<{ viajeId: string; viajeDireccion: string; punto: Punto }[]> => {
    if (!user) return [];

    const viajesRef = collection(db, "viajes");
    const q = query(
      viajesRef,
      where("idConductor", "==", user.uid),
      where("estado", "==", estadoViaje)
    );
    const querySnapshot = await getDocs(q);

    const resultados: { viajeId: string; viajeDireccion: string; punto: Punto }[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Viaje, "id">;
      const viaje = { id: doc.id, ...data };
      viaje.puntos
        .filter((p) => p.estado === estadoPunto)
        .forEach((punto) => {
          resultados.push({
            viajeId: viaje.id,
            viajeDireccion: viaje.direccion,
            punto,
          });
        });
    });

    return resultados;
  };

  const actualizarEstadoPunto = async (
    viajeId: string,
    idCliente: string,
    nuevoEstado: EstadoPunto
  ): Promise<void> => {
    const viajeRef = doc(db, "viajes", viajeId);
    const viajeSnap = await getDoc(viajeRef);

    if (!viajeSnap.exists()) throw new Error("El viaje no existe");

    const viaje = viajeSnap.data() as Viaje;

    const puntosActualizados = viaje.puntos.map((punto) =>
      punto.idCliente === idCliente ? { ...punto, estado: nuevoEstado } : punto
    );

    await updateDoc(viajeRef, {
      puntos: puntosActualizados,
    });
  };

  const actualizarEstadoViaje = async (
    viajeId: string,
    nuevoEstado: EstadoViaje
  ): Promise<void> => {
    const viajeRef = doc(db, "viajes", viajeId);
    const viajeSnap = await getDoc(viajeRef);

    if (!viajeSnap.exists()) throw new Error("El viaje no existe");

    await updateDoc(viajeRef, {
      estado: nuevoEstado,
    });
  };

  return (
    <ViajeContext.Provider
      value={{
        viajes,
        crearViaje,
        viajesFiltradosPorEstado,
        solicitudesDePuntos,
        solicitudesDePuntosPorEstado,
        obtenerPuntosPorEstado,
        actualizarEstadoPunto,
        actualizarEstadoViaje,
        obtenerPuntosPorEstadoYEstadoViaje,
      }}
    >
      {children}
    </ViajeContext.Provider>
  );
};

export const useViajes = () => {
  const context = useContext(ViajeContext);
  if (!context) throw new Error("useViajes debe usarse dentro de un ViajeProvider");
  return context;
};