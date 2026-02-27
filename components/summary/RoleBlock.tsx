import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { parseLocalDate } from '@/lib/dates';
import { Card } from '@/components/ui/Card';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { CopyButton } from './CopyButton';
import { formatRoleText, formatProjectText, formatStandaloneText } from '@/lib/formatResume';
import type { RoleBlock as RoleBlockType } from '@/hooks/useSummaryData';

interface RoleBlockProps {
  role: RoleBlockType;
}

function formatDateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const fmt = (d: string) => {
    const date = parseLocalDate(d);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const startStr = start ? fmt(start) : '';
  const endStr = isCurrent ? 'Present' : end ? fmt(end) : '';
  if (!startStr && !endStr) return '';
  return `${startStr} — ${endStr}`;
}

export function RoleBlock({ role }: RoleBlockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const dateRange = formatDateRange(role.startDate, role.endDate, role.isCurrent);
  const hasProjects = role.projects.length > 0;
  const hasStandalone = role.standaloneAchievements.length > 0;

  return (
    <Card accentPosition="top" accentColor={colors.moss} accentOpacity={0.35} style={styles.card}>
      {/* Header */}
      <View style={[styles.header, !collapsed && styles.headerBorder]}>
        <View style={styles.headerLeft}>
          <View style={styles.companyRow}>
            <Text style={styles.companyName}>{role.companyName}</Text>
            {role.isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          {role.roleTitle && (
            <Text style={styles.roleTitle}>{role.roleTitle}</Text>
          )}
          {dateRange !== '' && (
            <Text style={styles.dateRange}>{dateRange}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <CopyButton getText={() => formatRoleText(role)} />
          <TouchableOpacity
            onPress={() => setCollapsed(!collapsed)}
            style={styles.collapseButton}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              size={11}
              color={colors.umber}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {!collapsed && (
        <View style={styles.body}>
          {/* Project sections */}
          {role.projects.map((project) => (
            <View key={project.projectId} style={styles.projectSection}>
              <View style={styles.projectHeader}>
                <View style={styles.projectNameRow}>
                  <FontAwesome
                    name="folder"
                    size={13}
                    color={project.isHighlight ? colors.amber : colors.moss}
                  />
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.isHighlight && (
                    <FontAwesome name="star" size={11} color={colors.amber} />
                  )}
                </View>
                <CopyButton getText={() => formatProjectText(project)} />
              </View>
              {project.summary && (
                <View style={styles.summaryWrapper}>
                  <AISummaryCard text={project.summary} label="Project summary" />
                </View>
              )}
              <View style={styles.bulletList}>
                {project.achievements.map((ach) => (
                  <View key={ach.achievementId} style={styles.bulletRow}>
                    {ach.isHighlight ? (
                      <FontAwesome
                        name="star"
                        size={9}
                        color={colors.amber}
                        style={styles.bulletIcon}
                      />
                    ) : (
                      <View style={styles.dot} />
                    )}
                    <Text style={styles.bulletText}>{ach.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Divider between projects and standalone */}
          {hasProjects && hasStandalone && <View style={styles.divider} />}

          {/* Standalone achievements */}
          {hasStandalone && (
            <View>
              <View style={styles.standaloneHeader}>
                <SectionLabel style={{ marginBottom: 0 }}>Other achievements</SectionLabel>
                <CopyButton
                  getText={() => formatStandaloneText(role.standaloneAchievements)}
                />
              </View>
              <View style={styles.bulletList}>
                {role.standaloneAchievements.map((ach) => (
                  <View key={ach.achievementId} style={styles.bulletRow}>
                    {ach.isHighlight ? (
                      <FontAwesome
                        name="star"
                        size={9}
                        color={colors.amber}
                        style={styles.bulletIcon}
                      />
                    ) : (
                      <View style={styles.dot} />
                    )}
                    <Text style={styles.bulletText}>{ach.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerLeft: {
    flex: 1,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  companyName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.walnut,
  },
  currentBadge: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  currentBadgeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9.5,
    color: colors.moss,
  },
  roleTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.walnut,
    opacity: 0.8,
    marginBottom: 2,
  },
  dateRange: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapseButton: {
    padding: 4,
  },
  body: {
    padding: 14,
    paddingHorizontal: 16,
  },
  projectSection: {
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  projectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  projectName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.walnut,
  },
  summaryWrapper: {
    marginBottom: 8,
  },
  bulletList: {
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.umber,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletIcon: {
    marginTop: 4,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    lineHeight: 12.5 * 1.6,
    color: colors.walnut,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
    marginBottom: 12,
  },
  standaloneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
});
