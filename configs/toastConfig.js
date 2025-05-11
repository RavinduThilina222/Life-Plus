// toastConfig.js
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      text1Style={{
        fontSize: 16,
        fontFamily: 'outfit_bold',
        color: 'black',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'outfit_regular',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 16,
        fontFamily: 'outfit_bold',
        color: 'red',
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: 'outfit_regular',
      }}
    />
  ),
};
