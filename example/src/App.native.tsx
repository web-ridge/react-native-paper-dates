import { AppRegistry } from 'react-native';
import App from './AppInner';
import { name as appName } from '../app.json';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
Icon.loadFont();
AppRegistry.registerComponent(appName, () => App);
