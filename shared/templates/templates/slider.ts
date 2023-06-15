import { DbSuffixes, Question, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

const getSliderOptions = (question: Question) => {
    const lowerBound = question.from ?? 0
    const upperBound = question.to ?? 8
    const delta = upperBound - lowerBound + 1
    const options = [...Array(delta)].map((x, i) => ({ id: lowerBound + i }))
    return options
}

export const slider: TemplateFunction = options => {
    checkHasId(options)

    const question = {
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: getSliderOptions(options.question),
        ...options.question
    } as QuestionTemplateOutput

    const output: QuestionTemplateOutput = {
        ...getPaths({ ...options, question }, DbSuffixes.CHOICES),
        ...question
    }

    return output
}
