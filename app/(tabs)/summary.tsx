import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function SummaryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Summaries will generate once you create an entry.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: colors.walnut,
    marginBottom: 20,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
