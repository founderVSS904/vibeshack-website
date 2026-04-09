import { groq } from 'next-sanity'

export const studiosQuery = groq`
  *[_type == "studio"] | order(order asc) {
    _id,
    id,
    name,
    description,
    price,
    tag,
    type,
    "heroImage": heroImage.asset->url,
    "photos": photos[].asset->url,
    includes,
    prep,
    series,
  }
`

export const studioByIdQuery = groq`
  *[_type == "studio" && id == $studioId][0] {
    _id,
    id,
    name,
    description,
    price,
    tag,
    type,
    "heroImage": heroImage.asset->url,
    "photos": photos[].asset->url,
    includes,
    prep,
    series,
  }
`

export const homepageQuery = groq`
  *[_type == "homepage"][0] {
    _id,
    tagline,
    statement,
    differentiators,
    "filmStripImages": filmStripImages[].asset->url,
    ctaText,
    ctaLink,
  }
`

export const addOnsQuery = groq`
  *[_type == "addOn"] | order(order asc) {
    _id,
    id,
    name,
    description,
    price,
  }
`

export const brandWallQuery = groq`
  *[_type == "brandWall"] | order(order asc) {
    _id,
    clientName,
    "logo": logo.asset->url,
  }
`
