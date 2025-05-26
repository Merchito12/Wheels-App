import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HomeIcon, UserIcon, ActivityIcon, HistoryIcon } from "../../components/Icons";
import colors from "../../styles/Colors";

export default function Tabslayout() {
  return (
    <Tabs screenOptions={{headerShown: false,tabBarLabelStyle: styles.tabBarLabel,tabBarActiveTintColor: colors.black,tabBarInactiveTintColor: colors.grey, tabBarIconStyle: styles.tabBarIconStyle,tabBarStyle: styles.tabBarStyle, }} >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon color={focused ? colors.black : colors.grey} />,
        }}
      />

      <Tabs.Screen
        name="solicitudes"
        options={{
          tabBarLabel: "Solicitudes",
          tabBarIcon: ({ focused }) => <ActivityIcon color={focused ? colors.black : colors.grey} />,
        }}
      />

      <Tabs.Screen
        name="miViaje"
        options={{
          tabBarLabel: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="add" size={30} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="historial"
        options={{
          tabBarLabel: "Historial",
          tabBarIcon: ({ focused }) => <HistoryIcon color={focused ? colors.black : colors.grey} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ focused }) => <UserIcon color={focused ? colors.black : colors.grey} />,
        }}
      />

      
      <Tabs.Screen
        name="detallesViaje"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: colors.blue,
    borderColor: colors.lightGrey100,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  tabBarIconStyle: {
    fontSize: 20,
  },
  tabBarStyle: {
    height: 85,
    paddingVertical: 10, 
  },
  tabBarLabel: {
    fontSize: 10,
  },
});
