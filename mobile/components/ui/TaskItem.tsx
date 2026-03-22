import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';

export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  location: string;
  duration: string;
  priority: Priority;
  notes?: string;
}

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function TaskItem({ task, onEdit, onDelete }: TaskItemProps) {
  const theme = useTheme();

  const priorityColor = {
    High: theme.priorityHigh,
    Medium: theme.priorityMedium,
    Low: theme.priorityLow,
  }[task.priority];

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {task.title}
        </Text>
        <Badge label={task.priority} color={priorityColor} />
      </View>

      <Text style={[styles.meta, { color: theme.subtext }]}>
        {task.location}
      </Text>
      <Text style={[styles.meta, { color: theme.subtext }]}>
        {task.duration}
      </Text>
      {task.notes ? (
        <Text style={[styles.notes, { color: theme.text }]}>{task.notes}</Text>
      ) : null}

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Button
              label="Edit"
              variant="secondary"
              size="sm"
              onPress={() => onEdit(task)}
            />
          )}
          {onDelete && (
            <Button
              label="Delete"
              variant="ghost"
              size="sm"
              onPress={() => onDelete(task.id)}
              textStyle={{ color: theme.danger }}
            />
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h4,
    flex: 1,
  },
  meta: {
    ...Typography.bodySm,
    marginBottom: 2,
  },
  notes: {
    ...Typography.bodySm,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm + 2,
  },
});
