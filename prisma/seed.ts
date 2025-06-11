import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use declaration merging to avoid redeclaration
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

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
        streetAddress: "123 Main Street",
        city: "New York",
        provinceState: "NY",
        country: "USA",
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
        name: "John Smith",
        email: "john@cutmaster.com",
        password: defaultPassword,
        phone: "+44 7700 900088",
        experience: 8,
        specialties: ["Fades", "Hair Design", "Hot Towel Shaves"],
        bio: "Specializing in modern styles and precise fades.",
        imageUrl: "/barber-profile-2.jpg",
        rating: 4.7,
        streetAddress: "456 Oak Avenue",
        city: "Los Angeles",
        provinceState: "CA",
        country: "USA",
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
      },
      {
        name: "Maria Garcia",
        email: "maria@cutmaster.com",
        password: defaultPassword,
        phone: "+1 555 123 4567",
        experience: 15,
        specialties: ["Hair Coloring", "Pixie Cuts", "Highlights"],
        bio: "Expert in hair coloring and modern cuts for all hair types.",
        imageUrl: "/barber-profile-3.jpg",
        rating: 4.8,
        streetAddress: "789 Elm Street",
        city: "Toronto",
        provinceState: "ON",
        country: "Canada",
        availability: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "09:00", end: "16:00" },
          sunday: null
        },
        languages: ["English", "Spanish", "French"],
        certificates: ["Color Specialist Certification", "Master Stylist"]
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