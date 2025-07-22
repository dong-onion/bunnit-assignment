import RootStackNavigator from './navigators/RootStackNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView>
      <RootStackNavigator />
    </GestureHandlerRootView>
  );
}
