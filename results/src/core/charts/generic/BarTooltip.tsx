import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { isPercentage } from 'core/helpers/units'

const getLabel = (props, translate) => {
    const { id, bucketKeys, units, indexValue, data, i18nNamespace, shouldTranslate } = props
    const bucketKey = bucketKeys && bucketKeys.find(b => b.id === indexValue)
    const { entity } = data
    if (bucketKey?.label) {
        return bucketKey.label
    } else if (shouldTranslate) {
        return translate(`options.${i18nNamespace}.${indexValue}`)
    } else if (entity) {
        return entity.name
    } else {
        return indexValue
    }
}

/**
 * This tooltip can be used for general bar charts:
 * - HorizontalBarChart
 * - VerticalBarChart
 */
const BarTooltip = props => {
    const { id, bucketKeys, units, indexValue, data, i18nNamespace, shouldTranslate } = props
    const { translate } = useI18n()
    const label = getLabel(props, translate)

    const nivoTheme = useTheme()

    const units_ = id
    return (
        <div style={{ ...nivoTheme.tooltip.container, maxWidth: 300 }}>
            {label}:&nbsp;
            <strong>
                {data[units_]}
                {isPercentage(units) && '%'}
            </strong>
        </div>
    )
}

BarTooltip.propTypes = {
    indexValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    data: PropTypes.shape({
        percentage_survey: PropTypes.number,
        percentage_question: PropTypes.number,
        count: PropTypes.number.isRequired
    }).isRequired,
    units: PropTypes.string.isRequired,
    i18nNamespace: PropTypes.string.isRequired,
    shouldTranslate: PropTypes.bool.isRequired
}

export default memo(BarTooltip)
