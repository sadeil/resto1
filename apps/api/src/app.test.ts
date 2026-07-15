import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type AppModule = typeof import("./app.js");
let module: AppModule;

beforeAll(async () => {
  process.env.DATABASE_URL ??=
    "postgresql://postgres:postgres@localhost:5432/k2nobeit?schema=public";
  process.env.JWT_SECRET ??= "test-secret-that-is-at-least-32-characters-long";
  process.env.NODE_ENV = "test";
  module = await import("./app.js");
});

afterAll(async () => {
  await module.prisma.$disconnect();
});

describe("public API", () => {
  it("reports a healthy service", async () => {
    const response = await request(module.default).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("healthy");
  });

  it("returns the ordered bilingual hot drinks with their add-ons", async () => {
    const expected = [
      ["سنغل اسبريسو", "Single Espresso", "8"],
      ["دبل اسبريسو", "Double Espresso", "10"],
      ["امريكانو", "Americano", "12"],
      ["كابتشينو", "Cappuccino", "15"],
      ["كافيه لاتيه", "Cafe Latte", "15"],
      ["كراميل لاتيه", "Caramel Latte", "15"],
      ["شاي لاتيه", "Chai Latte", "15"],
      ["بندق لاتيه", "Hazelnut Latte", "15"],
      ["سبانيش لاتيه", "Spanish Latte", "15"],
      ["بستاشيو لاتيه", "Pistachio Latte", "15"],
      ["لوتس لاتيه", "Lotus Latte", "15"],
      ["موكا لاتيه", "Mocha Latte", "15"],
      ["وايت موكا لاتيه", "White Mocha Latte", "15"],
      ["هوت شوكليت", "Hot Chocolate", "15"],
      ["فرنش فانيلا", "French Vanilla", "15"],
      ["سولتد كراميل", "Salted Caramel", "15"],
      ["نسكافيه مع حليب", "Nescafe With Milk", "15"],
      ["زنجبيل وقرفة وعسل", "Ginger & Cinnamon With Honey", "15"],
      ["زهورات", "Mixed Herbs", "12"],
      ["شاي أخضر", "Green Tea", "10"],
      [
        "شاي (نعنع / ميرمية / زعتمانة)",
        "Black Tea (Mint / Siege / Zatmana)",
        "10",
      ],
      ["قهوة عربية", "Arabic Coffee", "10"],
      ["سحلب", "Sahlab", "15"],
    ] as const;

    const response = await request(module.default).get("/api/menu");
    expect(response.status).toBe(200);
    const drinks = response.body.data.categories.find(
      (category: { name: string }) => category.name === "المشروبات الساخنة",
    );
    expect(drinks).toBeDefined();
    expect(drinks.items).toHaveLength(23);
    expect(
      drinks.items.map(
        (item: { name: string; description: string; price: string }) => [
          item.name,
          item.description,
          item.price,
        ],
      ),
    ).toEqual(expected);
    expect(drinks.items[0].subcategory.name).toBe("مشروبات ساخنة");
    expect(
      drinks.items[0].addOns.map(
        (addOn: { name: string; nameEn: string; price: string }) => [
          addOn.name,
          addOn.nameEn,
          addOn.price,
        ],
      ),
    ).toEqual([
      ["إضافة عسل", "Add Honey", "3"],
      ["إضافة زنجبيل", "Add Ginger", "3"],
      ["إضافة شوت اسبريسو", "Add Espresso Shot", "5"],
    ]);
  });

  it("returns a structured 404 for unknown routes", async () => {
    const response = await request(module.default).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("returns Argeeleh as the fifth bilingual category with separate add-ons", async () => {
    const response = await request(module.default).get("/api/menu");
    expect(response.status).toBe(200);
    const categories = response.body.data.categories;
    const argeeleh = categories[4];
    expect(argeeleh.name).toBe("الأراجيل");
    expect(argeeleh.description).toBe("Argeeleh");
    expect(
      argeeleh.items.map(
        (item: { name: string; description: string; price: string }) => [
          item.name,
          item.description,
          item.price,
        ],
      ),
    ).toEqual([
      ["أرجيلة تفاحتين", "Two Apples", "30"],
      ["أرجيلة ليمون ونعنع", "Lemon and Mint", "30"],
      ["أرجيلة مسكة وقرفة", "Cinnamon Gum", "30"],
    ]);
    expect(
      argeeleh.items[0].addOns.map(
        (addOn: { name: string; nameEn: string; price: string }) => [
          addOn.name,
          addOn.nameEn,
          addOn.price,
        ],
      ),
    ).toEqual([
      ["إضافة بربيج صحي", "Add a Healthy Pipe", "2"],
      ["تبديل الراس", "Change the Bowl", "10"],
    ]);
  });

  it("returns cold drinks in four ordered bilingual groups", async () => {
    const response = await request(module.default).get("/api/menu");
    expect(response.status).toBe(200);
    const cold = response.body.data.categories.find(
      (category: { name: string }) => category.name === "المشروبات الباردة",
    );
    expect(cold.description).toBe("Cold Drinks");
    expect(cold.items).toHaveLength(35);
    const grouped = new Map<
      string,
      Array<{
        name: string;
        description: string;
        price: string;
        subcategory: { id: string; name: string; nameEn: string };
      }>
    >();
    for (const item of cold.items) {
      const group = grouped.get(item.subcategory.id);
      if (group) group.push(item);
      else grouped.set(item.subcategory.id, [item]);
    }
    const groups = [...grouped.values()];
    expect(
      groups.map((group) => [
        group[0]!.subcategory.name,
        group[0]!.subcategory.nameEn,
        group.length,
      ]),
    ).toEqual([
      ["مشروبات باردة", "Cold Drinks", 14],
      ["ميلك شيك", "Milkshakes", 7],
      ["سموذي", "Smoothies", 7],
      ["عصائر ومشروبات خفيفة", "Soft Drinks", 7],
    ]);
    expect(cold.items.map((item: { name: string }) => item.name)).toEqual([
      "ايس امريكانو",
      "ايس كابتشينو",
      "ايس كافيه لاتيه",
      "ايس كراميل لاتيه",
      "ايس شاي لاتيه",
      "ايس بندق لاتيه",
      "ايس سبانيش لاتيه",
      "ايس بستاشيو لاتيه",
      "ايس لوتس لاتيه",
      "ايس موكا لاتيه",
      "ايس وايت موكا لاتيه",
      "ايس هوت شوكليت",
      "ايس فرنش فانيلا",
      "ايس سولتد كراميل",
      "ميلك شيك فراولة",
      "ميلك شيك بستاشيو",
      "ميلك شيك أوريو",
      "ميلك شيك لوتس",
      "ميلك شيك فانيلا",
      "ميلك شيك بريتزل",
      "ميلك شيك شوكولاتة",
      "سموذي مانجا",
      "سموذي فراولة",
      "سموذي ليمون ونعنع",
      "سموذي بيريز",
      "سموذي بطيخ",
      "سموذي أناناس",
      "اعمله ع كيفك!",
      "عصير برتقال",
      "عصير ليمون ونعنع",
      "عصير جزر",
      "مياه معدنية",
      "صودا",
      "اكس ال",
      "كولا / سبرايت / زيرو",
    ]);
    expect(cold.items.map((item: { price: string }) => item.price)).toEqual([
      ...Array(14).fill("15"),
      ...Array(14).fill("18"),
      "15",
      "15",
      "15",
      "5",
      "8",
      "12",
      "5",
    ]);
  });
});
