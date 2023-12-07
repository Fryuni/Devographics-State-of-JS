"use client";
import Dialog from "./Dialog";
import { PresetsShortlist } from "./PresetsShortlist";
import AnswersFilters from "./AnswersFilters";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { Dispatch, SetStateAction } from "react";
import { AnswersProps } from "./Answers";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionMetadata,
  Entity,
  ResponseData,
} from "@devographics/types";

interface AnswersTableHeadingProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  entities: Entity[];
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswer[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  setShowShortlist: Dispatch<SetStateAction<boolean>>;
  showShortlist: boolean;
  questionData?: ResponseData;
}

export const AnswersTableHeading = (props: AnswersTableHeadingProps) => {
  const {
    variant,
    filteredAnswers,
    filterQuery,
    setFilterQuery,
    showCustomOnly,
    setShowCustomOnly,
    setShowShortlist,
    showShortlist,
    question,
  } = props;
  return (
    <thead>
      <tr>
        <th colSpan={99}>
          <AnswersFilters
            {...{
              question,
              variant,
              filteredAnswers,
              filterQuery,
              setFilterQuery,
              showCustomOnly,
              setShowCustomOnly,
            }}
          />
        </th>
      </tr>
      <tr>
        <th>Response ID</th>
        <th>Answer</th>
        <th>
          <span>Tokens</span>
          &nbsp;
          <a
            href="#"
            style={{ whiteSpace: "nowrap" }}
            onClick={(e) => {
              e.preventDefault();
              setShowShortlist(!showShortlist);
            }}
            data-tooltip="Edit presets…"
          >
            Edit Shortlist…
          </a>
          {showShortlist && (
            <Dialog
              showModal={showShortlist}
              setShowModal={setShowShortlist}
              header={<span>Token Presets</span>}
            >
              <PresetsShortlist {...props} />
            </Dialog>
          )}
        </th>
        {/* <th>Current Tokens</th> */}

        <th>Actions</th>
      </tr>
    </thead>
  );
};
