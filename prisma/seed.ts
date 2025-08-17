import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed voices...');

  const voices = [
    // English voices
    { name: 'Emma Watson', language: 'english' },
    { name: 'Morgan Freeman', language: 'english' },
    { name: 'Scarlett Johansson', language: 'english' },
    { name: 'Tom Hanks', language: 'english' },
    { name: 'Jennifer Lawrence', language: 'english' },
    { name: 'Leonardo DiCaprio', language: 'english' },
    { name: 'Meryl Streep', language: 'english' },
    { name: 'Brad Pitt', language: 'english' },
    { name: 'Angelina Jolie', language: 'english' },
    { name: 'Johnny Depp', language: 'english' },
    { name: 'Chris Evans', language: 'english' },
    { name: 'Chris Hemsworth', language: 'english' },
    { name: 'Robert Downey Jr.', language: 'english' },
    { name: 'Mark Ruffalo', language: 'english' },
    { name: 'Tom Holland', language: 'english' },
    { name: 'Zendaya', language: 'english' },
    { name: 'Anne Hathaway', language: 'english' },
    { name: 'Denzel Washington', language: 'english' },
    { name: 'Will Smith', language: 'english' },
    { name: 'Natalie Portman', language: 'english' },
    { name: 'Keira Knightley', language: 'english' },
    { name: 'Hugh Jackman', language: 'english' },
    { name: 'Daniel Radcliffe', language: 'english' },
    { name: 'Rupert Grint', language: 'english' },
    { name: 'Matthew McConaughey', language: 'english' },
    { name: 'Jake Gyllenhaal', language: 'english' },
    { name: 'Christian Bale', language: 'english' },
    { name: 'Heath Ledger', language: 'english' },
    { name: 'Emma Stone', language: 'english' },
    { name: 'Ryan Gosling', language: 'english' },

    // Nepali voices
    { name: 'Narayan Gopal', language: 'nepali' },
    { name: 'Ambar Gurung', language: 'nepali' },
    { name: 'Tara Devi', language: 'nepali' },
    { name: 'Kumar Basnet', language: 'nepali' },
    { name: 'Sabin Rai', language: 'nepali' },
    { name: 'Deepak Bajracharya', language: 'nepali' },
    { name: 'Nepathya', language: 'nepali' },
    { name: 'Phiroj Shyangden', language: 'nepali' },
    { name: 'Adrian Pradhan', language: 'nepali' },
    { name: 'Swoopna Suman', language: 'nepali' },
    { name: 'Ani Choying Dolma', language: 'nepali' },
    { name: 'Prakash Shrestha', language: 'nepali' },
    { name: 'Ram Krishna Dhakal', language: 'nepali' },
    { name: 'Udit Narayan Jha', language: 'nepali' },
    { name: 'Manoj Kumar KC', language: 'nepali' },
    { name: 'Rajesh Payal Rai', language: 'nepali' },
    { name: 'Sugam Pokharel', language: 'nepali' },
    { name: 'Anju Panta', language: 'nepali' },
    { name: 'Nima Rumba', language: 'nepali' },
    { name: 'Shiva Pariyar', language: 'nepali' },
    { name: 'Hemanta Rana', language: 'nepali' },
    { name: 'Karma Band', language: 'nepali' },
    { name: 'Satya Raj Acharya', language: 'nepali' },
    { name: 'Sanjay Shrestha', language: 'nepali' },
    { name: 'Kunti Moktan', language: 'nepali' },
    { name: 'Aruna Lama', language: 'nepali' },
    { name: 'Melina Rai', language: 'nepali' },
    { name: 'Astha Raut', language: 'nepali' },
    { name: 'Pramod Kharel', language: 'nepali' },
    { name: 'Indira Joshi', language: 'nepali' },

    // Indian voices
    { name: 'Amitabh Bachchan', language: 'indian' },
    { name: 'Lata Mangeshkar', language: 'indian' },
    { name: 'Shah Rukh Khan', language: 'indian' },
    { name: 'Aishwarya Rai', language: 'indian' },
    { name: 'Priyanka Chopra', language: 'indian' },
    { name: 'Deepika Padukone', language: 'indian' },
    { name: 'Ranbir Kapoor', language: 'indian' },
    { name: 'Alia Bhatt', language: 'indian' },
    { name: 'Aamir Khan', language: 'indian' },
    { name: 'Kajol', language: 'indian' },
    { name: 'Kishore Kumar', language: 'indian' },
    { name: 'Arijit Singh', language: 'indian' },
    { name: 'Sonu Nigam', language: 'indian' },
    { name: 'Sunidhi Chauhan', language: 'indian' },
    { name: 'Shreya Ghoshal', language: 'indian' },
    { name: 'Salman Khan', language: 'indian' },
    { name: 'Hrithik Roshan', language: 'indian' },
    { name: 'Kangana Ranaut', language: 'indian' },
    { name: 'Rani Mukerji', language: 'indian' },
    { name: 'Rajinikanth', language: 'indian' },
    { name: 'Madhuri Dixit', language: 'indian' },
    { name: 'Rekha', language: 'indian' },
    { name: 'Juhi Chawla', language: 'indian' },
    { name: 'Anil Kapoor', language: 'indian' },
    { name: 'Farhan Akhtar', language: 'indian' },
    { name: 'Zoya Akhtar', language: 'indian' },
    { name: 'Ayushmann Khurrana', language: 'indian' },
    { name: 'Vicky Kaushal', language: 'indian' },
    { name: 'Kriti Sanon', language: 'indian' },
    { name: 'Varun Dhawan', language: 'indian' },
  ];

  // Clear existing voices (optional - remove if you want to keep existing data)
  await prisma.voice.deleteMany({});

  // Insert all voices
  for (const voice of voices) {
    await prisma.voice.create({
      data: voice,
    });
    console.log(`✅ Created voice: ${voice.name} (${voice.language})`);
  }

  console.log(`🎉 Seeding finished! Created ${voices.length} voices.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
