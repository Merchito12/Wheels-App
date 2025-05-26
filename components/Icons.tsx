import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';


interface IconProps {
  color?: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = (props) => (
  <MaterialIcons name="home" size={24} color="white" {...props} />
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <MaterialCommunityIcons name="account" size={24} color="black" {...props} />
);

export const ActivityIcon: React.FC<IconProps> = (props) => (
  <FontAwesome5 name="list-ul" size={24} color="black" {...props} />
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
  <FontAwesome5 name="history" size={24} color="black" {...props} />
);
export const SortIcon: React.FC<IconProps> = (props) => (
  <FontAwesome5 name="sort" size={24} color="black" {...props} />
);
export const FilterIcon: React.FC<IconProps> = (props) => (
<MaterialIcons name="filter-list" size={24} color="black" {...props} />
);  
export const ArrowRight: React.FC<IconProps> = (props) => (
<MaterialIcons name="keyboard-arrow-right" size={24} color="black" {...props}/>
);
export const LogOutIcon: React.FC<IconProps> = (props) => (
<MaterialIcons name="logout" size={24} color="black" {...props}/>);
export const StarIcon: React.FC<IconProps> = (props) => (
<FontAwesome name="star" size={24} color="black" {...props}/>
);
export const CameraIcon: React.FC<IconProps> = (props) => (
  <FontAwesome5 name="camera" size={24} color="black" {...props} />
);
export const EyeIcon = ({ visible, size = 24, color = "black" }: { visible: boolean; size?: number; color?: string }) => {
  return (
    <MaterialIcons
      name={visible ? "visibility-off" : "visibility"}
      size={size}
      color={color}
    />
  );
};