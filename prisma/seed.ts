const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Delete existing data (optional)
  await prisma.appointment.deleteMany({});
  await prisma.barber.deleteMany({});

  // Create default password hash
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Create barbers
  const barbers = await prisma.barber.createMany({
    data: [
      {
        name: "Alex Thompson",
        email: "alex@cutmaster.com",
        password: defaultPassword,
        phone: "+44 7700 900077",
        experience: 12,
        specialties: ["Classic Cuts", "Modern Fades", "Beard Sculpting"],
        bio: "Master barber with over a decade of experience.",
        imageUrl: "/barber-profile.jpg",
        rating: 4.9,
        priceHaircut: 30.00,
        priceBeard: 20.00,
        priceBoth: 45.00,
        availability: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "10:00", end: "15:00" },
          sunday: null
        },
        languages: ["English", "Spanish"],
        certificates: ["Master Barber License"]
      },
      {
        id: 2, // Explicitly set ID
        name: "John Smith",
        email: "john@cutmaster.com",
        password: defaultPassword,
        phone: "+44 7700 900088",
        experience: 8,
        specialties: ["Fades", "Hair Design", "Hot Towel Shaves"],
        bio: "Specializing in modern styles and precise fades.",
        imageUrl: "/barber-profile-2.jpg",
        rating: 4.7,
        priceHaircut: 28.00,
        priceBeard: 18.00,
        priceBoth: 42.00,
        availability: {
          monday: { start: "10:00", end: "18:00" },
          tuesday: { start: "10:00", end: "18:00" },
          wednesday: { start: "10:00", end: "18:00" },
          thursday: { start: "10:00", end: "18:00" },
          friday: { start: "10:00", end: "18:00" },
          saturday: null,
          sunday: null
        },
        languages: ["English"],
        certificates: ["Advanced Hair Design"]
      }
    ]
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 