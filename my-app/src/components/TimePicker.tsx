import React, { useState } from 'react'
import {  View, Text, ScrollView, StyleSheet, Dimensions} from 'react-native'

const ITEM_HEIGHT = 60;

interface TimePickerProps {
  selectedHour: number;
  selectedMinute: number;
  onTimeChange: (hour: number, minute: number) => void;
}

export default function TimePicker({ selectedHour, selectedMinute, onTimeChange }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const handleScrollHour = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (hours[index]) {
      onTimeChange(Number(hours[index]), selectedMinute);
    }
  };

  const handleScrollMinute = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (minutes[index]) {
      onTimeChange(selectedHour, Number(minutes[index]));
    }
  };

    return (
        <View style={styles.pickerContainer}>
      <View style={styles.highlightBox} />

      {/* Horas */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollHour}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        contentOffset={{ x: 0, y: selectedHour * ITEM_HEIGHT }}
      >
        {hours.map((hour, index) => {
          const isSelected = Number(hour) === selectedHour;
          return (
            <View key={index} style={styles.itemContainer}>
              <Text style={[styles.text, isSelected && styles.selectedText]}>{hour}</Text>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.separator}>:</Text>

      {/* Minutos */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollMinute}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        contentOffset={{ x: 0, y: selectedHour * ITEM_HEIGHT }}
      >
        {minutes.map((minute, index) => {
          const isSelected = Number(minute) === selectedMinute;
          return (
            <View key={index} style={styles.itemContainer}>
              <Text style={[styles.text, isSelected && styles.selectedText]}>{minute}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    height: ITEM_HEIGHT * 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 220,
  },
  highlightBox: {
    position: 'absolute',
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: '#FF6B81',
    borderRadius: 16,
    top: ITEM_HEIGHT,
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  text: {
    fontSize: 36,
    color: '#008577',
    fontWeight: '300',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  separator: {
    fontSize: 36,
    color: '#008577',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
});