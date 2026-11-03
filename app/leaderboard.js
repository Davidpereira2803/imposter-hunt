import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Screen from "../src/components/ui/Screen";
import Button from "../src/components/ui/Button";
import Card from "../src/components/ui/Card";
import Title from "../src/components/ui/Title";
import { Icon } from "../src/constants/icons";
import { palette, radii, space, type } from "../src/constants/theme";
import { useTranslation } from "../src/lib/useTranslation";
import { sortPlayerScores, useSessionStore } from "../src/store/sessionStore";

const dateLabel = (timestamp, locale) => {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
};

function RankingList({ scores, t, emptyLabel }) {
  const ranking = sortPlayerScores(scores);
  if (!ranking.length) return <Text style={styles.emptyText}>{emptyLabel}</Text>;

  return (
    <View style={styles.rankingList}>
      {ranking.map((player, index) => (
        <Card key={`${player.name}-${index}`} style={styles.playerRow}>
          <View style={[styles.rankBadge, index === 0 && styles.topRankBadge]}>
            <Text style={[styles.rankText, index === 0 && styles.topRankText]}>{index + 1}</Text>
          </View>
          <View style={styles.playerCopy}>
            <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
            <Text style={styles.playerMeta}>
              {player.wins} {t("leaderboard.wins", "wins")} · {player.matchesPlayed} {t("leaderboard.matches", "matches")}
            </Text>
          </View>
          <View style={styles.scoreValue}>
            <Text style={styles.points}>{player.points}</Text>
            <Text style={styles.pointsLabel}>{t("leaderboard.points", "points")}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

function ScoringRules({ t }) {
  return (
    <Card style={styles.rulesCard}>
      <Text style={styles.rulesTitle}>{t("leaderboard.scoringRules", "How points work")}</Text>
      <Text style={styles.rulesText}>{t("leaderboard.participation", "+1 for every completed match")}</Text>
      <Text style={styles.rulesText}>{t("leaderboard.civilianBonus", "+2 bonus for a civilian or sheriff win")}</Text>
      <Text style={styles.rulesText}>{t("leaderboard.imposterBonus", "+3 bonus for an imposter win")}</Text>
      <Text style={styles.rulesText}>{t("leaderboard.jesterBonus", "+4 bonus for a Jester solo win")}</Text>
    </Card>
  );
}

export default function Leaderboard() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const activeSession = useSessionStore((state) => state.activeSession);
  const sessionHistory = useSessionStore((state) => state.sessionHistory);
  const allTimeScores = useSessionStore((state) => state.allTimeScores);
  const startSession = useSessionStore((state) => state.startSession);
  const finishSession = useSessionStore((state) => state.finishSession);

  const handleStartSession = () => {
    if (startSession()) router.replace("/setup");
  };

  const handleFinishSession = () => {
    Alert.alert(
      t("leaderboard.finishTitle", "Finish this session?"),
      t("leaderboard.finishMessage", "This saves the session ranking and returns you to the leaderboard."),
      [
        { text: t("leaderboard.cancel", "Keep playing"), style: "cancel" },
        {
          text: t("leaderboard.finishNow", "Finish session"),
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            finishSession(activeSession?.id);
          },
        },
      ]
    );
  };

  const latestFinished = !activeSession ? sessionHistory[0] : null;
  const mainScores = activeSession?.scores || latestFinished?.scores || {};

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t("common.back", "Back")}>
            <Icon name="arrow-left" size={22} color={palette.text} />
          </TouchableOpacity>
          <Title style={styles.title}>{t("leaderboard.title", "Player Rankings")}</Title>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeSession ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.eyebrow}>{t("leaderboard.active", "SESSION IN PROGRESS")}</Text>
                  <Text style={styles.sectionTitle}>{dateLabel(activeSession.startedAt, locale)}</Text>
                </View>
                <View style={styles.matchBadge}>
                  <Icon name="cards-playing-outline" size={16} color={palette.primary} />
                  <Text style={styles.matchCount}>{activeSession.matches.length}</Text>
                </View>
              </View>
              <ScoringRules t={t} />
              <RankingList scores={activeSession.scores} t={t} emptyLabel={t("leaderboard.empty", "Finish a match to see the session rankings.")} />
              <View style={styles.actions}>
                <Button title={t("leaderboard.continueSession", "Continue session")} onPress={() => router.replace("/setup")} size="lg" />
                <Button title={t("leaderboard.finish", "Finish session")} onPress={handleFinishSession} variant="ghost" size="md" />
              </View>
            </>
          ) : (
            <>
              {latestFinished ? (
                <View style={styles.section}>
                  <Text style={styles.eyebrow}>{t("leaderboard.latestSession", "LATEST SESSION")}</Text>
                  <Text style={styles.sectionTitle}>{dateLabel(latestFinished.startedAt, locale)}</Text>
                  <Text style={styles.summaryText}>
                    {latestFinished.matches.length} {t("leaderboard.matches", "matches")}
                  </Text>
                  <RankingList scores={latestFinished.scores} t={t} emptyLabel={t("leaderboard.empty", "No completed matches in this session.")} />
                </View>
              ) : null}
              <Button title={t("leaderboard.startSession", "Start scoring session")} onPress={handleStartSession} size="lg" icon={<Icon name="trophy-outline" size={20} color={palette.text} />} />
              <View style={styles.section}>
                <Text style={styles.eyebrow}>{t("leaderboard.allTime", "ALL-TIME RANKING")}</Text>
                <ScoringRules t={t} />
                <RankingList scores={allTimeScores} t={t} emptyLabel={t("leaderboard.noPlayers", "Scores appear here after your first completed session match.")} />
              </View>
              {sessionHistory.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.eyebrow}>{t("leaderboard.recentSessions", "RECENT SESSIONS")}</Text>
                  {sessionHistory.slice(0, 5).map((session) => (
                    <Card key={session.id} style={styles.historyCard}>
                      <View style={styles.historyHeading}>
                        <Text style={styles.playerName}>{dateLabel(session.startedAt, locale)}</Text>
                        <Text style={styles.playerMeta}>{session.matches.length} {t("leaderboard.matches", "matches")}</Text>
                      </View>
                      <Text style={styles.historyWinner} numberOfLines={2}>
                        {sortPlayerScores(session.scores).slice(0, 3).map((player) => player.name).join(" · ")}
                      </Text>
                    </Card>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: space.md, paddingHorizontal: space.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center" },
  content: { paddingBottom: space.xl * 2, gap: space.lg },
  section: { gap: space.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: space.sm },
  eyebrow: { color: palette.primary, fontSize: type.small, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  sectionTitle: { color: palette.text, fontSize: type.h3, fontWeight: "800" },
  summaryText: { color: palette.textDim, fontSize: type.small },
  matchBadge: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: palette.primaryDim, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 8 },
  matchCount: { color: palette.text, fontSize: type.body, fontWeight: "800" },
  rankingList: { gap: space.sm },
  playerRow: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md },
  rankBadge: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: palette.backgroundDim },
  topRankBadge: { backgroundColor: palette.primaryDim, borderColor: palette.primary, borderWidth: 1 },
  rankText: { color: palette.textDim, fontWeight: "900" },
  topRankText: { color: palette.text },
  playerCopy: { flex: 1 },
  playerName: { color: palette.text, fontWeight: "800", fontSize: type.body },
  playerMeta: { color: palette.textDim, fontSize: type.small, marginTop: 3 },
  scoreValue: { alignItems: "flex-end" },
  points: { color: palette.primary, fontWeight: "900", fontSize: type.h3 },
  pointsLabel: { color: palette.textDim, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  emptyText: { color: palette.textDim, fontSize: type.body, textAlign: "center", paddingVertical: space.lg, lineHeight: 22 },
  actions: { gap: space.sm },
  historyCard: { padding: space.md },
  historyHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyWinner: { color: palette.textDim, fontSize: type.small, marginTop: 8 },
  rulesCard: { padding: space.md, gap: 6 },
  rulesTitle: { color: palette.text, fontSize: type.body, fontWeight: "800", marginBottom: 2 },
  rulesText: { color: palette.textDim, fontSize: type.small, lineHeight: 19 },
});
