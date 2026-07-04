import React, { useRef } from 'react';
import { Animated, TextInput, TextInputProps } from 'react-native';
import { pressedShade } from '../utils/color';

const AnimatedRNTextInput = Animated.createAnimatedComponent(TextInput);
type AnimatedTextInputProps = React.ComponentProps<typeof AnimatedRNTextInput>;

interface Props extends TextInputProps {
  /** Resting background color; animates to a slightly darker/lighter shade on focus. */
  bg: string;
}

export function AnimatedTextInput({ bg, style, onFocus, onBlur, ...rest }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  const handleFocus: AnimatedTextInputProps['onFocus'] = (e) => {
    Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
    onFocus?.(e);
  };
  const handleBlur: AnimatedTextInputProps['onBlur'] = (e) => {
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const backgroundColor = anim.interpolate({ inputRange: [0, 1], outputRange: [bg, pressedShade(bg)] });

  return (
    <AnimatedRNTextInput
      {...rest}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[style, { backgroundColor }]}
    />
  );
}
