import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TextInputProps,
  KeyboardType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React, {ReactNode, useState} from 'react';
import {EyeSlash} from 'iconsax-react-native';
import {appColors} from '../constants/appColors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {globalStyles} from '../constants/globalStyles';

interface Props {
  value: string;
  onChange: (val: string) => void;
  affix?: ReactNode;
  placeholder?: string;
  suffix?: ReactNode;
  isPassword?: boolean;
  allowClear?: boolean;
  type?: KeyboardType;
  customStyles?: StyleProp<ViewStyle>;
  onEnd?: () => void;
  editable?: boolean;
}

const InputComponent = (props: Props) => {
  const {
    value,
    onChange,
    affix,
    suffix,
    placeholder,
    isPassword,
    allowClear,
    type,
    customStyles,
    onEnd,
    editable
  } = props;

  const [isShowPass, setIsShowPass] = useState(isPassword ?? false);

  return (
    <View style={[styles.inputContainer, customStyles]}>
      {affix ?? affix}
      <TextInput
        style={[styles.input, globalStyles.text]}
        value={value}
        placeholder={placeholder ?? ''}
        onChangeText={val => onChange(val)}
        secureTextEntry={isShowPass}
        placeholderTextColor={'#747688'}
        keyboardType={type ?? 'default'}
        autoCapitalize="none"
        onEndEditing={onEnd}
        editable={editable}
      />
      {suffix ?? suffix}
      <TouchableOpacity
        onPress={
          isPassword ? () => setIsShowPass(!isShowPass) : () => onChange('')
        }>
        {isPassword ? (
          <FontAwesome
            name={isShowPass ? 'eye-slash' : 'eye'}
            size={22}
            color={appColors.gray}
          />
        ) : (
          value.length > 0 &&
          allowClear && (
            <AntDesign name="close" size={22} color={appColors.text} />
          )
        )}
      </TouchableOpacity>
    </View>
  );
};

export default InputComponent;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.gray3,
    width: '100%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: appColors.white,
    marginBottom: 19,
  },

  input: {
    padding: 0,
    margin: 0,
    flex: 1,
    paddingHorizontal: 14,
    color: appColors.text,
  },
});
