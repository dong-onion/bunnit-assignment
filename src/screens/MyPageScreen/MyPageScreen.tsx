import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MyPageScreenProps } from '../../types/navigation';

const MyPageScreen = ({ navigation }: MyPageScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>My Page</Text>
    </View>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
