import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { Skill } from "@/db";

interface TimelineSkillsProps {
  skills: Skill[];
  settings: any;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export function TimelineSkills({
  skills,
  settings,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}: TimelineSkillsProps) {
  if (!skills || skills.length === 0) return null;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 10,
    },
    title: {
      fontSize: fontSize + 4,
      fontFamily: boldFont,
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: 10,
      color: getColor("headings", "#000"),
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    skillGroup: {
      marginBottom: 5,
      width: "100%", // Stack groups vertically if desired, or let them flow
    },
    skillItem: {
      borderWidth: 1,
      borderColor: "#ccc",
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: fontSize,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 6,
      marginRight: 6,
    },
  });

  // Flat list of all keywords if no categories, or grouped.
  // The visual shows them as individual boxes.
  // We can just iterate all keywords of all skills for a "cloud" look usually found in these modern templates.

  const allKeywords = skills.flatMap(
    (s) => (s.keywords && s.keywords.length > 0 ? s.keywords : [s.name]), // Fallback if no keywords, use skill name
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TECHNICAL SKILLS</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {allKeywords.map((k, i) => (
          <Text key={i} style={styles.skillItem}>
            {k}
          </Text>
        ))}
      </View>
    </View>
  );
}
