import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
 
  return (
    <Tabs screenOptions={{headerShown:false}}>
        <Tabs.Screen name='dashboard'
         options={{
           tabBarLabel:"",
           tabBarIcon:({color})=> <MaterialIcons name="space-dashboard" size={24} color="black" />
         }}/>
    </Tabs>
  )
}