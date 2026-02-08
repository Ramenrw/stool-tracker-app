import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Camera, Calendar, Lightbulb } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity style={styles.customButtonContainer} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.customButton}>{children}</View>
  </TouchableOpacity>
);

function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          <Text style={styles.headerText}>Hey{"\n"}Raymond!</Text>

          {/* Top Row: Info Card and History Button */}
          <View style={styles.topRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>4 poops{"\n"}this week</Text>
            </View>

            <TouchableOpacity style={styles.historyButton} activeOpacity={0.7}>
              <Text style={styles.buttonLabel}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Large Tips Section (Not a Button) */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={24} color="#FFD700" fill="#FFD700" />
              <Text style={styles.tipsTitle}>Tips</Text>
            </View>
            <Text style={styles.tipsContent}>
              Increase your fiber intake by adding more leafy greens and whole grains to your meals to help keep things moving!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Placeholder Screens
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
          tabBarShowLabel: false,
          tabBarStyle: { backgroundColor: '#ffffff', height: 75, paddingBottom: 10 },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <FontAwesome5 name="poop" size={size} color={color} solid={false} />;
            if (route.name === 'Capture') return <Camera size={32} color="#fff" />;
            return <Calendar size={size} color={color} />;
          },
        })} 
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Capture" component={CaptureScreen} options={{ tabBarButton: (props) => <CustomTabBarButton {...props} /> }} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  mainContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  headerText: { fontSize: 48, fontWeight: '900', marginBottom: 30, lineHeight: 52 },
  
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  
  // Blue Info Card (Standard View, not a button)
  infoCard: { 
    width: '47%', 
    height: 160, 
    backgroundColor: '#0095FF', 
    borderRadius: 25, 
    padding: 20, 
    // Changed from 'flex-end' to 'center' to vertically center the text
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 5 
  },
  infoText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '800',
    // Added to center the text horizontally within its own box
    textAlign: 'center' 
  },
  
  // Green History Button (TouchableOpacity)
  historyButton: { 
    width: '47%', height: 160, backgroundColor: '#E4F9BE', borderRadius: 25, padding: 20, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
  },
  buttonLabel: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },

  // Large Tips Box (Standard View, not a button)
  tipsContainer: {
    width: '100%', padding: 25, borderRadius: 25, backgroundColor: '#fcfcfc', borderWidth: 2, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tipsTitle: { fontSize: 22, fontWeight: '800', marginLeft: 10, color: '#1a1a1a' },
  tipsContent: { fontSize: 16, color: '#555', lineHeight: 24, fontStyle: 'italic' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  customButtonContainer: { top: -22, justifyContent: 'center', alignItems: 'center' },
  customButton: { 
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#0095FF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 
  }
});