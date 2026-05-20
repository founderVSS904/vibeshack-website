export default function PricingLayout({ children }: { children: React.ReactNode }) {
  // Price specification schemas for each studio tier
  const priceSpecifications = {
    podcast: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      price: '300',
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        unitCode: 'HUR',
        value: '1',
      },
    },
    rental: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      price: '100',
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        unitCode: 'HUR',
        value: '1',
      },
    },
    canvasPodcast: {
      '@context': 'https://schema.org',
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      price: '400',
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        unitCode: 'HUR',
        value: '1',
      },
    },
  }

  // Service schema for studio booking
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Professional Studio Rental',
    description: 'Professional production studio rental in San Francisco. Podcast studios, green screen, photography studio rental, and white cyc rooms. Open 24/7.',
    provider: {
      '@type': 'LocalBusiness',
      name: 'VibeShack Studios',
      url: 'https://www.vibeshackstudios.com/',
    },
    areaServed: {
      '@type': 'City',
      name: 'San Francisco',
      url: 'https://en.wikipedia.org/wiki/San_Francisco',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'VibeShack Studios Pricing',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Podcast Studios',
          price: '300',
          priceCurrency: 'USD',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          availableDeliveryMethod: 'https://schema.org/OnSitePickup',
        },
        {
          '@type': 'Offer',
          name: 'Canvas Podcast Studio',
          price: '400',
          priceCurrency: 'USD',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          availableDeliveryMethod: 'https://schema.org/OnSitePickup',
        },
        {
          '@type': 'Offer',
          name: 'Rental Studios (Green Screen, Photography Studio)',
          price: '100',
          priceCurrency: 'USD',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          availableDeliveryMethod: 'https://schema.org/OnSitePickup',
        },
        {
          '@type': 'Offer',
          name: 'Photo Services',
          availability: 'https://schema.org/InStock',
          availableDeliveryMethod: 'https://schema.org/OnSitePickup',
          description: 'Contact VibeShack Studios for a scoped photo services quote.',
        },
        {
          '@type': 'Offer',
          name: 'Video Production Services',
          availability: 'https://schema.org/InStock',
          availableDeliveryMethod: 'https://schema.org/OnSitePickup',
          description: 'Contact VibeShack Studios for a scoped video production quote.',
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSpecifications.podcast) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSpecifications.rental) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSpecifications.canvasPodcast) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  )
}
