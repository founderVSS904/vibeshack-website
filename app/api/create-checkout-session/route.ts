import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const STUDIOS: Record<string, { name: string; price: number; description: string }> = {
  'podcast-premium': {
    name: 'Premium Podcast Studio',
    price: 300,
    description: '3-camera 4K setup, broadcast audio, cameraman included.',
  },
  'podcast-modern': {
    name: 'Modern Podcast Studio',
    price: 300,
    description: '3-camera 4K setup, broadcast audio, cameraman included.',
  },
  'podcast-sunset': {
    name: 'The Sunset Room',
    price: 300,
    description: '3-camera 4K setup, broadcast audio, cameraman included.',
  },
  'podcast-cozy': {
    name: 'Cozy 2-Person Podcast',
    price: 300,
    description: '3-camera 4K setup, broadcast audio, cameraman included.',
  },
  'green-screen': {
    name: 'Green Screen Studio',
    price: 100,
    description: '750 sqft floor-to-ceiling green screen, lighting grid included.',
  },
  'photography': {
    name: 'Photography Studio',
    price: 100,
    description: 'Professional lighting, white backdrop, hair & makeup room.',
  },
  'video-removed': {
    name: 'Video Studio',
    price: 100,
    description: 'Cinema camera, interview lighting, hair & makeup room attached.',
  },
  'canvas-podcast': {
    name: 'Canvas',
    price: 400,
    description: 'Seamless white cyc wall, podcast setup with professional audio.',
  },
  'white-backdrop': {
    name: 'Canvas',
    price: 100,
    description: 'Seamless white cyc wall, overhead lighting grid.',
  },
  'sunset': {
    name: 'Sunset',
    price: 300,
    description: 'Programmable color backdrop. Broadcast audio. Cameraman included.',
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart, addons, totalAmount, name, email, phone } = body

    if (!cart?.length || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Build line items — one per cart item
    const line_items = cart.map((item: { studioName: string; date: string; slots: string[]; hours: number; price: number; studioId: string }) => {
      const dateStr = new Date(item.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      })
      const firstSlot = item.slots[0]
      const lastSlot = item.slots[item.slots.length - 1]
      const startTime = new Date(firstSlot).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })
      const endDate = new Date(lastSlot); endDate.setHours(endDate.getHours() + 1)
      const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.studioName} — VibeShack Studios`,
            description: `${dateStr} · ${startTime} – ${endTime} · ${item.hours}hr`,
            images: ['https://www.vibeshackstudios.com/og-image.jpg'],
          },
          unit_amount: item.price * 100,
        },
        quantity: 1,
      }
    })

    // Add add-on line items if present
    if (Array.isArray(addons) && addons.length > 0) {
      for (const addon of addons as { id: string; name: string; price: number }[]) {
        if (addon.price > 0) {
          line_items.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Add-on: ${addon.name}`,
                description: 'Optional add-on service',
                images: ['https://www.vibeshackstudios.com/og-image.jpg'],
              },
              unit_amount: addon.price * 100,
            },
            quantity: 1,
          })
        }
      }
    }

    // Build metadata — Stripe limit: 500 chars per value, 50 keys max.
    // We split cart items into individual keys (cart_0, cart_1, ...) to avoid overflow.
    const bookingRef = crypto.randomUUID()
    const firstItem = cart[0] as { studioId: string; studioName: string; date: string; slots: string[]; hours: number; price: number }

    const cartMetadata: Record<string, string> = {}
    cart.forEach((item: { studioId: string; studioName: string; date: string; slots: string[]; hours: number; price: number }, idx: number) => {
      // Compact representation: only essential fields
      const compact = JSON.stringify({
        id: item.studioId,
        n: item.studioName,
        d: item.date,
        s: item.slots,
        h: item.hours,
        p: item.price,
      })
      cartMetadata[`cart_${idx}`] = compact.slice(0, 500)
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      metadata: {
        bookingRef,
        customerName: name.slice(0, 500),
        customerEmail: email.slice(0, 500),
        customerPhone: (phone || '').slice(0, 500),
        studioName: firstItem.studioName.slice(0, 500),
        totalSessions: String(cart.length),
        totalAmount: String(totalAmount),
        ...cartMetadata,
      },
      success_url: `${baseUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Payment session failed' }, { status: 500 })
  }
}
