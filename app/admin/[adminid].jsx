import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminPage() {
  // Get the adminid parameter from the URL
  const { adminid } = useLocalSearchParams();
  
  useEffect(() => {
    console.log("Admin page rendered with ID:", adminid);
  }, [adminid]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome Admin!</Text>
        <Text style={styles.idText}>Your User ID: {adminid}</Text>
        
          <TouchableOpacity
                  onPress={()=>{ router.push({
                    pathname: `admin/register_doctor?adminid=${adminid}`,
                    query: {
                      adminid: adminid,
                    },
                  });}}
                  style={{
                    backgroundColor: '#2384f1',
                    paddingVertical: 14,
                    paddingHorizontal: 60,
                    borderRadius: 30,
                    alignItems: 'center'
                  }} >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'outfit_bold' }}> Register </Text>
        </TouchableOpacity>
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
  },
  idText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'outfit_regular'
  }
});