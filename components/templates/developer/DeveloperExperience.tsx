import { Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Resume } from "@/db";

interface DeveloperExperienceProps {
  work: Resume["work"];
  themeColor: string;
}

export const DeveloperExperience = ({
  work,
  themeColor,
}: DeveloperExperienceProps) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 15,
      padding: 10,
      backgroundColor: "#252526",
      borderRadius: 5,
      borderLeftWidth: 2,
      borderLeftColor: themeColor,
    },
    heading: {
      fontSize: 14,
      color: themeColor,
      fontFamily: "Courier",
      marginBottom: 5,
    },
    codeBlock: {
      fontFamily: "Courier",
      fontSize: 9,
      color: "#D4D4D4",
    },
    bracket: { color: "#D4D4D4" },
    keyword: { color: "#569CD6" }, // Blue
    string: { color: "#CE9178" },
    comment: { color: "#6A9955" },
    property: { color: "#9CDCFE" },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>#Experience</Text>
      <View style={styles.codeBlock}>
        {work.map((job, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={styles.bracket}>{"{"}</Text>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.comment}>
                {job.startDate} - {job.endDate || "Present"}
              </Text>
              <Text style={styles.comment}>
                {job.name}, {job.location}
              </Text>

              <View style={{ marginTop: 2 }}>
                <Text style={styles.property}>role</Text>
                <Text style={styles.keyword}>: </Text>
                <Text style={styles.string}>&quot;{job.position}&quot;</Text>
                <Text style={styles.bracket}>,</Text>
              </View>

              <View style={{ marginTop: 2 }}>
                <Text style={styles.property}>description</Text>
                <Text style={styles.keyword}>: </Text>
                <Text style={styles.string}>&quot;{job.summary}&quot;</Text>
                <Text style={styles.bracket}>,</Text>
              </View>

              <View style={{ marginTop: 2 }}>
                <Text style={styles.property}>highlights</Text>
                <Text style={styles.keyword}>: </Text>
                <Text style={styles.bracket}>[</Text>
                {job.highlights.map((h, i) => (
                  <Text key={i} style={{ marginLeft: 10 }}>
                    <Text style={styles.string}>&quot;{h}&quot;</Text>
                    {i < job.highlights.length - 1 && (
                      <Text style={styles.bracket}>,</Text>
                    )}
                  </Text>
                ))}
                <Text style={styles.bracket}>]</Text>
              </View>
            </View>
            <Text style={styles.bracket}>{"},"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
