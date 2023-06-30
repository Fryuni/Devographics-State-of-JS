import { getRawResponsesCollection } from "@devographics/mongo";
import {
  fetchEditionMetadata,
  fetchSurveyMetadata,
  fetchSurveysMetadata,
} from "~/lib/api/fetch";
import { normalizeInBulk } from "./normalizeInBulk";

export type NormalizeQuestionResponsesArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  editionId: string;
  questionId: string;
  responsesIds: string[];
};

/*

Normalize a specific question on a specific response

*/
export const normalizeQuestionResponses = async (
  args: NormalizeQuestionResponsesArgs
) => {
  const { surveyId, editionId, questionId, responsesIds } = args;

  const survey = await fetchSurveyMetadata({ surveyId });
  const edition = await fetchEditionMetadata({ surveyId, editionId });
  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get all the responses we're going to operate on
  const responses = await rawResponsesCollection
    .find({ _id: { $in: responsesIds } })
    .toArray();

  const startAt = new Date();

  console.log(
    `⛰️ Renormalizing question ${questionId} for responses [${responsesIds.join(
      ", "
    )}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    edition,
    responses,
    questionId,
    isRenormalization: true,
  });

  return mutationResult;
};