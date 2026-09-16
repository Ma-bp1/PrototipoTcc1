import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function NumberStepper({ value, onChange, min = 0 }: NumberStepperProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity style={styles.arrowButton} onPress={handleDecrement}>
        <Feather name="chevron-left" size={24} color="#198982" />
      </TouchableOpacity>

      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value}</Text>
      </View>

      <TouchableOpacity style={styles.arrowButton} onPress={handleIncrement}>
        <Feather name="chevron-right" size={24} color="#198982" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  arrowButton: {
    padding: 4,
  },
  valueBox: {
    backgroundColor: '#DEE6E6',
    borderColor: '#198982',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  valueText: {
    color: '#198982',
    fontSize: 18,
    fontWeight: 'bold',
  },
});