import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useSummaryData } from '@/hooks/useSummaryData';
import { formatAllRoles } from '@/lib/formatResume';
import { RoleBlock } from '@/components/summary/RoleBlock';
import { ExportDropdown } from '@/components/summary/ExportDropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useRouter } from 'expo-router';

export default function SummaryScreen() {
  const { roleBlocks, isLoading, isEmpty } = useSummaryData();
  const router = useRouter();
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopied = useCallback(() => {
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  }, []);

  const getAllText = useCallback(() => {
    return formatAllRoles(roleBlocks);
  }, [roleBlocks]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Summary</Text>
          <Text style={styles.subtitle}>Your career story, ready to use.</Text>
        </View>
        {!isEmpty && (
          <ExportDropdown getAllText={getAllText} onCopied={handleCopied} />
        )}
      </View>

      {/* Copied toast */}
      {showCopiedToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Copied</Text>
        </View>
      )}

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          message="Summaries will generate once you create an entry."
          ctaLabel="Add entry"
          onCtaPress={() => router.push('/entry/new')}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {roleBlocks.map((role) => (
            <RoleBlock key={role.companyId} role={role} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    color: colors.walnut,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.umber,
    marginTop: 4,
  },
  toast: {
    position: 'absolute',
    top: 58,
    alignSelf: 'center',
    backgroundColor: colors.walnut,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    zIndex: 30,
    ...layout.shadow.sm,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
