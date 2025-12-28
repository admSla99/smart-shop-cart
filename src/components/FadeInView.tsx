import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewProps, ViewStyle } from 'react-native';

type FadeInViewProps = {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
} & Animated.AnimatedProps<ViewProps>;

export const FadeInView: React.FC<FadeInViewProps> = ({
  delay = 0,
  style,
  children,
  ...rest
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        damping: 16,
        stiffness: 120,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      {...rest}
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
