import { Label } from "@/components/ui/label";
import { SECTIONS } from "@/lib/constants";
import { TEMPLATE_CONFIGS } from "@/lib/template-factory";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AppWindow } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SettingsSection } from "../SettingsSection";
import { SortableItem } from "../SortableItem";
import { SubSectionCard } from "../SubSectionCard";

import { LayoutSettings, LayoutSettingValue } from "../types";

interface PageLayoutSettingsProps {
  layoutSettings: LayoutSettings;
  updateSetting: (key: keyof LayoutSettings, value: LayoutSettingValue) => void;
  updateSettings?: (settings: Partial<LayoutSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
  templateId: string;
}

export function PageLayoutSettings({
  layoutSettings,
  updateSetting,
  updateSettings,
  isOpen,
  onToggle,
  templateId,
}: PageLayoutSettingsProps) {
  // ... existing logic ...
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize column data from settings or template defaults
  const getColumns = React.useCallback(() => {
    const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS.ats;

    // Check if we have explicit column settings
    const hasColumnSettings =
      layoutSettings.leftColumnSections || layoutSettings.rightColumnSections;

    // If we have explicit column settings, use them
    if (hasColumnSettings) {
      const left = layoutSettings.leftColumnSections || [];
      const middle = layoutSettings.middleColumnSections || [];
      const right = layoutSettings.rightColumnSections || [];

      // Collect all used sections to find orphans
      const usedSections = new Set([...left, ...middle, ...right]);
      const allSections = SECTIONS.map((s) => s.id);
      const orphans = allSections.filter((id) => !usedSections.has(id));

      return {
        left,
        middle,
        right: [...right, ...orphans],
      };
    }

    // Fallback: Use sectionOrder logic (Legacy/Single Column)
    // BUT check if we are in multi-column mode (columnCount > 1) without explicit settings
    // This happens during transitions or initial setup of multi-column
    if ((layoutSettings.columnCount || 1) > 1) {
      // Start with clean slate based on config defaults but using current sectionOrder
      const currentOrder = layoutSettings.sectionOrder || [];
      const allSectionIds = SECTIONS.map((s) => s.id);
      const validOrder = currentOrder.filter((id) =>
        allSectionIds.includes(id),
      );
      const missingIds = allSectionIds.filter((id) => !validOrder.includes(id));
      const fullOrder = [...validOrder, ...missingIds];

      const defaultLeft = config.leftColumnSections || [];
      const defaultMiddle = config.middleColumnSections || [];

      const left = fullOrder.filter((id) => defaultLeft.includes(id));
      const middle = fullOrder.filter((id) => defaultMiddle.includes(id));
      const right = fullOrder.filter(
        (id) => !defaultLeft.includes(id) && !defaultMiddle.includes(id),
      );

      return { left, middle, right };
    }
    const currentOrder = layoutSettings.sectionOrder || [];
    const allSectionIds = SECTIONS.map((s) => s.id);
    const validOrder = currentOrder.filter((id) => allSectionIds.includes(id));
    const missingIds = allSectionIds.filter((id) => !validOrder.includes(id));
    const fullOrder = [...validOrder, ...missingIds];

    // Distribute based on template config default
    const defaultLeft = config.leftColumnSections || [];
    const defaultMiddle = config.middleColumnSections || [];

    // If config has no columns (single column layout), everything goes to right
    if (defaultLeft.length === 0 && defaultMiddle.length === 0) {
      return {
        left: [],
        middle: [],
        right: fullOrder,
      };
    }

    // Distribute into columns while preserving sectionOrder
    const left = fullOrder.filter((id) => defaultLeft.includes(id));
    const middle = fullOrder.filter((id) => defaultMiddle.includes(id));
    const right = fullOrder.filter(
      (id) => !defaultLeft.includes(id) && !defaultMiddle.includes(id),
    );

    return {
      left,
      middle,
      right,
    };
  }, [layoutSettings, templateId]);

  const [columns, setColumns] = useState(getColumns());

  // Update local state when settings change externally
  useEffect(() => {
    setColumns(getColumns());
  }, [getColumns]);

  const effectiveColumnCount = layoutSettings.columnCount || 1;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find containers
    const findContainer = (id: string) => {
      if (id in columns) return id;
      if (columns.left.includes(id)) return "left";
      if (columns.middle.includes(id)) return "middle";
      if (columns.right.includes(id)) return "right";
      return null;
    };

    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setColumns((prev) => {
      const overItems = prev[overContainer as keyof typeof prev];
      const overIndex = overItems.indexOf(overId as string);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        if (overItems.includes(activeId as string)) {
          return prev;
        }

        const isBelowOverItem =
          over &&
          over.rect &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer as keyof typeof prev].filter(
            (item) => item !== active.id,
          ),
        ],
        [overContainer]: [
          ...prev[overContainer as keyof typeof prev].slice(0, newIndex),
          active.id as string,
          ...prev[overContainer as keyof typeof prev].slice(
            newIndex,
            prev[overContainer as keyof typeof prev].length,
          ),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const findContainer = (id: string) => {
      if (id in columns) return id;
      if (columns.left.includes(id)) return "left";
      if (columns.middle.includes(id)) return "middle";
      if (columns.right.includes(id)) return "right";
      return null;
    };

    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = columns[
        activeContainer as keyof typeof columns
      ].indexOf(activeId as string);
      const overIndex = columns[overContainer as keyof typeof columns].indexOf(
        overId as string,
      );

      if (activeIndex !== overIndex) {
        setColumns((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            prev[activeContainer as keyof typeof columns],
            activeIndex,
            overIndex,
          ),
        }));
      }
    }

    setActiveId(null);

    const finalColumns = { ...columns };

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer &&
      activeId !== overId
    ) {
      const activeIndex = columns[
        activeContainer as keyof typeof columns
      ].indexOf(activeId as string);
      const overIndex = columns[overContainer as keyof typeof columns].indexOf(
        overId as string,
      );
      finalColumns[activeContainer as keyof typeof columns] = arrayMove(
        columns[activeContainer as keyof typeof columns],
        activeIndex,
        overIndex,
      );
    }

    if (updateSettings) {
      updateSettings({
        leftColumnSections: finalColumns.left,
        middleColumnSections: finalColumns.middle,
        rightColumnSections: finalColumns.right,
        sectionOrder: [
          ...finalColumns.left,
          ...finalColumns.middle,
          ...finalColumns.right,
        ],
      });
    } else {
      updateSetting("leftColumnSections", finalColumns.left);
      updateSetting("middleColumnSections", finalColumns.middle);
      updateSetting("rightColumnSections", finalColumns.right);
      updateSetting("sectionOrder", [
        ...finalColumns.left,
        ...finalColumns.middle,
        ...finalColumns.right,
      ]);
    }
  };

  const handleMoveSection = (id: string, direction: "up" | "down") => {
    const findContainer = (id: string) => {
      if (id in columns) return id;
      if (columns.left.includes(id)) return "left";
      if (columns.middle.includes(id)) return "middle";
      if (columns.right.includes(id)) return "right";
      return null;
    };

    const container = findContainer(id);
    if (!container) return;

    const columnKey = container as keyof typeof columns;
    const items = columns[columnKey];
    const index = items.indexOf(id);

    if (direction === "up" && index > 0) {
      const newItems = arrayMove(items, index, index - 1);
      const newColumns = { ...columns, [columnKey]: newItems };
      setColumns(newColumns);

      if (updateSettings) {
        updateSettings({
          leftColumnSections: newColumns.left,
          middleColumnSections: newColumns.middle,
          rightColumnSections: newColumns.right,
          sectionOrder: [
            ...newColumns.left,
            ...newColumns.middle,
            ...newColumns.right,
          ],
        });
      } else {
        updateSetting("leftColumnSections", newColumns.left);
        updateSetting("middleColumnSections", newColumns.middle);
        updateSetting("rightColumnSections", newColumns.right);
        updateSetting("sectionOrder", [
          ...newColumns.left,
          ...newColumns.middle,
          ...newColumns.right,
        ]);
      }
    } else if (direction === "down" && index < items.length - 1) {
      const newItems = arrayMove(items, index, index + 1);
      const newColumns = { ...columns, [columnKey]: newItems };
      setColumns(newColumns);

      if (updateSettings) {
        updateSettings({
          leftColumnSections: newColumns.left,
          middleColumnSections: newColumns.middle,
          rightColumnSections: newColumns.right,
          sectionOrder: [
            ...newColumns.left,
            ...newColumns.middle,
            ...newColumns.right,
          ],
        });
      } else {
        updateSetting("leftColumnSections", newColumns.left);
        updateSetting("middleColumnSections", newColumns.middle);
        updateSetting("rightColumnSections", newColumns.right);
        updateSetting("sectionOrder", [
          ...newColumns.left,
          ...newColumns.middle,
          ...newColumns.right,
        ]);
      }
    }
  };

  const handleMoveSectionBetweenColumns = (
    id: string,
    direction: "left" | "right",
  ) => {
    // Find current column
    let currentColumn: keyof typeof columns | null = null;
    if (columns.left.includes(id)) currentColumn = "left";
    else if (columns.middle.includes(id)) currentColumn = "middle";
    else if (columns.right.includes(id)) currentColumn = "right";

    if (!currentColumn) return;

    // Determine target column
    let targetColumn: keyof typeof columns | null = null;

    if (effectiveColumnCount === 2) {
      if (currentColumn === "left" && direction === "right")
        targetColumn = "right";
      else if (currentColumn === "right" && direction === "left")
        targetColumn = "left";
    } else if (effectiveColumnCount === 3) {
      if (currentColumn === "left" && direction === "right")
        targetColumn = "middle";
      else if (currentColumn === "middle") {
        targetColumn = direction === "left" ? "left" : "right";
      } else if (currentColumn === "right" && direction === "left")
        targetColumn = "middle";
    }

    if (!targetColumn) return;

    // Move item
    const newColumns = { ...columns };

    // Remove from source
    newColumns[currentColumn] = newColumns[currentColumn].filter(
      (item) => item !== id,
    );

    // Add to target (append to end)
    // Make sure we don't duplicate if it somehow exists
    if (!newColumns[targetColumn].includes(id)) {
      newColumns[targetColumn] = [...newColumns[targetColumn], id];
    }

    setColumns(newColumns);

    if (updateSettings) {
      updateSettings({
        leftColumnSections: newColumns.left,
        middleColumnSections: newColumns.middle,
        rightColumnSections: newColumns.right,
        sectionOrder: [
          ...newColumns.left,
          ...newColumns.middle,
          ...newColumns.right,
        ],
      });
    } else {
      // Fallback for older parent components
      updateSetting("leftColumnSections", newColumns.left);
      updateSetting("middleColumnSections", newColumns.middle);
      updateSetting("rightColumnSections", newColumns.right);
      updateSetting("sectionOrder", [
        ...newColumns.left,
        ...newColumns.middle,
        ...newColumns.right,
      ]);
    }
  };

  return (
    <SettingsSection
      title="Page Layout"
      icon={AppWindow}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {/* Columns */}
        <SubSectionCard>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Columns
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 1, label: "One", icon: "rows" },
              { value: 2, label: "Two", icon: "columns" },
              { value: 3, label: "Mix", icon: "mix" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting("columnCount", option.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:bg-accent ${
                  (layoutSettings.columnCount || 1) === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-transparent hover:border-primary/30"
                }`}
              >
                <div className="h-8 w-12 rounded bg-muted/80 flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="text-[10px] font-bold">{option.value}</div>
                </div>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </SubSectionCard>

        {/* Column Width Slider (Only for 2/3 columns) */}
        {effectiveColumnCount > 1 && (
          <SubSectionCard>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Left Column Ratio</span>
                <span className="text-muted-foreground tabular-nums bg-muted px-1.5 py-0.5 rounded text-xs">
                  {layoutSettings.leftColumnWidth || 30}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={layoutSettings.leftColumnWidth || 30}
                onChange={(e) =>
                  updateSetting("leftColumnWidth", parseInt(e.target.value))
                }
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          </SubSectionCard>
        )}

        {/* Section Reordering */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            Reorder Sections
          </Label>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className={`grid gap-4 ${
                effectiveColumnCount === 3
                  ? "grid-cols-1 lg:grid-cols-3"
                  : effectiveColumnCount > 1
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
              }`}
            >
              {/* Left Column */}
              {effectiveColumnCount > 1 && (
                <SubSectionCard className="p-2 min-h-[200px] space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase text-center block mb-1">
                    Left Column
                  </Label>
                  <SortableContext
                    id="left"
                    items={columns.left}
                    strategy={verticalListSortingStrategy}
                  >
                    {columns.left.map((id, index) => {
                      const section = SECTIONS.find((s) => s.id === id);
                      if (!section) return null;
                      return (
                        <SortableItem
                          key={id}
                          id={id}
                          label={section.label}
                          isFirst={index === 0}
                          isLast={index === columns.left.length - 1}
                          onMoveUp={() => handleMoveSection(id, "up")}
                          onMoveDown={() => handleMoveSection(id, "down")}
                          canMoveRight={true}
                          onMoveRight={() =>
                            handleMoveSectionBetweenColumns(id, "right")
                          }
                        />
                      );
                    })}
                  </SortableContext>
                </SubSectionCard>
              )}

              {/* Middle Column */}
              {effectiveColumnCount === 3 && (
                <SubSectionCard className="p-2 min-h-[200px] space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase text-center block mb-1">
                    Middle Column
                  </Label>
                  <SortableContext
                    id="middle"
                    items={columns.middle}
                    strategy={verticalListSortingStrategy}
                  >
                    {columns.middle.map((id, index) => {
                      const section = SECTIONS.find((s) => s.id === id);
                      if (!section) return null;
                      return (
                        <SortableItem
                          key={id}
                          id={id}
                          label={section.label}
                          isFirst={index === 0}
                          isLast={index === columns.middle.length - 1}
                          onMoveUp={() => handleMoveSection(id, "up")}
                          onMoveDown={() => handleMoveSection(id, "down")}
                          canMoveLeft={true}
                          onMoveLeft={() =>
                            handleMoveSectionBetweenColumns(id, "left")
                          }
                          canMoveRight={true}
                          onMoveRight={() =>
                            handleMoveSectionBetweenColumns(id, "right")
                          }
                        />
                      );
                    })}
                  </SortableContext>
                </SubSectionCard>
              )}

              {/* Right/Main Column */}
              <SubSectionCard className="p-2 min-h-[200px] space-y-2">
                {effectiveColumnCount > 1 && (
                  <Label className="text-[10px] text-muted-foreground uppercase text-center block mb-1">
                    Right Column
                  </Label>
                )}
                <SortableContext
                  id="right"
                  items={columns.right}
                  strategy={verticalListSortingStrategy}
                >
                  {columns.right.map((id, index) => {
                    const section = SECTIONS.find((s) => s.id === id);
                    if (!section) return null;
                    return (
                      <SortableItem
                        key={id}
                        id={id}
                        label={section.label}
                        isFirst={index === 0}
                        isLast={index === columns.right.length - 1}
                        onMoveUp={() => handleMoveSection(id, "up")}
                        onMoveDown={() => handleMoveSection(id, "down")}
                        canMoveLeft={effectiveColumnCount > 1}
                        onMoveLeft={() =>
                          handleMoveSectionBetweenColumns(id, "left")
                        }
                      />
                    );
                  })}
                </SortableContext>
              </SubSectionCard>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="bg-background border rounded-md p-2 shadow-lg opacity-80 w-[200px]">
                  {SECTIONS.find((s) => s.id === activeId)?.label}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </SettingsSection>
  );
}
