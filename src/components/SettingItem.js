import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  type = 'navigate', // navigate, switch, value
  value, 
  onPress, 
  onValueChange,
  rightText,
  disabled = false 
}) => {
  const renderRightContent = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={value ? '#fff' : '#fff'}
          />
        );
      case 'value':
        return (
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{rightText}</Text>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </View>
        );
      default:
        return <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled || type === 'switch'}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#007AFF" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {renderRightContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  disabled: {
    opacity: 0.5,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingItem;

