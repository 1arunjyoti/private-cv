/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Resume } from "@/db";

interface DeveloperHeaderProps {
  basics: Resume["basics"];
  settings: any;
  themeColor: string;
}

export const DeveloperHeader = ({
  basics,
  themeColor,
}: DeveloperHeaderProps) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: "#252526",
      borderRadius: 10,
      borderLeftWidth: 2,
      borderLeftColor: themeColor,
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 30,
      objectFit: "cover",
      borderWidth: 2,
      borderColor: themeColor,
    },
    content: {
      flex: 1,
    },
    className: {
      fontSize: 20, // Slightly smaller to fit better
      color: themeColor,
      fontFamily: "Courier",
      marginBottom: 5,
    },
    comment: {
      fontSize: 9,
      color: "#6A9955", // VS Code comment green
      fontFamily: "Courier",
      marginBottom: 2,
    },
    infoBlock: {
      // No extra margin needed if flex
    },
  });

  const name = basics.name.replace(/\s+/g, "");

  return (
    <View style={styles.container}>
      {basics.image && <Image src={basics.image} style={styles.image} />}

      <View style={styles.content}>
        <Text style={styles.className}>
          <Text style={{ color: "#569CD6" }}>class</Text> {name}{" "}
          <Text style={{ color: "#D4D4D4" }}>{"{"}</Text>
        </Text>

        <View style={styles.infoBlock}>
          <Text style={styles.comment}>{basics.label}</Text>
          {basics.location && (
            <Text style={styles.comment}>
              Address: {basics.location.address}, {basics.location.city},{" "}
              {basics.location.postalCode}
            </Text>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {basics.phone && (
              <Text style={styles.comment}>Phone: {basics.phone}</Text>
            )}
            {basics.email && (
              <Text style={styles.comment}>Email: {basics.email}</Text>
            )}
          </View>

          {basics.url && (
            <Text style={styles.comment}>Website: {basics.url}</Text>
          )}

          {basics.profiles.map((profile, index) => (
            <Text key={index} style={styles.comment}>
              {profile.network}: {profile.url}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};
