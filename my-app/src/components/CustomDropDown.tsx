import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Option {
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  label?: string;
  options: Option[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function CustomDropdown({ 
    options, 
    selectedValue, 
    onSelect,
    disabled = false,
    disabledMessage = 'Você não pode alterar o slot no modo edição.', 
  }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label || 'Selecione';

    const handlePress = () => {
      if (disabled) {
        Alert.alert('Atenção', disabledMessage);
        return;
      }
      setIsOpen(!isOpen);
    };

    return (
      <View style={[styles.container, isOpen && styles.activeContainer]}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={[styles.buttonText, disabled && styles.textDisabled]}>
          {selectedLabel}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? '#9E9E9E' : '#198982'}
        />
      </TouchableOpacity>

      {isOpen && !disabled && (
        <View style={styles.dropdownList}>
          {options.map((item) => (
            <TouchableOpacity
              key={String(item.value)}
              style={styles.optionItem}
              onPress={() => {
                onSelect(item.value);
                setIsOpen(false);
              }}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    position: 'relative',
    zIndex: 1, 
  },
  activeContainer: {
    zIndex: 1000, 
    elevation: 1000,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DEE6E6',
    borderColor: '#198982',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#198982',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#DEE6E6',
    borderColor: '#198982',
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5D5',
  },
  optionText: {
    color: '#198982',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#B0B0B0',
  },
  textDisabled: {
    color: '#9E9E9E',
  },
});