import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Resume } from "@/db";

interface PolishedLanguagesProps {
  languages: Resume["languages"];
  themeColor: string;
  baseFont: string;
  fontSize: number;
}

export function PolishedLanguages({
  languages,
  themeColor,
  baseFont,
  fontSize,
}: PolishedLanguagesProps) {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 0,
      marginTop: 10, // Spacing
    },
    heading: {
      fontSize: fontSize + 2,
      fontFamily: baseFont,
      fontWeight: "normal",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      paddingBottom: 4,
      color: "#333",
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    item: {
      width: "48%", // 2 columns for languages
      marginBottom: 6,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    left: {},
    language: {
      fontSize: fontSize,
      fontFamily: baseFont,
      color: "#333",
      fontWeight: "bold",
    },
    fluency: {
      fontSize: fontSize - 1,
      color: "#666",
      marginLeft: 4,
    },
    dots: {
      flexDirection: "row",
      gap: 2,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#eee",
    },
    dotActive: {
      backgroundColor: themeColor,
    },
  });

  const getLevel = (fluency: string) => {
    // Simple mapping: Native=5, Advanced/Fluent=4, Intermediate=3, Beginner=1-2
    const lower = fluency.toLowerCase();
    if (lower.includes("native") || lower.includes("bilingual")) return 5;
    if (lower.includes("advanced") || lower.includes("fluent")) return 4;
    if (lower.includes("intermediate")) return 3;
    return 2;
  };

  if (!languages || languages.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>LANGUAGES</Text>
      <View style={styles.row}>
        {languages.map((lang, index) => {
          const level = getLevel(lang.fluency || "");
          const dots = [1, 2, 3, 4, 5];

          return (
            <View key={index} style={styles.item}>
              <View style={styles.left}>
                <Text style={styles.language}>{lang.language}</Text>
                {lang.fluency && (
                  <Text style={styles.fluency}>{lang.fluency}</Text>
                )}
              </View>

              <View style={styles.dots}>
                {dots.map((d) => (
                  <View
                    key={d}
                    style={[styles.dot, d <= level ? styles.dotActive : {}]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
