import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";
import { getLevelScore } from "@/lib/template-utils";

interface CreativeSkillsProps {
  skills: Resume["skills"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
  lineHeight: number;
}

const RenderLevel = ({
  level,
  levelStyle,
  decorationColor,
}: {
  level: string;
  levelStyle: number;
  decorationColor: string;
}) => {
  if (!level || levelStyle === 0) return null;
  const score = getLevelScore(level);
  const max = 5;

  if (levelStyle === 1) {
    // Dots
    return (
      <View style={{ flexDirection: "row", gap: 2, marginLeft: 4 }}>
        {[...Array(max)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: i < score ? decorationColor : "#eee",
            }}
          />
        ))}
      </View>
    );
  }
  if (levelStyle === 3) {
    // Bars
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 1,
          marginLeft: 4,
          alignItems: "flex-end",
          height: 8,
        }}
      >
        {[...Array(max)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: (i + 1) * 1.6, // Ascending height
              backgroundColor: i < score ? decorationColor : "#eee",
            }}
          />
        ))}
      </View>
    );
  }
  return null;
};

export const CreativeSkills: React.FC<CreativeSkillsProps> = ({
  skills,
  settings,
  styles,
  getColor,
  fontSize,
  // baseFont,
  boldFont,
  italicFont,
}) => {
  if (!skills || skills.length === 0) return null;

  const listStyle = settings.skillsListStyle || "none";
  const levelStyle = settings.skillsLevelStyle || 0;

  return (
    <View key="skills" style={styles.section}>
      {((settings.skillsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Skills
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          columnGap: 10,
          rowGap: 4,
        }}
      >
        {skills.map((skill, index) => (
          <View
            key={skill.id}
            style={{
              width: "48%", // 2 columns approx
              marginBottom: 4,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            {/* List Marker */}
            {listStyle === "bullet" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                }}
              >
                •
              </Text>
            )}
            {listStyle === "number" && (
              <Text
                style={{
                  fontSize: fontSize,
                  marginRight: 4,
                  color: getColor("headings"),
                  minWidth: 12,
                }}
              >
                {index + 1}.
              </Text>
            )}

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: boldFont,
                    fontWeight: "bold",
                    fontSize: fontSize,
                    color: "#000",
                  }}
                >
                  {skill.name}
                </Text>

                {/* Level Indicator */}
                <RenderLevel
                  level={skill.level}
                  levelStyle={levelStyle}
                  decorationColor={getColor("decorations")}
                />
              </View>

              {skill.keywords && skill.keywords.length > 0 && (
                <Text
                  style={{
                    fontFamily: italicFont,
                    fontStyle: "italic",
                    fontSize: fontSize - 1,
                    color: "#666",
                    marginTop: 1,
                  }}
                >
                  {skill.keywords.join(", ")}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
