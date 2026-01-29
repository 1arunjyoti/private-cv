import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { Education } from "@/db";

interface TimelineEducationProps {
  education: Education[];
  settings: any;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
}

export function TimelineEducation({
  education,
  settings,
  getColor,
  fontSize,
  baseFont,
  boldFont,
}: TimelineEducationProps) {
  if (!education || education.length === 0) return null;

  const styles = StyleSheet.create({
    title: {
      fontSize: fontSize + 4,
      fontFamily: boldFont,
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: 10,
      color: getColor("headings", "#000"),
    },
    item: {
      flexDirection: "row",
      marginBottom: 15,
    },
    leftCol: {
      width: "18%",
      paddingRight: 10,
      alignItems: "flex-start",
    },
    date: {
      fontSize: fontSize,
      fontFamily: boldFont,
      fontWeight: "bold",
    },
    location: {
      fontSize: fontSize - 1,
      fontFamily: baseFont,
      color: "#666",
      marginTop: 2,
    },
    lineCol: {
      width: "5%",
      alignItems: "center",
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#000",
      marginTop: 4,
    },
    rightCol: {
      width: "77%",
      paddingLeft: 10,
    },
    degree: {
      fontSize: fontSize + 2,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: getColor("headings", "#000"),
    },
    institution: {
      fontSize: fontSize + 1,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: getColor("primary", "#3b82f6"),
    },
    score: {
      fontSize: fontSize,
      fontFamily: baseFont,
      marginTop: 2,
    },
  });

  return (
    <View>
      <Text style={styles.title}>EDUCATION</Text>
      {education.map((edu, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.leftCol}>
            <Text style={styles.date}>
              {edu.startDate} - {edu.endDate || "Present"}
            </Text>
            {edu.location && (
              <Text style={styles.location}>{edu.location}</Text>
            )}
          </View>

          <View style={styles.lineCol}>
            <View style={styles.dot} />
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.degree}>
              {edu.studyType} {edu.area}
            </Text>
            <Text style={styles.institution}>{edu.institution}</Text>
            {edu.score && <Text style={styles.score}>GPA: {edu.score}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}
