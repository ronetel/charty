
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcrypt'
import 'dotenv/config'

const RAWG_KEY = process.env.RAWG_KEY

const connectionString = process.env.DATABASE_URL!
if (!connectionString) throw new Error('DATABASE_URL is missing')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

function randomPrice(): number {
  return parseFloat((Math.random() * (59.99 - 9.99) + 9.99).toFixed(2))
}

function randomKey(): string {
  return Math.random().toString(36).substring(2, 15).toUpperCase()
}

async function seedRolesAndAdmin() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  })

  const passwordHash = hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
  const email = process.env.ADMIN_EMAIL || 'admin@mail.com'

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, login: 'Admin User' },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  })
}

async function fetchJson(url: string, timeoutMs = 10000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGameDetails(id: number) {
  if (!RAWG_KEY) return null
  const url = `https://api.rawg.io/api/games/${id}?key=${RAWG_KEY}`
  return fetchJson(url, 5000)
}

async function fetchPopularSteamGames(target = 200) {
  if (!RAWG_KEY) throw new Error('RAWG_KEY is required for seeding popular games')

  console.log(`📊 RAWG_KEY: ${RAWG_KEY.substring(0, 5)}...`)
  console.log(`🎯 Targeting ${target} popular games...`)

  const perPage = 40
  let page = 1
  const collected: any[] = []
  const maxPages = 10
  let checked = 0
  let skippedNoDetail = 0
  let skippedNoSteam = 0
  let skippedNoPC = 0

  while (collected.length < target && page <= maxPages) {
    const listUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=${perPage}&page=${page}&ordering=-rating`
    console.log(`📄 Fetching page ${page}: ${listUrl}`)

    const list = await fetchJson(listUrl, 10000)
    if (!list || !list.results || list.results.length === 0) {
      console.warn(`⚠️ No results on page ${page}`)
      break
    }

    console.log(`✓ Page ${page} has ${list.results.length} games`)

    for (const g of list.results) {
      if (collected.length >= target) break

      checked++

      const details = await fetchGameDetails(g.id).catch(() => null)
      if (!details) {
        skippedNoDetail++
        continue
      }

      const stores = details.stores || []
      const hasSteam = stores.some((s: any) => {
        const store = s.store || s
        if (!store) return false
        const slug = (store.slug || '').toLowerCase()
        const name = (store.name || '').toLowerCase()
        return slug === 'steam' || name === 'steam'
      })
      if (!hasSteam) {
        skippedNoSteam++
        continue
      }

      const platforms = details.platforms || []
      const hasPC = platforms.some((p: any) => {
        const name = (p.platform?.name || p.platform || '').toLowerCase()
        return name.includes('pc') || name.includes('windows')
      })
      if (!hasPC) {
        skippedNoPC++
        continue
      }

      collected.push(details)
      console.log(`  ✓ Added: ${details.name}`)
    }

    page += 1
  }

  console.log(`📈 Stats: checked=${checked}, noDetail=${skippedNoDetail}, noSteam=${skippedNoSteam}, noPC=${skippedNoPC}, collected=${collected.length}`)

  if (collected.length < 50) {
    console.log(`⚠️ Only ${collected.length} Steam/PC games found. Fetching additional top-rated games...`)

    page = 1
    while (collected.length < target && page <= 5) {
      const listUrl = `https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=${perPage}&page=${page}&ordering=-rating`
      const list = await fetchJson(listUrl, 10000)
      if (!list?.results?.length) break

      for (const g of list.results) {
        if (collected.length >= target) break

        if (collected.some(c => c.id === g.id)) continue

        const details = await fetchGameDetails(g.id).catch(() => null)
        if (!details) continue

        const platforms = details.platforms || []
        const hasPC = platforms.some((p: any) => {
          const name = (p.platform?.name || p.platform || '').toLowerCase()
          return name.includes('pc') || name.includes('windows')
        })
        if (hasPC) {
          collected.push(details)
          console.log(`  + Added (no Steam filter): ${details.name}`)
        }
      }
      page += 1
    }
  }

  return collected
}

async function up() {
  await seedRolesAndAdmin()

  if (!RAWG_KEY) {
    console.error('❌ RAWG_KEY is NOT set in environment variables!')
    throw new Error('RAWG_KEY must be set in environment to seed games from RAWG API')
  }

  console.log('🌐 Fetching popular Steam/PC games from RAWG...')
  const games = await fetchPopularSteamGames(200)
  console.log(`🔎 Found ${games.length} popular games to seed`)

  if (games.length === 0) {
    console.error('❌ No games collected from RAWG API!')
    throw new Error('Failed to collect any games from RAWG')
  }

  let added = 0
  for (const details of games) {
    try {
      const rawgId = details.id as number
      const slug = details.slug
      const name = details.name
      const backgroundImage = details.background_image || null
      const description = (details.description_raw || details.name).substring(0, 2000)
      const released = details.released ? new Date(details.released) : null
      const price = randomPrice()
      const digitalKey = randomKey()
      const rating = details.rating || 0
      const addedCount = details.added || 0
      const website = details.website || null
      const metacritic = details.metacritic || null

      const metadata = {
        developers: (details.developers || []).map((d: any) => ({ name: d.name })),
        publishers: (details.publishers || []).map((p: any) => ({ name: p.name })),
        platforms: (details.platforms || []).map((p: any) => ({
          platform: {
            name: p.platform?.name || '',
            slug: p.platform?.slug || ''
          }
        })),
        ratings: details.ratings || [],
        stores: (details.stores || []).map((s: any) => ({
          store: {
            domain: s.store?.domain || '',
            name: s.store?.name || '',
            slug: s.store?.slug || ''
          }
        })),
      }

      const product = await prisma.product.create({
        data: {
          rawgId,
          rawgSlug: slug,
          name,
          description,
          backgroundImage,
          releasedDate: released,
          price,
          digitalKey,
          stockQuantity: 100,
          isActive: true,
          rating,
          added: addedCount,
          website: website || undefined,
          metacritic: metacritic || undefined,
          metadata: metadata as any,
        } as any,
      })

      added++
      if (added % 10 === 0) {
        console.log(`  📦 Added ${added} games...`)
      }

      const genres = details.genres || []
      for (const gen of genres) {
        if (!gen?.name) continue
        const category = await prisma.category.upsert({
          where: { name: gen.name },
          update: {},
          create: { name: gen.name },
        })
        await prisma.productCategory.create({
          data: {
            productId: product.id,
            categoryId: category.id,
          },
        })
      }
    } catch (e) {
      console.error(`❌ Error seeding game "${details.name}":`, (e as Error).message)
    }
  }

  console.log(`✅ Seeded ${added}/${games.length} popular games.`)
}

async function down() {
  await prisma.productCategory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
}

async function main() {
  try {
    console.log('🧹 Clearing database...')
    await down()
    console.log('🌱 Seeding database...')
    await up()
    console.log('✅ Seed completed!')
  } catch (e) {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })