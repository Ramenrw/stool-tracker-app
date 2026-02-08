import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Camera, Calendar } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerText}>Hey there!</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            You've experienced 4 bowel movements this week!
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#E4F9BE' }]}>
            <Text style={styles.buttonLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#B8E994' }]}>
            <Text style={styles.buttonLabel}>Tips</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CaptureScreen = () => <View style={styles.center}><Text>AI Camera Coming Soon...</Text></View>;

const HistoryScreen = () => <View style={styles.center}><Text>Logs Coming Soon...</Text></View>;

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#8B4513',
          tabBarShowLabel: false, // This removes the names from the bar
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              // Setting solid={false} renders the unfilled outline version
              return <FontAwesome5 name="poop" size={size} color={color} solid={false} />;
            }
            if (route.name === 'Capture') return <Camera size={size} color={color} />;
            return <Calendar size={size} color={color} />;
          },
        })} 
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Capture" component={CaptureScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 25 },
  headerText: { fontSize: 40, fontWeight: '900', marginTop: 40 },
  statusCard: { 
    backgroundColor: '#0095FF', padding: 25, borderRadius: 20, marginTop: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, elevation: 5 
  },
  statusText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  bigButton: { width: '47%', height: 120, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  buttonLabel: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});