import React, { useState, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Camera, Calendar, Lightbulb } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { API_URL } from './config';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { useNavigationState } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [tip, setTip] = useState({ status: "Loading...", tip: "Fetching advice..." });

  useFocusEffect(
    useCallback(() => {
      fetch(`${API_URL}/stats/weekly`)
        .then(res => res.json())
        .then(data => {
          if (data.week_logs) {
            const realPoops = data.week_logs.filter((item: any) => item.has_log);
            setWeeklyCount(realPoops.length);
          }
        })
        .catch(err => console.error("Stats Error:", err));

      fetch(`${API_URL}/tips`)
        .then(res => res.json())
        .then(data => { if (data.status) setTip(data); })
        .catch(err => console.error("Tips Error:", err));
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          <Text style={styles.headerText}>Hey{"\n"}Raymond!</Text>

          <View style={styles.topRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{weeklyCount} poops{"\n"}this week</Text>
            </View>

            <TouchableOpacity 
              style={styles.historyButton} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HistoryList')}
            >
              <Text style={styles.buttonLabel}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={24} color="#FFD700" fill="#FFD700" />
              <Text style={styles.tipsTitle}>{tip.status}</Text>
            </View>
            <Text style={styles.tipsContent}>{tip.tip}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryScreen() {
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetch(`${API_URL}/stats/weekly`)
        .then(res => res.json())
        .then(data => setLogs(data.week_logs || [])) // Safety check
        .catch(err => console.error("History Error:", err));
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.headerText, { fontSize: 32, marginBottom: 20, marginTop: 10 }]}>History</Text>
        {logs.map((item: any, index: number) => (
          <View key={index} style={styles.historyItemCard}>
            <View>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyLabel}>{item.label}</Text>
            </View>
            {item.has_log && <Text style={styles.historyTime}>{item.time}</Text>}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="HistoryList" component={HistoryScreen} options={{ headerTitle: '', headerBackTitle: 'Back' }} />
    </HomeStack.Navigator>
  );
}

const CaptureScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>We need camera access!</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      await uploadImage(photo.uri);
    } catch (error) {
      Alert.alert("Error", "Could not take photo");
    } finally {
      setLoading(false); 
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('file', { uri: uri, name: 'poop.jpg', type: 'image/jpeg' } as any);
    try {
      const response = await fetch(`${API_URL}/predict`, { method: 'POST', body: formData });
      const result = await response.json();
      Alert.alert("AI Analysis", `Result: ${result.prediction}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`);
    } catch (error) {
      Alert.alert("Upload Failed", "Check config.ts IP address");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={{ flex: 1 }} ref={cameraRef}>
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
          <TouchableOpacity onPress={takePicture} disabled={loading} style={styles.captureBtn}>
            {loading ? <ActivityIndicator size="large" color="#0095FF" /> : null}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  useFocusEffect(useCallback(() => {
    fetch(`${API_URL}/stats/calendar`).then(res => res.json()).then(data => {
      const newMarkedDates: any = {};
      Object.keys(data).forEach(date => {
        const count = data[date];
        const dots = [];
        for (let i = 0; i < Math.min(count, 3); i++) dots.push({ key: `dot-${i}`, color: 'red' });
        newMarkedDates[date] = { dots: dots };
      });
      setMarkedDates(newMarkedDates);
    }).catch(console.error);
  }, []));

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, padding: 20, marginTop: 100 }}>
        <Text style={[styles.headerText, { fontSize: 32, marginBottom: 20 }]}>Calendar</Text>
        <View style={styles.tipsContainer}>
          <RNCalendar markingType={'multi-dot'} markedDates={markedDates} theme={{ todayTextColor: '#0095FF', arrowColor: '#0095FF', dotColor: 'red', textDayFontWeight: '600', textMonthFontWeight: '800', textDayHeaderFontWeight: '600' }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const CustomTabBarButton = ({ children, onPress }: any) => {
  const currentRouteName = useNavigationState((state) => 
    state ? state.routes[state.index].name : null
  );

  if (currentRouteName === 'Capture') {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.customButtonContainer} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.customButton}>{children}</View>
    </TouchableOpacity>
  );
};

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
            if (route.name === 'HomeStack') return <FontAwesome5 name="poop" size={size} color={color} solid={false} />;
            if (route.name === 'Capture') return <Camera size={32} color="#fff" />;
            return <Calendar size={size} color={color} />;
          },
        })} 
      >
        <Tab.Screen name="HomeStack" component={HomeStackScreen} />
        <Tab.Screen name="Capture" component={CaptureScreen} options={{ tabBarButton: (props) => <CustomTabBarButton {...props} /> }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
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
  infoCard: { width: '47%', height: 160, backgroundColor: '#0095FF', borderRadius: 25, padding: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  infoText: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  historyButton: { width: '47%', height: 160, backgroundColor: '#E4F9BE', borderRadius: 25, padding: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  buttonLabel: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  tipsContainer: { width: '100%', padding: 25, borderRadius: 25, backgroundColor: '#fcfcfc', borderWidth: 2, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tipsTitle: { fontSize: 22, fontWeight: '800', marginLeft: 10, color: '#1a1a1a' },
  tipsContent: { fontSize: 16, color: '#555', lineHeight: 24, fontStyle: 'italic' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  customButtonContainer: { top: -22, justifyContent: 'center', alignItems: 'center' },
  customButton: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#0095FF', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  historyItemCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  historyDate: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  historyLabel: { fontSize: 14, color: '#888', marginTop: 4 },
  historyTime: { fontSize: 14, fontWeight: '600', color: '#0095FF' },
  captureBtn: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#ddd' }
});