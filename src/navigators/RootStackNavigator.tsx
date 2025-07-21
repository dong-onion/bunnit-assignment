import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

const RootStackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStackNavigator;
