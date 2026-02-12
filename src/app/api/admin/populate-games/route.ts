
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

const TEST_GAMES = [
  { name: 'The Witcher 3: Wild Hunt', slug: 'the-witcher-3', description: 'Open-world RPG masterpiece with incredible storytelling', image: 'https://images.rawg.io/media/games/511/511316.jpg', price: 39.99 },
  { name: 'Cyberpunk 2077', slug: 'cyberpunk-2077', description: 'Futuristic action RPG set in dystopian Night City', image: 'https://images.rawg.io/media/games/b45/b45575f34285f2c4f310512491f3079b.jpg', price: 49.99 },
  { name: 'Elden Ring', slug: 'elden-ring', description: 'Action RPG by FromSoftware with challenging gameplay', image: 'https://images.rawg.io/media/games/d58/d588947d4f2b63ec2d4a1fac37f98e21.jpg', price: 59.99 },
  { name: "Baldur's Gate 3", slug: 'baldurs-gate-3', description: 'Epic fantasy RPG adventure with endless possibilities', image: 'https://images.rawg.io/media/games/34b/34b1f1a27ecbe62cadc63b27.jpg', price: 59.99 },
  { name: 'Starfield', slug: 'starfield', description: 'Space exploration RPG from Bethesda', image: 'https://images.rawg.io/media/games/713/71379637cd87ce83ed88dae94acacd10.jpg', price: 69.99 },
  { name: 'Final Fantasy XVI', slug: 'final-fantasy-xvi', description: 'Leading-edge JRPG from Square Enix', image: 'https://images.rawg.io/media/games/a32/a328e5637025fdf8ef38b643ee9e7d1c.jpg', price: 59.99 },
  { name: 'Helldivers 2', slug: 'helldivers-2', description: 'Cooperative third-person shooter', image: 'https://images.rawg.io/media/games/3ad/3ada9e1f1a59bb95e6d08ce33f0a48ae.jpg', price: 39.99 },
  { name: 'Dragon Age: The Veilguard', slug: 'dragon-age-veilguard', description: 'Dark fantasy RPG with tactical combat', image: 'https://images.rawg.io/media/games/35b/35bfb0e7c9a5c8e8c1f5d8b7.jpg', price: 59.99 },
  { name: 'Palworld', slug: 'palworld', description: 'Monster-catching adventure with action gameplay', image: 'https://images.rawg.io/media/games/b22/b22c89d2594602aa0a21708c9c9f91d0.jpg', price: 29.99 },
  { name: 'Black Myth: Wukong', slug: 'black-myth-wukong', description: 'Action RPG inspired by Chinese mythology', image: 'https://images.rawg.io/media/games/8cc/8cceef80109745c1cd01ce56e2c77b0f.jpg', price: 59.99 },
  { name: 'Indiana Jones and the Great Circle', slug: 'indiana-jones', description: 'Action-adventure game', image: 'https://images.rawg.io/media/games/e44/e447eae0863ab34267904a5577e26bc5.jpg', price: 69.99 },
  { name: 'Call of Duty: Modern Warfare III', slug: 'call-of-duty-mw3', description: 'Fast-paced military first-person shooter', image: 'https://images.rawg.io/media/games/e6a/e6a21f5f6e1f4d7b9e5e8c9d.jpg', price: 69.99 },
  { name: 'Alan Wake 2', slug: 'alan-wake-2', description: 'Psychological thriller with third-person action', image: 'https://images.rawg.io/media/games/7aa/7aa6cf6df04a901f5e1ad8c5.jpg', price: 59.99 },
  { name: 'Silent Hill 2 Remake', slug: 'silent-hill-2', description: 'Survival horror remake', image: 'https://images.rawg.io/media/games/f8f/f8f9be80a3d01e67e7fa0e7a.jpg', price: 59.99 },
  { name: 'Tekken 8', slug: 'tekken-8', description: 'Fighting game with dynamic characters', image: 'https://images.rawg.io/media/games/7c9/7c95b2db8dcd7b3b99e4e1f5.jpg', price: 59.99 },
];

export async function POST(req: Request) {
  try {
    console.log('📦 Starting to populate games...');

    const existingCount = await prisma.product.count();
    if (existingCount > 0) {
      return NextResponse.json({
        warning: `Database already has ${existingCount} games`,
        message: 'Skipping population to avoid duplicates'
      }, { status: 200 });
    }

    const genres = ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy'];
    const genreMap: Record<string, any> = {};

    for (const genreName of genres) {
      const genre = await prisma.category.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });
      genreMap[genreName] = genre;
    }

    console.log(`✅ Created ${genres.length} genres`);

    let addedCount = 0;
    for (let i = 0; i < TEST_GAMES.length; i++) {
      const game = TEST_GAMES[i];

      const product = await prisma.product.create({
        data: {
          rawgId: 1000 + i,
          rawgSlug: game.slug,
          name: game.name,
          description: game.description,
          backgroundImage: game.image,
          releasedDate: new Date(2023 + Math.floor(i / 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          price: game.price,
          digitalKey: Math.random().toString(36).substring(2, 15).toUpperCase(),
          stockQuantity: Math.floor(Math.random() * 50) + 10,
          isActive: true,
        },
      });

      const genreCount = Math.floor(Math.random() * 3) + 1;
      const selectedGenres = genres.sort(() => Math.random() - 0.5).slice(0, genreCount);

      for (const genreName of selectedGenres) {
        await prisma.productCategory.create({
          data: {
            productId: product.id,
            categoryId: genreMap[genreName].id,
          },
        });
      }

      addedCount++;
      console.log(`✅ Added game ${addedCount}/${TEST_GAMES.length}: ${game.name}`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedCount} games to database`,
      gamesCount: addedCount,
      genresCount: genres.length
    });
  } catch (error) {
    console.error('❌ Error populating games:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to populate games'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const gamesCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    const usersCount = await prisma.user.count();

    return NextResponse.json({
      status: 'Database statistics',
      games: gamesCount,
      categories: categoriesCount,
      users: usersCount,
      message: gamesCount === 0 ? 'POST to this endpoint to populate with test games' : 'Database already populated'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
