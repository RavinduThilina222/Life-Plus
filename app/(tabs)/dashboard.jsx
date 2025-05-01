import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Dashboard</Text>
        {/* Dashboard content */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: '#069ed3'
  },
  headerText: {
    color: 'black',
    fontSize: 24,
    fontWeight: '500'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003066',
    marginBottom: 20,
    fontFamily: 'outfit_bold'
  }
});