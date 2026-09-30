import { useEffect } from 'react'

export interface DocumentMetaOptions {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'video.movie'
  jsonLd?: Record<string, unknown> | null
}

const SITE_NAME = 'MOVI'
const DEFAULT_DESC =
  'A global registry of movies and audiovisual content. Search any movie, discover where to stream it across 6 markets.'
const DEFAULT_IMAGE =
  'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg'

function upsertMeta(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrKey, attrVal)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useDocumentMeta({
  title,
  description,
  image,
  type = 'website',
  jsonLd,
}: DocumentMetaOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
    document.title = fullTitle

    const desc = description ?? DEFAULT_DESC
    const img = image ?? DEFAULT_IMAGE

    upsertMeta('meta[name="description"]', 'name', 'description', desc)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', desc)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', img)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type)
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME)
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc)
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img)

    const ldId = 'movi-ld-json'
    let ldScript = document.getElementById(ldId) as HTMLScriptElement | null

    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement('script')
        ldScript.id = ldId
        ldScript.type = 'application/ld+json'
        document.head.appendChild(ldScript)
      }
      ldScript.textContent = JSON.stringify(jsonLd)
    } else {
      ldScript?.remove()
    }

    return () => {
      document.getElementById(ldId)?.remove()
    }
  }, [title, description, image, type, jsonLd])
}
