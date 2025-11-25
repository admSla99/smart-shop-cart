import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
        />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#F9FAFB',
  },
});

export default ColorPicker;
