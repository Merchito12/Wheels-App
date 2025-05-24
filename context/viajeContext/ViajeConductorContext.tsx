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
  cuposDisponibles: number; 
}

interface NuevoViajeInput extends Omit<Viaje, "id" | "puntos" | "idConductor" | "conductor"> {}

interface ViajeContextProps {
  viajes: Viaje[];
  viajesFiltradosPorEstado: (estado: EstadoViaje) => Promise<Viaje[]>;
  solicitudesDePuntos: () => Promise<{ viaje: Viaje; punto: Punto }[]>;
  solicitudesDePuntosPorEstado: (
    viajeId: string,
    estado: EstadoPunto
  ) => Promise<Punto[]>;
  crearViaje: (
    nuevoViaje: NuevoViajeInput
  ) => Promise<string>;
  reservarCupo: (viajeId: string) => Promise<void>;
  liberarCupo: (viajeId: string) => Promise<void>;
  obtenerPuntosPorEstado: (
    estado: EstadoPunto
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
        const data = doc.data() as Omit<Viaje, "id">;
        viajesArray.push({ id: doc.id, ...data });
      });
      setViajes(viajesArray);
    });

    return () => unsubscribe();
  }, [user]);

  const crearViaje = async (
    nuevoViaje: NuevoViajeInput
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
      const data = doc.data() as Omit<Viaje, "id">;
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
      const data = doc.data() as Omit<Viaje, "id">;
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

  const reservarCupo = async (viajeId: string): Promise<void> => {
    const viajeDocRef = doc(db, "viajes", viajeId);
    const viajeSnap = await getDoc(viajeDocRef);

    if (!viajeSnap.exists()) throw new Error("Viaje no existe");

    const viajeData = viajeSnap.data() as Viaje;

    if (viajeData.cuposDisponibles <= 0) {
      throw new Error("No hay cupos disponibles");
    }

    const nuevosCupos = viajeData.cuposDisponibles - 1;
    const nuevoEstado: EstadoViaje = nuevosCupos === 0 ? "finalizado" : viajeData.estado;

    await updateDoc(viajeDocRef, {
      cuposDisponibles: nuevosCupos,
      estado: nuevoEstado,
    });
  };

  const liberarCupo = async (viajeId: string): Promise<void> => {
    const viajeDocRef = doc(db, "viajes", viajeId);
    const viajeSnap = await getDoc(viajeDocRef);

    if (!viajeSnap.exists()) throw new Error("Viaje no existe");

    const viajeData = viajeSnap.data() as Viaje;

    const nuevosCupos = viajeData.cuposDisponibles + 1;

    const nuevoEstado: EstadoViaje = viajeData.estado === "finalizado" ? "por iniciar" : viajeData.estado;

    await updateDoc(viajeDocRef, {
      cuposDisponibles: nuevosCupos,
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
        reservarCupo,
        liberarCupo,
        obtenerPuntosPorEstado,
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
