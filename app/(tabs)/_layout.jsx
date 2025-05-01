import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { Tabs } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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