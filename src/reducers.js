import { combineReducers } from 'redux';
import orderbookReducer from './components/Orderbook/reducer';

export default combineReducers({
  orderbook: orderbookReducer
});
