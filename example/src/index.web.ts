import { AppRegistry } from 'react-native';
import App from './App';
import './index.css';

AppRegistry.registerComponent('appName', () => App);

AppRegistry.runApplication('appName', {
  rootTag: document.getElementById('root'),
});
