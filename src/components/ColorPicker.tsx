import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { palette } from '../theme/colors';

type ColorPickerProps = {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selected, onSelect }) => (
  <View style={styles.container}>
    {colors.map((color, index) => {
      const isSelected = selected === color;
      return (
        <Pressable
          key={color}
          style={[
            styles.swatch,
            { backgroundColor: color, marginRight: (index + 1) % 6 === 0 ? 0 : 12, marginBottom: 12 },
            isSelected && styles.selected,
          ]}
          onPress={() => onSelect(color)}
        >
          {isSelected && <Feather name="check" size={16} color="#FFFFFF" />}
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  selected: {
    borderColor: palette.surface,
    transform: [{ translateY: -2 }],
  },
});

export default ColorPicker;
