import { Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const VideoPlayer = () => {
  const router = useRouter();
  const { videoUrl, videoName } = useLocalSearchParams(); // Retrieve video details from params
  const [isLoading, setIsLoading] = useState(true); // State to track loading


  return (
    <View style={styles.container}>
      <View style={{ padding: 20, backgroundColor: '#2384f1', flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 20, fontWeight: '500', fontFamily: 'outfit_regular' }}>
          {videoName}
        </Text>
      </View>
      
      <ScrollView style={{
        margin:20,
        borderRadius:25,
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
        backgroundColor: '#b7d7f7',
        padding: 20,
      }}>
        {isLoading && (
        <View style={{  justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'outfit_regular', fontSize: 24, marginBottom: 10 }}>Loading video...</Text>
          <ActivityIndicator size="large" color="#2384f1" style={styles.loadingIndicator}
           />
        </View>
        )}
      <Video
        source={{ uri: videoUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay
        useNativeControls
        style={styles.video}
        isLooping={false}
        onLoadStart={() => setIsLoading(true)} // Show loading when video starts loading
        onLoad={() => setIsLoading(false)} // Hide loading when video is loaded
      />
      </ScrollView>

      
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});