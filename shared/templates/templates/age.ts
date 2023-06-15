import { single } from './single'
import questionOptions from '../options.yml'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

export const age: TemplateFunction = options => {
    const id = 'age'
    const output: QuestionTemplateOutput = {
        ...single(addQuestionId(options, id)),
        ...questionOptions[id]
    }
    return output
}
