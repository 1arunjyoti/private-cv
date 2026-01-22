import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { getLevelScore } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalSkillsProps {
  skills: Resume["skills"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  lineHeight: number;
  baseFont: string;
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
  const score = getLevelScore(level);
  const max = 5;
  if (levelStyle === 1) {
    // Dots
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
  if (levelStyle === 3) {
    // Bars
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

export const ProfessionalSkills: React.FC<ProfessionalSkillsProps> = ({
  skills,
  settings,
  styles,
  getColor,
  fontSize,
  lineHeight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  baseFont,
  boldFont,
}) => {
  if (!skills || skills.length === 0) return null;

  // Support List Style & Level Style
  const listStyle = settings.skillsListStyle;
  const levelStyle = settings.skillsLevelStyle ?? 0;

  return (
    <View style={styles.section}>
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
              {skill.keywords.length > 0 && `: ${skill.keywords.join(", ")}`}
            </Text>
          ))}
        </Text>
      ) : (
        <View>
          {skills.map((skill, index) => (
            <View
              key={skill.id}
              style={{ marginBottom: 6, flexDirection: "row" }}
            >
              {settings.skillsListStyle === "bullet" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>•</Text>
              )}
              {settings.skillsListStyle === "dash" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>-</Text>
              )}
              {settings.skillsListStyle === "number" && (
                <Text style={{ marginRight: 4, fontSize: fontSize }}>
                  {index + 1}.
                </Text>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: fontSize,
                    fontFamily: boldFont,
                  }}
                >
                  {skill.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {skill.keywords.map((kw, k) => (
                    <Text
                      key={k}
                      style={{ fontSize: fontSize - 0.5, color: "#444" }}
                    >
                      {kw}
                      {k < skill.keywords.length - 1 ? "," : ""}
                    </Text>
                  ))}
                  <RenderLevel
                    level={skill.level}
                    levelStyle={levelStyle}
                    decorationColor={getColor("decorations")}
                    fontSize={fontSize}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
