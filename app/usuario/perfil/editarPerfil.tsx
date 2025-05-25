
import React from 'react';
import { useAuth } from '@/context/authContext/AuthContext';
import { useRouter } from 'expo-router';
import ProfileEditor, { ProfileData } from '@/components/shared/ProfileEditor';

export default function EditarPerfilScreen() {
  const { userName, profilePhotoURL, updateProfile } = useAuth();
  const router = useRouter();

  // Datos iniciales que pasamos al componente
  const initialData: ProfileData = {
    name: userName || '',
    profilePhotoURL: profilePhotoURL || '',
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async (data: ProfileData) => {
    // Llamamos al método de context para persistir cambios
    await updateProfile({
      name: data.name,
      profilePhotoURL: data.profilePhotoURL,
    });
    router.back();
  };

  return (
    <ProfileEditor
      initialData={initialData}
      onCancel={handleCancel}
      onSave={handleSave}
    />
  );
}
