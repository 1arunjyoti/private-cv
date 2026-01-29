import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { WorkExperience } from "@/db";

interface TimelineExperienceProps {
  work: WorkExperience[];
  settings: any;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export function TimelineExperience({
  work,
  settings,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}: TimelineExperienceProps) {
  if (!work || work.length === 0) return null;

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
      position: "relative",
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
      textAlign: "left",
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
      position: "relative",
    },
    // The vertical line. We'll use a border on a view that spans the height.
    // However, knowing height is hard in react-pdf.
    // Alternative: A repeating view or absolute pos?
    // Let's try a simple visual hack: A dot.
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#000",
      marginTop: 4, // Align with text top approximately
    },
    rightCol: {
      width: "77%",
      paddingLeft: 10,
    },
    role: {
      fontSize: fontSize + 2,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: getColor("headings", "#000"),
    },
    company: {
      fontSize: fontSize + 1,
      fontFamily: boldFont,
      fontWeight: "bold",
      color: getColor("primary", "#3b82f6"),
      marginBottom: 4,
    },
    summary: {
      fontSize: fontSize,
      fontFamily: baseFont,
      marginBottom: 4,
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletPoint: {
      width: 10,
      fontSize: fontSize,
      lineHeight: 1.4,
    },
    bulletText: {
      flex: 1,
      fontSize: fontSize,
      lineHeight: 1.4,
    },
  });

  return (
    <View>
      <Text style={styles.title}>PROFESSIONAL EXPERIENCE</Text>
      {work.map((job, index) => (
        <View key={index} style={styles.item}>
          {/* Left Column: Date & Location */}
          <View style={styles.leftCol}>
            <Text style={styles.date}>
              {job.startDate} - {job.endDate || "Present"}
            </Text>
            {job.location && (
              <Text style={styles.location}>{job.location}</Text>
            )}
          </View>

          {/* Middle Column: Dot (Vertical line is tricky without fixed heights, usually users rely on Gestalt principles or we can add a borderLeft to rightCol) */}
          <View style={styles.lineCol}>
            <View style={styles.dot} />
          </View>

          {/* Right Column: Content */}
          <View style={styles.rightCol}>
            <Text style={styles.role}>{job.position}</Text>
            <Text style={styles.company}>{job.name}</Text>
            {job.summary && <Text style={styles.summary}>{job.summary}</Text>}
            {job.highlights &&
              job.highlights.map((h, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{h}</Text>
                </View>
              ))}
          </View>
        </View>
      ))}
    </View>
  );
}
