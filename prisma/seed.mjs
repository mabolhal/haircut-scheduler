import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Your seeding logic here
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.barber.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      phone: '+1234567890',
      experience: 5,
      specialties: ['Haircut', 'Beard Trim'],
      bio: 'I am a barber with 5 years of experience.',
      imageUrl: 'https://via.placeholder.com/150',
      rating: 4.5,
      priceHaircut: 20,
      priceBeard: 15,
      priceBoth: 30,
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
      
    }}}
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 