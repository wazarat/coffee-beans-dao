import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const beans = [
  {
    name: "Ethiopian Yirgacheffe",
    origin: "Ethiopia",
    region: "Yirgacheffe, Gedeo Zone",
    process: "Washed",
    roastLevel: "Light",
    flavorNotes: ["Blueberry", "Jasmine", "Lemon zest", "Honey"],
    description:
      "A classic Ethiopian single-origin known for its bright acidity, floral aroma, and delicate fruit-forward sweetness. Widely regarded as one of the finest coffees in the world.",
    moqKg: 300,
    pricePerKg: 18.5,
    available: true,
  },
  {
    name: "Colombian Supremo",
    origin: "Colombia",
    region: "Huila",
    process: "Washed",
    roastLevel: "Medium",
    flavorNotes: ["Caramel", "Red apple", "Chocolate", "Nutty"],
    description:
      "Grown at high altitudes in Huila, this Supremo-grade bean delivers a balanced cup with rich caramel sweetness and a clean, smooth finish.",
    moqKg: 500,
    pricePerKg: 14.0,
    available: true,
  },
  {
    name: "Guatemalan Antigua",
    origin: "Guatemala",
    region: "Antigua Valley",
    process: "Washed",
    roastLevel: "Medium-Dark",
    flavorNotes: ["Dark chocolate", "Spice", "Smoky", "Brown sugar"],
    description:
      "Volcanic soil and ideal micro-climate produce a full-bodied coffee with rich chocolate notes and a distinctive smoky finish unique to the Antigua Valley.",
    moqKg: 250,
    pricePerKg: 16.0,
    available: true,
  },
  {
    name: "Kenyan AA",
    origin: "Kenya",
    region: "Nyeri County",
    process: "Washed",
    roastLevel: "Light-Medium",
    flavorNotes: ["Blackcurrant", "Grapefruit", "Tomato", "Brown sugar"],
    description:
      "Kenyan AA grade beans from Nyeri are prized for their bold, wine-like acidity and complex fruit flavors. A standout for specialty coffee enthusiasts.",
    moqKg: 200,
    pricePerKg: 22.0,
    available: true,
  },
  {
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    region: "North Sumatra",
    process: "Wet-hulled (Giling Basah)",
    roastLevel: "Dark",
    flavorNotes: ["Earthy", "Cedar", "Dark chocolate", "Tobacco"],
    description:
      "A heavy-bodied Indonesian classic with low acidity, deep earthy tones, and a syrupy mouthfeel. Perfect for those who prefer bold, full-flavored coffee.",
    moqKg: 400,
    pricePerKg: 12.5,
    available: true,
  },
  {
    name: "Brazilian Santos",
    origin: "Brazil",
    region: "Minas Gerais",
    process: "Natural (dry)",
    roastLevel: "Medium",
    flavorNotes: ["Peanut", "Milk chocolate", "Toffee", "Low acidity"],
    description:
      "Brazil's most famous export-grade bean. Sweet, nutty, and smooth with minimal acidity — an excellent base for espresso blends or a dependable single-origin.",
    moqKg: 600,
    pricePerKg: 10.0,
    available: true,
  },
  {
    name: "Costa Rican Tarrazú",
    origin: "Costa Rica",
    region: "Tarrazú",
    process: "Honey",
    roastLevel: "Medium",
    flavorNotes: ["Peach", "Honey", "Bright acidity", "Vanilla"],
    description:
      "Honey-processed Tarrazú beans offer a juicy sweetness and vibrant acidity. Grown at 1,500+ meters in volcanic soil for exceptional clarity of flavor.",
    moqKg: 200,
    pricePerKg: 19.0,
    available: true,
  },
  {
    name: "Rwandan Bourbon",
    origin: "Rwanda",
    region: "Lake Kivu",
    process: "Washed",
    roastLevel: "Light",
    flavorNotes: ["Orange", "Floral", "Silky body", "Tea-like"],
    description:
      "A rising star in specialty coffee, Rwandan Bourbon beans deliver a tea-like elegance with citrus brightness and a silky, clean finish.",
    moqKg: 150,
    pricePerKg: 20.0,
    available: true,
  },
];

async function main() {
  console.log("Seeding coffee beans...");

  for (const bean of beans) {
    await prisma.coffeeBean.upsert({
      where: { id: bean.name.toLowerCase().replace(/\s+/g, "-") },
      update: bean,
      create: { id: bean.name.toLowerCase().replace(/\s+/g, "-"), ...bean },
    });
  }

  console.log(`Seeded ${beans.length} coffee beans.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
