import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import Button from 'core/components/Button'
import { DeleteIcon, PlusIcon } from 'core/icons'
import cloneDeep from 'lodash/cloneDeep.js'
import { FieldSegment } from './FieldSegment'
import { ValueSegment } from './ValueSegment'
import { OperatorSegment } from './OperatorSegment'
import { CustomizationFiltersCondition, FilterItem, PanelState } from '../types'
import { BlockVariantDefinition } from 'core/types'

interface ConditionProps {
    seriesIndex: number
    index: number
    allFilters: FilterItem[]
    filtersIdsInUse: string[]
    filtersIdsNotInUse: string[]
    condition: CustomizationFiltersCondition
    stateStuff: PanelState
    conditionsCount: number
    block: BlockVariantDefinition
}

const Condition = ({
    allFilters,
    seriesIndex,
    index,
    filtersIdsInUse,
    filtersIdsNotInUse,
    condition,
    conditionsCount,
    block,
    stateStuff
}: ConditionProps) => {
    const defaultFieldId = filtersIdsNotInUse[0]
    const { fieldId = defaultFieldId, operator, value } = condition
    const { setFiltersState } = stateStuff

    const field = allFilters.find(o => o.id === fieldId) as FilterItem
    const values = field?.options || []

    const disabledList = filtersIdsInUse.filter(id => id !== fieldId)

    const handleDelete = () => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.filters[seriesIndex].conditions.splice(index, 1)
            return newState
        })
    }

    const segmentProps = {
        seriesIndex,
        conditionIndex: index,
        stateStuff,
        allFilters,
        field,
        block
    }

    return (
        <ActiveCondition_>
            <Segments_>
                <FieldSegment
                    {...segmentProps}
                    allFilters={allFilters}
                    disabledList={disabledList}
                />
                <OperatorSegment {...segmentProps} value={operator} />
                {/* <Operator_>=</Operator_> */}
                {/* TODO: support arrays with `in` and `nin`, for now only use `=` */}
                {/* <ConditionSegment
                    {...segmentProps}
                    segmentId={'operator'}
                    options={operators}
                    value={operator}
                /> */}
                <ValueSegment
                    {...segmentProps}
                    operator={operator}
                    options={values}
                    value={value}
                />
            </Segments_>
            <DeleteWrapper_>
                {conditionsCount > 1 && (
                    <DeleteCondition_ onClick={handleDelete}>
                        <DeleteIcon labelId="filters.condition.delete" />
                    </DeleteCondition_>
                )}
            </DeleteWrapper_>
            <And_>
                {/* <T k="filters.condition.and" /> */}
                <PlusIcon enableHover={false} />
            </And_>
        </ActiveCondition_>
    )
}

export const Condition_ = styled.div`
    background: ${({ theme }) => theme.colors.backgroundTrans};
    border-radius: 10px;
    position: relative;
`

const DeleteWrapper_ = styled.div`
    border-left: 1px dashed ${({ theme }) => theme.colors.borderAlt};
    padding: 0 ${spacing()};
    display: flex;
    align-items: center;
    min-width: 73px;
`

const ActiveCondition_ = styled(Condition_)`
    display: flex;
    /* grid-template-columns: auto minmax(0, 1fr); */
    /* gap: ${spacing()}; */
    justify-content: space-between;
    /* align-items: center; */
`

const DeleteCondition_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    border-radius: 100%;
    aspect-ratio: 1/1;
    padding: 0px;
    display: grid;
    place-items: center;
    width: 32px;
`

const And_ = styled.div`
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
    background: ${({ theme }) => theme.colors.backgroundAlt};
    padding: 6px;
    border-radius: 100%;
    text-transform: uppercase;
    z-index: 100;
    ${Condition_}:last-child & {
        display: none;
    }
`

const Segments_ = styled.div`
    padding: ${spacing()};
    /* display: flex;
    gap: ${spacing()}; */
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    column-gap: ${spacing()};
    @media ${mq.smallMedium} {
        flex-direction: column;
        align-items: center;
        gap: ${spacing(0.5)};
    }
`
export default Condition
