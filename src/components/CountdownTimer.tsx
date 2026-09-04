import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, ShieldCheck } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';

interface CountdownTimerProps {
  targetHourIST?: number; // 22 for 10 PM (Plant), 18 for 6 PM (Distributor)
  label?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetHourIST = 22,
  label = '24H Settlement Payout Cycle',
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Compute next target time today or tomorrow
      const target = new Date();
      target.setHours(targetHourIST, 0, 0, 0);

      if (now.getTime() > target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetHourIST]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Clock size={13} color={COLORS.slate500} />
          <Text style={styles.labelText}>{label.toUpperCase()}</Text>
        </View>
        <View style={styles.statusPill}>
          <ShieldCheck size={11} color={COLORS.success} />
          <Text style={styles.statusPillText}>Automated Ledger</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeVal}>{pad(timeLeft.hours)}</Text>
          <Text style={styles.timeUnit}>HOURS</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeVal}>{pad(timeLeft.minutes)}</Text>
          <Text style={styles.timeUnit}>MINS</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.timeBox}>
          <Text style={styles.timeVal}>{pad(timeLeft.seconds)}</Text>
          <Text style={styles.timeUnit}>SECS</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.slate900,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelText: {
    ...TYPOGRAPHY.xs,
    fontWeight: '800',
    color: COLORS.slate400,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.success,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  timeBox: {
    backgroundColor: COLORS.slate800,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    minWidth: 58,
  },
  timeVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  timeUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.slate400,
    marginTop: 1,
  },
  colon: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.slate500,
  },
});

export default CountdownTimer;
