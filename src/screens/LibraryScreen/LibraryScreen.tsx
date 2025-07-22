import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LibraryScreenProps } from '../../types/navigation';

const LibraryScreen = ({ navigation }: LibraryScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>Library</Text>
    </View>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
