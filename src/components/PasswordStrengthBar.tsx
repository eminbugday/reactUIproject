import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  checks: { text: string; passed: boolean }[];
}

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { text: 'En az 8 karakter', passed: password.length >= 8 },
    { text: 'Küçük harf (a-z)', passed: /[a-z]/.test(password) },
    { text: 'Büyük harf (A-Z)', passed: /[A-Z]/.test(password) },
    { text: 'Rakam (0-9)', passed: /\d/.test(password) },
  ];

  const score = checks.filter((c) => c.passed).length;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Çok Zayıf', color: '#ff3b30' },
    1: { label: 'Zayıf', color: '#ff6b2b' },
    2: { label: 'Orta', color: '#ff9500' },
    3: { label: 'İyi', color: '#34c759' },
    4: { label: 'Güçlü', color: '#00c853' },
  };

  return { score, checks, ...map[score] };
}

interface Props {
  password: string;
}

export default function PasswordStrengthBar({ password }: Props) {
  if (!password) return null;

  const { score, label, color, checks } = getPasswordStrength(password);
  const pct = (score / 4) * 100;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>

      {/* Score label */}
      <View style={styles.labelRow}>
        <Text style={styles.labelLeft}>Şifre gücü</Text>
        <Text style={[styles.labelRight, { color }]}>{label}</Text>
      </View>

      {/* Requirement checks */}
      <View style={styles.checks}>
        {checks.map((c) => (
          <View key={c.text} style={styles.checkRow}>
            <Text style={[styles.checkIcon, c.passed ? styles.passed : styles.failed]}>
              {c.passed ? '✓' : '✗'}
            </Text>
            <Text style={[styles.checkText, c.passed ? styles.passedText : styles.failedText]}>
              {c.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  barTrack: {
    height: 6,
    backgroundColor: '#e5e5e7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    // transition not supported in RN but animates smoothly on web
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelLeft: { fontSize: 12, color: '#86868b' },
  labelRight: { fontSize: 12, fontWeight: '700' },
  checks: { gap: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkIcon: { fontSize: 12, fontWeight: '700', width: 14, textAlign: 'center' },
  checkText: { fontSize: 12 },
  passed: { color: '#34c759' },
  failed: { color: '#d2d2d7' },
  passedText: { color: '#1d1d1f' },
  failedText: { color: '#86868b' },
});
