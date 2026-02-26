import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { Entry, ProfessionalAchievement } from '@/types/database';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useUserStore((s) => s.authUser?.id);

  const { data: entry, isLoading: entryLoading } = useQuery<Entry>({
    queryKey: ['entry', id],
    enabled: !!id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('entry_id', id!)
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data as Entry;
    },
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<ProfessionalAchievement[]>({
    queryKey: ['achievements', 'entry', id],
    enabled: !!id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_achievements')
        .select('*')
        .eq('entry_id', id!)
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('display_order');
      if (error) throw error;
      return (data ?? []) as ProfessionalAchievement[];
    },
  });

  if (entryLoading || achievementsLoading) {
    return <LoadingIndicator fullScreen />;
  }

  if (!entry) return null;

  const dateStr = new Date(entry.entry_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <FontAwesome name="arrow-left" size={18} color={colors.walnut} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Entry</Text>
        <View style={{ width: 18 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{dateStr}</Text>

        {entry.ai_generated_summary && (
          <View style={styles.summarySection}>
            <AISummaryCard text={entry.ai_generated_summary} />
          </View>
        )}

        <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
        {(achievements ?? []).map((a) => (
          <AchievementCard key={a.achievement_id} achievement={a} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.walnut,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  date: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.walnut,
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
});
