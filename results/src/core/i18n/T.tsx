// TODO: make reusable?
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'
import { useKeydownContext } from 'core/helpers/keydownContext'

const getGitHubSearchUrl = (k: string, localeId = 'en') =>
    `https://github.com/search?q=${k}+repo%3AStateOfJS%2Fstate-of-js-graphql-results-api+path%3A%2Fsrc%2Fi18n%2F${
        localeId || 'en'
    }%2F+path%3A%2Fsrc%2Fi18n%2Fen-US%2F&type=Code&ref=advsearch&l=&l=`

interface TProps {
    t?: string
    k: string
    values?: any
    md?: boolean
    html?: boolean
    isFallback?: boolean
    useShort?: boolean
    element?: string
    fallback?: string
}

export const T = ({
    t: override,
    k,
    values,
    md = false,
    html = false,
    fallback,
    isFallback = false,
    useShort = false,
    element
}: TProps) => {
    const { getString } = useI18n()
    const { modKeyDown } = useKeydownContext()

    // accept override to just use provided string as translation result
    let translation = override

    const props: any = {
        'data-key': k
    }
    const classNames = ['t']

    if (override) {
        classNames.push('t-override')
    } else {
        // FIXME: expects a fallabck value, not "isFallback boolean"
        const tFullString = getString(k, { values }, isFallback)
        const tShortString = getString(`${k}.short`, { values }, isFallback)

        const translationObject = useShort && !tShortString.missing ? tShortString : tFullString

        const handleClick = (e: React.MouseEvent<any>) => {
            // note: `fallback` here denotes whether a string is itself a fallback for a missing string
            if (modKeyDown) {
                e.preventDefault()
                e.stopPropagation()
                window.open(getGitHubSearchUrl(k, translationObject.locale.id))
            }
        }

        if (translationObject.t) {
            translation = md ? translationObject.tHtml || translationObject.t : translationObject.t
        } else {
            props.onClick = handleClick
            props.title = 'Cmd/ctrl-click to add missing translation'
            classNames.push(modKeyDown ? 't-modkeydown' : 't-modkeyup')
            // FIXME we don't have isFallback anymore
            if (translationObject.isFallback) {
                // a translation was found, but it's a fallback placeholder
                translation = md ? translationObject.tHtml : translationObject.t
                classNames.push('t-isFallback')
            } else if (fallback) {
                translation = fallback
                classNames.push('t-providedFallback')
            } else {
                // no translation was found
                translation = `[${translationObject.locale.id}] ${k}`
                classNames.push('t-missing')
            }
        }
    }

    props.className = classNames.join(' ')

    //<ReactMarkdown rehypePlugins={[rehypeRaw]}>{t}</ReactMarkdown>

    const isHtml = md || html
    const Element = element ? element : isHtml ? 'div' : 'span'

    return isHtml ? (
        <Element {...props} dangerouslySetInnerHTML={{ __html: translation }} />
    ) : (
        <Element {...props}>{translation}</Element>
    )
}

export default T
