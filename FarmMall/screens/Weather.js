import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import * as Location from "expo-location";
const openWeatherKey = `ab70d946be8168cdeb0787e057c6b21d`;
let url = `https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=${openWeatherKey}`;

const Weather = ({ navigation }) => {
  const [forecast, setForecast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    setRefreshing(true);

    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });

    const response = await fetch(
      `${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
    );
    const data = await response.json();

    if (!response.ok) {
      Alert.alert(`Error retrieving weather data: ${data.message}`);
    } else {
      setForecast(data);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (!forecast) {
      loadForecast();
    }
  });

  if (!forecast) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const current = forecast.current.weather[0];
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              loadForecast();
            }}
            refreshing={refreshing}
          />
        }
      >
        <Text style={styles.title}>Current Weather</Text>
        <View style={styles.current}>
          <Image
            style={styles.largeIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${current.icon}@4x.png`,
            }}
          />
          <Text style={styles.currentTemp}>
            {Math.round(forecast.current.temp)}°C
          </Text>
        </View>
        <Text style={styles.currentDescription}>{current.description}</Text>

        <View>
          <Text style={styles.subtitle}>Hourly Forecast</Text>
          <FlatList
            horizontal
            data={forecast.hourly.slice(0, 24)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(hour) => {
              const weather = hour.item.weather[0];
              var dt = new Date(hour.item.dt * 1000);
              return (
                <View style={styles.hour}>
                  <Text>{dt.toLocaleTimeString().replace(/:\d+ /, " ")}</Text>
                  <Text>{Math.round(hour.item.temp)}°C</Text>
                  <Image
                    style={styles.smallIcon}
                    source={{
                      uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                    }}
                  />
                  <Text>{weather.description}</Text>
                </View>
              );
            }}
          />
        </View>

        <Text style={styles.subtitle}>Next 5 Days</Text>
        {forecast.daily.slice(0, 5).map((d) => {
          //Only want the next 5 days
          const weather = d.weather[0];
          var dt = new Date(d.dt * 1000);
          return (
            <View style={styles.day} key={d.dt}>
              <Text style={styles.dayTemp}>{Math.round(d.temp.max)}°C</Text>
              <Image
                style={styles.smallIcon}
                source={{
                  uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                }}
              />
              <View style={styles.dayDetails}>
                <Text>{dt.toLocaleDateString()}</Text>
                <Text>{weather.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};
export default Weather;
const styles = StyleSheet.create({
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 42,
    color: "#e96e50",
  },
  subtitle: {
    fontSize: 24,
    marginVertical: 12,
    marginLeft: 4,
    color: "#e96e50",
    alignSelf: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  loading: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  current: {
    height: 250,
    backgroundColor: "#DCE0DF",

    width: "90%",
    marginHorizontal: 2,
    borderRadius: 40,
    marginBottom: 20,
    marginLeft: 20,
    padding: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  currentDescription: {
    width: "100%",
    textAlign: "center",
    fontWeight: "200",
    fontSize: 24,
    marginBottom: 24,
  },
  hour: {
    backgroundColor: "#DCE0DF",
    borderRadius: 10,
    padding: 10,
    marginLeft: 5,
    marginRight: 5,
    alignItems: "center",
  
  },
  day: {
    backgroundColor: "#DCE0DF",
    borderRadius: 10,
    padding: 6,
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 7,
  },
  dayDetails: {
    justifyContent: "center",
  },
  dayTemp: {
    marginLeft: 12,
    alignSelf: "center",
    fontSize: 20,
  },
  largeIcon: {
    width: 250,
    height: 200,
  },
  smallIcon: {
    width: 100,
    height: 100,
  },
});
