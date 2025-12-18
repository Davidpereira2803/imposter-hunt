import React from "react";
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from "react-native";
import { palette, space, type } from "../constants/theme";
import { Icon } from "../constants/icons";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useTranslation } from "../lib/useTranslation";

export default function AITutorialModal({ visible, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="magic-staff" size={28} color={palette.primary} />
            <Text style={styles.headerTitle}>
              {t("aiTutorial.title", "How AI Generation Works")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={palette.textDim} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* What is it */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="information" size={20} color={palette.primary} />
                <Text style={styles.sectionTitle}>
                  {t("aiTutorial.whatIsIt", "What is it?")}
                </Text>
              </View>
              <Text style={styles.text}>
                {t(
                  "aiTutorial.whatIsItText",
                  "AI Topic Builder uses artificial intelligence to generate custom word lists based on your description. Perfect for creating unique game topics!"
                )}
              </Text>
            </Card>

            {/* How to use */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="lightbulb" size={20} color={palette.primary} />
                <Text style={styles.sectionTitle}>
                  {t("aiTutorial.howToUse", "How to Use")}
                </Text>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {t("aiTutorial.step1Title", "Describe Your Topic")}
                  </Text>
                  <Text style={styles.stepText}>
                    {t(
                      "aiTutorial.step1Text",
                      "Enter a clear description of what you want. Be specific!"
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {t("aiTutorial.step2Title", "Choose Settings")}
                  </Text>
                  <Text style={styles.stepText}>
                    {t(
                      "aiTutorial.step2Text",
                      "Select how many words you want and the difficulty level."
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {t("aiTutorial.step3Title", "Generate & Play")}
                  </Text>
                  <Text style={styles.stepText}>
                    {t(
                      "aiTutorial.step3Text",
                      "Hit generate and your custom topic list will be ready to use immediately!"
                    )}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Examples */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="sparkles" size={20} color={palette.primary} />
                <Text style={styles.sectionTitle}>
                  {t("aiTutorial.examples", "Good Examples")}
                </Text>
              </View>
              
              <View style={styles.exampleList}>
                <View style={styles.example}>
                  <Icon name="check" size={16} color={palette.success} />
                  <Text style={styles.exampleText}>
                    {t("aiTutorial.example1", "Clash Royale cards")}
                  </Text>
                </View>
                <View style={styles.example}>
                  <Icon name="check" size={16} color={palette.success} />
                  <Text style={styles.exampleText}>
                    {t("aiTutorial.example2", "Harry Potter spells")}
                  </Text>
                </View>
                <View style={styles.example}>
                  <Icon name="check" size={16} color={palette.success} />
                  <Text style={styles.exampleText}>
                    {t("aiTutorial.example3", "Marvel superheroes")}
                  </Text>
                </View>
                <View style={styles.example}>
                  <Icon name="check" size={16} color={palette.success} />
                  <Text style={styles.exampleText}>
                    {t("aiTutorial.example4", "Programming languages")}
                  </Text>
                </View>
                <View style={styles.example}>
                  <Icon name="check" size={16} color={palette.success} />
                  <Text style={styles.exampleText}>
                    {t("aiTutorial.example5", "Football teams in Europe")}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Daily Limit */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="lightning-bolt" size={20} color={palette.primary} />
                <Text style={styles.sectionTitle}>
                  {t("aiTutorial.dailyLimit", "Daily Generations")}
                </Text>
              </View>
              <Text style={styles.text}>
                {t(
                  "aiTutorial.dailyLimitText",
                  "You get 1 free generation per day. Watch rewarded ads to unlock up to 5 more generations daily!"
                )}
              </Text>
            </Card>

            {/* Tips */}
            <Card style={[styles.section, styles.lastSection]}>
              <View style={styles.sectionHeader}>
                <Icon name="star" size={20} color={palette.primary} />
                <Text style={styles.sectionTitle}>
                  {t("aiTutorial.tips", "Pro Tips")}
                </Text>
              </View>
              
              <View style={styles.tipList}>
                <View style={styles.tip}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    {t(
                      "aiTutorial.tip1",
                      "Be specific in your description for better results"
                    )}
                  </Text>
                </View>
                <View style={styles.tip}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    {t(
                      "aiTutorial.tip2",
                      "Use 'Mixed' difficulty for varied word lengths"
                    )}
                  </Text>
                </View>
                <View style={styles.tip}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    {t(
                      "aiTutorial.tip3",
                      "Generated topics are automatically saved to your custom list"
                    )}
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>

          {/* Footer Button */}
          <Button
            title={t("aiTutorial.gotIt", "Got it!")}
            onPress={onClose}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: space.lg,
  },
  modal: {
    backgroundColor: palette.background,
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
    borderWidth: 2,
    borderColor: palette.line,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: space.lg,
    borderBottomWidth: 2,
    borderBottomColor: palette.line,
    gap: space.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: type.h3,
    fontWeight: "900",
    color: palette.text,
    textAlign: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: space.lg,
  },
  section: {
    marginBottom: space.md,
    padding: space.md,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.sm,
  },
  sectionTitle: {
    fontSize: type.h4,
    fontWeight: "800",
    color: palette.text,
  },
  text: {
    fontSize: type.body,
    color: palette.textDim,
    lineHeight: 22,
  },
  step: {
    flexDirection: "row",
    gap: space.md,
    marginBottom: space.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: type.body,
    fontWeight: "900",
    color: palette.background,
  },
  stepContent: {
    flex: 1,
    gap: space.xs,
  },
  stepTitle: {
    fontSize: type.body,
    fontWeight: "700",
    color: palette.text,
  },
  stepText: {
    fontSize: type.small,
    color: palette.textDim,
    lineHeight: 18,
  },
  exampleList: {
    gap: space.sm,
  },
  example: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  exampleText: {
    fontSize: type.body,
    color: palette.textDim,
  },
  tipList: {
    gap: space.sm,
  },
  tip: {
    flexDirection: "row",
    gap: space.sm,
  },
  tipBullet: {
    fontSize: type.body,
    color: palette.primary,
    fontWeight: "900",
  },
  tipText: {
    flex: 1,
    fontSize: type.small,
    color: palette.textDim,
    lineHeight: 18,
  },
  button: {
    margin: space.lg,
    marginTop: 0,
  },
  scrollContent: {
    paddingBottom: space.xl,
  },
});