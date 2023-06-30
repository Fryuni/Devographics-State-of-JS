"use client";

import Progress from "~/components/normalization/Progress";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { defaultSegmentSize, useSegments } from "./hooks";

export const NormalizeEdition = ({
  survey,
  edition,
  responsesCount,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  responsesCount: number;
}) => {
  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const props = {
    responsesCount,
    survey,
    edition,
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  };

  return (
    <div className="admin-normalization admin-content">
      <button
        onClick={() => {
          initializeSegments({
            responsesCount,
            segmentSize: defaultSegmentSize,
          });
        }}
      >
        Normalize {edition.id}
      </button>
      {segments.length > 0 && <Progress {...props} />}
    </div>
  );
};

export default NormalizeEdition;