import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed default user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const defaultUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
    },
  });

  console.log("Created default user:", { email: defaultUser.email });

  // Seed checklist templates
  const packingTemplate = await prisma.checklistTemplate.upsert({
    where: { id: "template-packing" },
    update: {},
    create: {
      id: "template-packing",
      name: "Family Packing List",
      description: "Essential items for a family trip",
      items: {
        create: [
          {
            title: "Passports for all travelers",
            category: "Documents",
            priority: "HIGH",
            order: 1,
          },
          {
            title: "Travel insurance documents",
            category: "Documents",
            priority: "HIGH",
            order: 2,
          },
          {
            title: "Flight/train tickets",
            category: "Documents",
            priority: "HIGH",
            order: 3,
          },
          {
            title: "Hotel confirmations",
            category: "Documents",
            priority: "HIGH",
            order: 4,
          },
          {
            title: "First aid kit",
            category: "Health",
            priority: "HIGH",
            order: 5,
          },
          {
            title: "Prescription medications",
            category: "Health",
            priority: "HIGH",
            order: 6,
          },
          {
            title: "Sunscreen",
            category: "Health",
            priority: "MEDIUM",
            order: 7,
          },
          {
            title: "Phone chargers",
            category: "Electronics",
            priority: "HIGH",
            order: 8,
          },
          {
            title: "Power adapter",
            category: "Electronics",
            priority: "MEDIUM",
            order: 9,
          },
          {
            title: "Camera",
            category: "Electronics",
            priority: "LOW",
            order: 10,
          },
          {
            title: "Snacks for kids",
            category: "Food",
            priority: "MEDIUM",
            order: 11,
          },
          {
            title: "Travel games/activities",
            category: "Entertainment",
            priority: "LOW",
            order: 12,
          },
        ],
      },
    },
  });

  // Seed regional notes for France
  const franceNotes = [
    {
      country: "France",
      destination: "Paris",
      category: "Transport",
      title: "Paris Metro Tips",
      content:
        "Buy a carnet (10-ticket pack) for savings. The Navigo pass is great for unlimited travel. Metro runs 5:30am–1am (2am on weekends). Taxis are metered — avoid unlicensed drivers.",
    },
    {
      country: "France",
      destination: null,
      category: "Customs",
      title: "French Dining Etiquette",
      content:
        'Lunch is typically 12–2pm, dinner after 7:30pm. Service is included (service compris) — extra tipping is optional but appreciated. Say "Bonjour" when entering shops. Asking for tap water (carafe d\'eau) is perfectly acceptable and free.',
    },
    {
      country: "France",
      destination: null,
      category: "Health",
      title: "Healthcare & Pharmacies",
      content:
        "Pharmacies (green cross sign) are numerous and pharmacists can advise on minor ailments. EU citizens should carry EHIC card. Emergency: 15 (SAMU), 18 (fire), 17 (police), or 112.",
    },
    {
      country: "France",
      destination: "Paris",
      category: "Family",
      title: "Family-Friendly Paris",
      content:
        "Most museums are free for children under 18 (EU residents). Jardins du Luxembourg has a puppet theater and play areas. The Cité des Sciences et de l'Industrie in La Villette is excellent for kids. Many restaurants have children's menus.",
    },
  ];

  for (const note of franceNotes) {
    await prisma.regionalNote.create({ data: note });
  }

  // Seed regional notes for Indonesia
  const indonesiaNotes = [
    {
      country: "Indonesia",
      destination: "Bali",
      category: "Customs",
      title: "Temple Etiquette",
      content:
        "Always wear a sarong (usually provided) when visiting temples. Menstruating women are asked not to enter. Remove shoes before entering. Be respectful during religious ceremonies. Offerings on the ground should not be stepped over.",
    },
    {
      country: "Indonesia",
      destination: null,
      category: "Health",
      title: "Food & Water Safety",
      content:
        "Drink only bottled or filtered water. Be cautious with ice in drinks at local warungs. Avoid raw vegetables washed in tap water. Bali belly is common — carry oral rehydration salts. Consult a doctor about Hepatitis A, typhoid, and malaria prophylaxis.",
    },
    {
      country: "Indonesia",
      destination: "Bali",
      category: "Transport",
      title: "Getting Around Bali",
      content:
        "Grab (ride-hailing app) works well in most areas. Scooter rental is popular but be cautious — ensure you have an international license and wear a helmet. Traffic is chaotic in Kuta/Seminyak. Blue Bird taxis are metered and reliable.",
    },
    {
      country: "Indonesia",
      destination: null,
      category: "Money",
      title: "Currency & Payments",
      content:
        "Indonesian Rupiah (IDR). ATMs widely available in tourist areas. Many places are cash-only. Bargaining is expected at markets. Avoid money changers on the street — use authorised exchange offices or bank ATMs. Tipping not mandatory but appreciated.",
    },
  ];

  for (const note of indonesiaNotes) {
    await prisma.regionalNote.create({ data: note });
  }

  // Seed regional notes for Philippines
  const philippinesNotes = [
    {
      country: "Philippines",
      destination: null,
      category: "Customs",
      title: "Filipino Culture & Etiquette",
      content:
        '"Mano po" (taking elder\'s hand to forehead) shows respect. Filipinos are very hospitable — refusing food can be seen as rude. Smile and be patient. "Filipino time" means things may start late. Remove shoes when entering homes.',
    },
    {
      country: "Philippines",
      destination: "Palawan",
      category: "Nature",
      title: "Island Hopping Tips",
      content:
        "Book island hopping tours in advance during peak season (Dec–May). Puerto Princesa Underground River requires advance booking. Wear reef-safe sunscreen to protect coral. Plastic bags are banned in many areas — bring reusable bags. Always heed weather warnings — typhoon season is June–November.",
    },
    {
      country: "Philippines",
      destination: null,
      category: "Transport",
      title: "Getting Around",
      content:
        "Jeepneys are the iconic local transport (cheap but crowded). Tricycles for short distances. Grab works in Manila, Cebu, and Davao. Inter-island ferries connect major islands — book ahead. Domestic flights are affordable — Cebu Pacific and AirAsia serve most routes.",
    },
    {
      country: "Philippines",
      destination: null,
      category: "Health",
      title: "Health Precautions",
      content:
        "Dengue fever is present year-round — use mosquito repellent. Drink bottled water only. Medical facilities are good in cities but limited on remote islands. Travel insurance with evacuation cover is highly recommended. Check for any travel advisories in Mindanao.",
    },
  ];

  for (const note of philippinesNotes) {
    await prisma.regionalNote.create({ data: note });
  }

  console.log(
    `Seeded: 1 user, 1 template, ${franceNotes.length + indonesiaNotes.length + philippinesNotes.length} regional notes`,
  );
  console.log({ packingTemplate });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
