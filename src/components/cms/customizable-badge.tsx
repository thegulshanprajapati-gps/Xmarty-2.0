'use client';

import { useContentBlock } from "@/hooks/use-content-block";
import { EditableText } from "./editable-text";
import { cn } from "@/lib/utils";

interface CustomizableBadgeProps {
  pageSlug: string;
  sectionKey: string;
  badgeKey: string;
  defaultText: string;
  className?: string;
}

export function CustomizableBadge({ pageSlug, sectionKey, badgeKey, defaultText, className }: CustomizableBadgeProps) {
  const textBlock = useContentBlock(pageSlug, sectionKey, `${badgeKey}Text`, defaultText, "text");
  const bgBlock = useContentBlock(pageSlug, sectionKey, `${badgeKey}Bg`, "", "text");
  const textColBlock = useContentBlock(pageSlug, sectionKey, `${badgeKey}TextColor`, "", "text");
  const borderColBlock = useContentBlock(pageSlug, sectionKey, `${badgeKey}BorderColor`, "", "text");
  const radiusBlock = useContentBlock(pageSlug, sectionKey, `${badgeKey}BorderRadius`, "full", "text");

  const radiusClass = radiusBlock.value === 'none' ? 'rounded-none' : 
                      radiusBlock.value === 'md' ? 'rounded-md' :
                      radiusBlock.value === 'lg' ? 'rounded-lg' :
                      radiusBlock.value === 'xl' ? 'rounded-2xl' : 'rounded-full';

  // Build styles dynamically
  const customStyles: React.CSSProperties = {};
  if (bgBlock.value) customStyles.backgroundColor = bgBlock.value;
  if (textColBlock.value) customStyles.color = textColBlock.value;
  if (borderColBlock.value) customStyles.borderColor = borderColBlock.value;

  return (
    <div 
      className={cn(
        "inline-flex items-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider border select-none transition-all duration-300",
        radiusClass,
        className
      )}
      style={customStyles}
    >
      <EditableText
        pageSlug={pageSlug}
        sectionKey={sectionKey}
        contentKey={`${badgeKey}Text`}
        defaultValue={defaultText}
        as="span"
      />
    </div>
  );
}
