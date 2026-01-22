import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { getLevelScore } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicSkillsProps {
  skills: Resume["skills"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  lineHeight: number;
  boldFont: string;
}

const RenderLevel = ({
  level,
  levelStyle,
  decorationColor,
  fontSize,
}: {
  level: string;
  levelStyle: number;
  decorationColor: string;
  fontSize: number;
}) => {
  if (!level || levelStyle === 0) return null;
  const score = getLevelScore(level); // 1-5
  const max = 5;

  // Style 1: Dots
  if (levelStyle === 1) {
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 2,
          marginLeft: 6,
          alignItems: "center",
        }}
      >
        {[...Array(max)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i < score ? decorationColor : "#ddd",
            }}
          />
        ))}
      </View>
    );
  }

  // Style 2: Was Bars (Removed)
  if (levelStyle === 2) return null;
  // Style 3: Signal Bars (Growing height)
  if (levelStyle === 3) {
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 2,
          marginLeft: 6,
          alignItems: "flex-end",
          height: 10,
        }}
      >
        {[...Array(max)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: (i + 1) * 2,
              backgroundColor: i < score ? decorationColor : "#ddd",
            }}
          />
        ))}
      </View>
    );
  }
  // Style 4: Text
  return (
    <Text
      style={{
        fontSize: fontSize - 1,
        color: "#666",
        marginLeft: 6,
        fontStyle: "italic",
      }}
    >
      ({level})
    </Text>
  );
};

export const ClassicSkills: React.FC<ClassicSkillsProps> = ({
  skills,
  settings,
  styles,
  getColor,
  fontSize,
  lineHeight,
  boldFont,
}) => {
  if (!skills || skills.length === 0) return null;

  const listStyle = settings.skillsListStyle;
  const levelStyle = settings.skillsLevelStyle ?? 0; // Default 0 (None)

  return (
    <View key="skills" style={styles.section}>
      {((settings.skillsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            Skills
          </Text>
        </View>
      )}
      {listStyle === "inline" ? (
        <Text style={{ fontSize: fontSize, lineHeight: lineHeight }}>
          {skills.map((skill, index) => (
            <Text key={skill.id}>
              {index > 0 && " | "}
              <Text style={{ fontFamily: boldFont, fontWeight: "bold" }}>
                {skill.name}
              </Text>
              {skill.keywords.join(", ")}
            </Text>
          ))}
        </Text>
      ) : (
        skills.map((skill, index) => (
          <View
            key={skill.id}
            style={{
              marginBottom: 2,
              flexDirection: "row",
              marginLeft: listStyle === "blank" ? 0 : 10, // Indent unless blank
              alignItems: "center",
            }}
          >
            {listStyle !== "blank" && (
              <Text style={{ marginRight: 4, fontSize: fontSize }}>
                {listStyle === "bullet"
                  ? "•"
                  : listStyle === "number"
                    ? `${index + 1}.`
                    : "-"}
              </Text>
            )}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: fontSize }}>
                <Text style={{ fontFamily: boldFont, fontWeight: "bold" }}>
                  {skill.name}:{" "}
                </Text>
                {skill.keywords.join(", ")}
              </Text>
              <RenderLevel
                level={skill.level}
                levelStyle={levelStyle}
                decorationColor={getColor("decorations")}
                fontSize={fontSize}
              />
            </View>
          </View>
        ))
      )}
    </View>
  );
};
