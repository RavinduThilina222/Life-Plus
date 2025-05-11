import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { db } from '../../configs/firebaseConfig';

// Set this to your backend API URL
const API_BASE_URL = 'http://192.168.63.173:5000';

const bookAppointment = () => {
  const { patientid } = useLocalSearchParams();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [DateAndTime, setDateAndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // PayPal related states
  const [approvalUrl, setApprovalUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDocId && doctors.length > 0) {
      const doctor = doctors.find(doc => doc.id === selectedDocId);
      setSelectedDoctor(doctor);
    }
  }, [selectedDocId, doctors]);

  const fetchDoctors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Doctor_Table'));
      const doctors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctors);
      console.log('Doctors:', doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to fetch doctors. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!selectedDocId || !selectedHospital) {
      Alert.alert('Missing Information', 'Please select a doctor and a hospital/clinic.');
      return;
    }

    // Find selected doctor to get price info (assuming doctor data has a price field)
    const doctor = doctors.find(doc => doc.id === selectedDocId);
    const appointmentPrice = doctor?.price || 10.00; // Default to $10 if price not found
    
    // Save appointment details for use after payment
    const appointmentData = {
      patient_id: patientid,
      doctor_id: selectedDocId,
      doctor_name: doctor?.name || 'Unknown Doctor',
      hospital: selectedHospital,
      date_time: DateAndTime.toISOString(),
      price: appointmentPrice,
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };
    
    setAppointmentDetails(appointmentData);

    // Start payment process
    setLoading(true);
    try {
      console.log('Starting payment process for $' + appointmentPrice);
      
      // You can pass the price and other details to your backend
      const res = await axios.post(`${API_BASE_URL}/create-order`, {
        amount: appointmentPrice.toString(),
        currency: 'USD',
        description: `Appointment with ${doctor?.name || 'Doctor'} at ${selectedHospital}`,
        appointmentId: Date.now().toString() // Use a temporary ID for reference
      });
      
      console.log('PayPal order created:', res.data);
      
      if (res.data && res.data.approve) {
        setApprovalUrl(res.data.approve);
      } else {
        throw new Error('Invalid response from payment server');
      }
    } catch (error) {
      console.error('PayPal error:', error.response?.data || error.message);
      Alert.alert(
        'Payment Error', 
        'There was a problem connecting to the payment system. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAppointment = async () => {
    try {
      console.log('Saving appointment to database:', appointmentDetails);
      
      // Update payment status
      const appointmentWithPayment = {
        ...appointmentDetails,
        payment_status: 'completed',
        payment_date: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'Appointment_Table'), appointmentWithPayment);
      console.log('Appointment saved with ID:', docRef.id);
      
      Alert.alert(
        'Success', 
        'Your appointment has been booked successfully!',
        [{ text: 'OK', onPress: () => router.push(`/patient/${patientid}`) }]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert(
        'Error', 
        'Failed to save your appointment. Please contact support.',
        [{ text: 'OK', onPress: () => router.push(`/patient/${patientid}`) }]
      );
    }
  };

  const hospitals = ['City Hospital', 'Green Clinic', 'Sunrise Medical Centre', 'Carewell Hospital'];

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDateAndTime(prev => new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        prev.getHours(),
        prev.getMinutes()
      ));
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setDateAndTime(prev => new Date(
        prev.getFullYear(),
        prev.getMonth(),
        prev.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      ));
    }
    setShowTimePicker(false);
  };

  // Render WebView when we have approval URL
  if (approvalUrl) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: approvalUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2384f1" />
              <Text style={{ marginTop: 10 }}>Loading PayPal...</Text>
            </View>
          )}
          onNavigationStateChange={(navState) => {
            console.log("WebView navigating to:", navState.url);
            
            // Handle custom app deep links or return URLs
            if (navState.url.includes('yourapp://payment-success')) {
              console.log('Deep link success detected');
              setApprovalUrl(null);
              saveAppointment();
              return;
            }
            
            if (navState.url.includes('yourapp://payment-cancelled') || 
                navState.url.includes('yourapp://payment-error')) {
              console.log('Deep link cancellation detected');
              setApprovalUrl(null);
              Alert.alert('Payment Cancelled', 'Your payment was cancelled or unsuccessful.');
              return;
            }
            
            // Handle payment completion or cancellation scenarios
            
            // Payment canceled - Common cancel URL patterns
            if (navState.url.includes('cancel') || 
                navState.url.includes('paypal.com/checkoutnow/error')) {
              console.log("Payment canceled");
              setApprovalUrl(null);
              Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
              return;
            }
            
            // Payment success - Look for multiple possible success patterns
            if (navState.url.includes('success') || 
                navState.url.includes('capture-order') ||
                navState.url.includes('approved') ||
                navState.url.includes('completed') ||
                navState.url.includes('paypal.com/webapps/hermes/token/payment-success')) {
              console.log("Payment success detected");
              // Add slight delay to ensure all PayPal processes complete
              setTimeout(() => {
                setApprovalUrl(null);
                saveAppointment();
              }, 1000);
              return;
            }
            
            // Debug any redirect loops by logging URL patterns
            if (navState.url.includes('continue') || navState.url.includes('review')) {
              console.log("On review/continue page:", navState.url);
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            Alert.alert('Error', 'Error loading PayPal. Please try again later.');
            setApprovalUrl(null);
          }}
        />
        <TouchableOpacity 
          style={{
            position: 'absolute', 
            top: 40, 
            left: 20, 
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: 10,
            borderRadius: 20
          }}
          onPress={() => {
            setApprovalUrl(null);
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, backgroundColor: '#2384f1', flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ color: 'black', fontSize: 20, fontWeight: '500', fontFamily: 'outfit_regular' }}>
          Make Your Appointment Here
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.label}>Select your Therapist</Text>
        <Picker
          selectedValue={selectedDocId}
          onValueChange={(itemValue) => setSelectedDocId(itemValue)}
          style={styles.picker}
          dropdownIconColor="#003066"
        >
          <Picker.Item label="-- Select Doctor --" value="" color="#999" />
          {doctors.length > 0 ? doctors.map((doctor) => (
            <Picker.Item
              key={doctor.id}
              label={doctor.name || "Unnamed Doctor"}
              value={doctor.id}
              color="#000"
            />
          )) : (
            <Picker.Item label="No doctors available" value="" color="#999" />
          )}
        </Picker>

        <Text style={styles.label}>Select the Hospital / Clinic</Text>
        <Picker
          selectedValue={selectedHospital}
          onValueChange={(itemValue) => setSelectedHospital(itemValue)}
          style={styles.picker}
          dropdownIconColor="#003066"
        >
          <Picker.Item label="-- Select Hospital/Clinic --" value="" color="#999" />
          {hospitals.map((hospital, index) => (
            <Picker.Item
              key={index}
              label={hospital}
              value={hospital}
              color="#000"
            />
          ))}
        </Picker>

        <Text style={styles.label}>Select the Date and Time</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.buttonText}>
            {`Select Date: ${DateAndTime.toLocaleDateString()}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.buttonText}>
            {`Select Time: ${DateAndTime.toLocaleTimeString()}`}
          </Text>
        </TouchableOpacity>

        {/* Date and Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={DateAndTime}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()} // Don't allow booking in the past
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={DateAndTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
        
        {/* Show appointment price if a doctor is selected */}
        {selectedDoctor && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Appointment Price:</Text>
            <Text style={styles.priceValue}>${selectedDoctor?.price || '10.00'}</Text>
          </View>
        )}
        
        {/* Book Appointment Button with Payment */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2384f1" />
            <Text style={styles.loadingText}>Setting up payment...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.payButton} 
            onPress={handlePayment}
          >
            <Ionicons name="card-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Pay and Book Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default bookAppointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b7d7f7',
  },
  label: {
    fontFamily: 'outfit_regular',
    margin: 20,
    fontSize: 20,
  },
  picker: {
    height: 60,
    color: '#000',
    margin: 20,
    marginTop: 0,
    fontFamily: 'outfit_regular',
    borderRadius: 15,
    borderWidth: 2,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2384f1',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    margin: 15,
  },
  payButton: {
    backgroundColor: '#2384f1',
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit_bold',
  },
  loadingContainer: {
    alignItems: 'center',
    margin: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'outfit_regular',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  priceLabel: {
    fontSize: 16,
    fontFamily: 'outfit_regular',
    marginRight: 10,
  },
  priceValue: {
    fontSize: 18,
    fontFamily: 'outfit_bold',
    color: '#2384f1',
  }
});