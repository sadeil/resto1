import 'dotenv/config'; import {PrismaClient,PricingType} from '@prisma/client'; import bcrypt from 'bcrypt'; const db=new PrismaClient();
const categories=['🍳 الفطور','🍟 المقبلات','🥗 السلطات','🥪 الساندويشات','الأراجيل','🍔 البرجرات','🍽️ الوجبات','المشروبات الساخنة','المشروبات الباردة'] as const;
type Burger={name:string;price?:number;weight?:string;protein?:string;featured?:boolean;ingredients:string[];variants?:readonly [string,number][]};
type FixedItem={name:string;price:number;weight:string;protein:string;ingredients:string[]};
const burgers:Burger[]=[
 {name:'برغر كأنه بيت محشي عالفحم الطبيعي',price:53,weight:'240 غم',protein:'لحمة',featured:true,ingredients:['بصل مكرمل','جبنة','صوص كأنه بيت','موزتريلا']},
 {name:'برغر كأنه بيت عالفحم الطبيعي',variants:[['150 غم',43],['200 غم',53]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','مخلل','بندورة','خس','بصل أحمر','بصل مكرمل','صوص كأنه بيت','موزتريلا']},
 {name:'تشيز برغر',variants:[['150 غم',38],['200 غم',48]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','مخلل','بندورة','خس','بصل أحمر','كاتشاب','مايونيز','تشيدر']},
 {name:'سوبر تشيز برغر عالفحم الطبيعي',variants:[['150 غم',40],['200 غم',50]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','مخلل شبت','بصل أحمر','مايونيز','كاتشاب','تشيدر']},
 {name:'برغر أبو العط',variants:[['150 غم',38],['200 غم',48]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','بهار لحمة','مخلل','بندورة','خس','بصل أحمر','كاتشاب','مايونيز']},
 {name:'برغر أبو سمرة',variants:[['150 غم',38],['200 غم',48]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','بهار سجق','مخلل','بندورة','خس','بصل أحمر','كاتشاب','مايونيز']},
 {name:'برغر أبو الصف',variants:[['150 غم',43],['200 غم',53]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','مايونيز','كاتشاب','بصل أحمر','بندورة','هالبينو','فلفل أخضر مشوي','تشيدر','مخلل شبت']},
 {name:'برغر أبو القسم',variants:[['150 غم',45],['200 غم',55]],protein:'لحمة',ingredients:['لحمة، بحسب الحجم المختار','مايونيز','بصل أحمر','هالبينو','تشيدر','وايت صوص']},
 {name:'برغر دجاج',price:33,weight:'120 غم',protein:'دجاج',ingredients:['مخلل','بندورة','خس','بصل أحمر','كاتشاب','مايونيز']},
 {name:'برغر نباتي',price:28,ingredients:['بصل','مشروم طبيعي مكرمل','مخلل','بندورة','خس','بصل أحمر','صوص كأنه بيت']}
];
const addOns=[['جبنة موزتريلا',5],['جبنة تشيدر',5],['هالبينو',2],['لحمة 150 غم',20],['بطاطا ويدجز',7],['صوص تشيدر',7],['ماشروم',5],['بصل مكرمل',5],['بلو تشيز',8],['عالفحم',3],['100 غم دجاج',10],['أفوكادو',5]] as const;
const sandwiches:FixedItem[]=[
 {name:'ساندويش دجاج مع بطاطا حلوة ودبس رمان',price:28,weight:'150 غم',protein:'دجاج',ingredients:['بطاطا حلوة','بندورة','جرجير','متومة','بصل أبيض']},
 {name:'ساندويش دجاج بمخلل الزعتر البري',price:28,weight:'200 غم',protein:'دجاج',ingredients:['بندورة','جرجير','متومة']},
 {name:'ساندويش ستيك دجاج',price:28,weight:'200 غم',protein:'دجاج',ingredients:['بندورة','خس','مخلل','مايونيز']},
 {name:'ساندويش مسحب كأنه بيت',price:28,weight:'150 غم',protein:'دجاج',ingredients:['بندورة','مخلل','فليفلة','بصل أبيض','مايونيز','كاتشاب']},
 {name:'ساندويش ستيك لحمة مع جبنة',price:35,weight:'150 غم',protein:'لحمة',ingredients:['بصل','فليفلة','بندورة','مخلل','مايونيز','موزتريلا']},
 {name:'ساندويش دجاج بيستو',price:30,weight:'200 غم',protein:'دجاج',ingredients:['صوص بيستو','بندورة','زيتون أسود']},
 {name:'ساندويش البرتقال',price:30,weight:'200 غم',protein:'دجاج',ingredients:['مايونيز','مخلل','بندورة','فلفل حار']}
];
const sandwichAddOns=[['بطاطا جانبية',8],['سلطة عربية',8],['سلطة يونانية',15],['بطاطا ويدجز',10],['سلطة جرجير',10]] as const;
const breakfastPlates=[
 {name:'فطور كأنه بيت',price:40,ingredients:['2 سجق','2 بيض عيون','تشيري','ماشروم','سلطة','خبز']},
 {name:'صحن بيض',price:25,ingredients:['2 بيض','سلطة','خبز'],choice:{name:'طريقة التحضير',options:['مخفوق','عيون']}}
] as const;
const breakfastSandwiches=[
 {name:'ساندويش حلومي بيستو',price:28,ingredients:['جبنة حلومي','بيستو','بندورة','خيار','جرجير']},
 {name:'ساندويش سجق وبيض',price:28,ingredients:['مخلل','بيض','سجق','مايونيز']}
] as const;
const breakfastAddOns=[['سجق',10],['بيضة',3]] as const;
const appetizers=[
 {name:'صحن بطاطا',price:20,ingredients:[] as string[]},
 {name:'أجنحة دجاج (10)',price:30,ingredients:[] as string[],quantityLabel:'10 pieces',choice:{name:'اختيار الصوص',options:['Red Hot','باربكيو','سويت تشيلي']}},
 {name:'صحن بطاطا ويدجز',price:30,ingredients:[] as string[]},
 {name:'صحن بطاطا مع جبنة',price:30,ingredients:[] as string[]},
 {name:'ناتشوز',price:40,ingredients:[] as string[]}
];
const salads=[
 {name:'سلطة جرجير',price:28,ingredients:['جرجير','بندورة تشيري','بصل أحمر','جوز']},
 {name:'سلطة يونانية',price:30,ingredients:['بندورة تشيري','خس','خيار','فليفلة ملونة','زيتون أسود','جبنة فيتا','بصل أحمر']},
 {name:'سلطة دجاج',price:32,ingredients:['150 غم دجاج','خس','بندورة تشيري','بصل أحمر','فليفلة ملونة','خيار']},
 {name:'سلطة سيزر',price:35,ingredients:['دجاج','خبز مقلي','خس','جبنة بارميجان']}
] as const;
const saladAddOns=[['100 غم دجاج',10]] as const;
const meals=[
 {name:'وجبة ستيك دجاج مشوي عالفحم الطبيعي',price:40,weight:'250 غم',protein:'دجاج',ingredients:['متومة'],choice:{name:'اختيار الطبق الجانبي',options:['سلطة','بطاطا مقلية']}},
 {name:'وجبة دجاج ستراغنوف مع رز',price:40,weight:'150 غم',protein:'دجاج',ingredients:['فليفلة ملونة','بصل','رز']},
 {name:'وجبة رز ودجاج مع زعتر',price:35,weight:'200 غم',protein:'دجاج',ingredients:['مخلل زعتر','متومة','رز']},
 {name:'ستراغنوف لحمة',price:48,weight:'150 غم',protein:'لحمة',ingredients:['بصل','فليفلة','وايت صوص','رز']},
 {name:'ستراغنوف بيستو',price:45,weight:'150 غم',protein:'دجاج',ingredients:['متومة','تشيري','بيستو','وايت صوص','بارمجان','رز']}
];
const mealAddOns=[['100 غم دجاج',10],['إضافة رز',8]] as const;
const hotDrinks=[
 {name:'سنغل اسبريسو',english:'Single Espresso',price:8},
 {name:'دبل اسبريسو',english:'Double Espresso',price:10},
 {name:'امريكانو',english:'Americano',price:12},
 {name:'كابتشينو',english:'Cappuccino',price:15},
 {name:'كافيه لاتيه',english:'Cafe Latte',price:15},
 {name:'كراميل لاتيه',english:'Caramel Latte',price:15},
 {name:'شاي لاتيه',english:'Chai Latte',price:15},
 {name:'بندق لاتيه',english:'Hazelnut Latte',price:15},
 {name:'سبانيش لاتيه',english:'Spanish Latte',price:15},
 {name:'بستاشيو لاتيه',english:'Pistachio Latte',price:15},
 {name:'لوتس لاتيه',english:'Lotus Latte',price:15},
 {name:'موكا لاتيه',english:'Mocha Latte',price:15},
 {name:'وايت موكا لاتيه',english:'White Mocha Latte',price:15},
 {name:'هوت شوكليت',english:'Hot Chocolate',price:15},
 {name:'فرنش فانيلا',english:'French Vanilla',price:15},
 {name:'سولتد كراميل',english:'Salted Caramel',price:15},
 {name:'نسكافيه مع حليب',english:'Nescafe With Milk',price:15},
 {name:'زنجبيل وقرفة وعسل',english:'Ginger & Cinnamon With Honey',price:15},
 {name:'زهورات',english:'Mixed Herbs',price:12},
 {name:'شاي أخضر',english:'Green Tea',price:10},
 {name:'شاي (نعنع / ميرمية / زعتمانة)',english:'Black Tea (Mint / Siege / Zatmana)',price:10},
 {name:'قهوة عربية',english:'Arabic Coffee',price:10},
 {name:'سحلب',english:'Sahlab',price:15}
] as const;
const hotDrinkAddOns=[['إضافة عسل','Add Honey',3],['إضافة زنجبيل','Add Ginger',3],['إضافة شوت اسبريسو','Add Espresso Shot',5]] as const;
const argeelehItems=[
 {name:'أرجيلة تفاحتين',english:'Two Apples',price:30},
 {name:'أرجيلة ليمون ونعنع',english:'Lemon and Mint',price:30},
 {name:'أرجيلة مسكة وقرفة',english:'Cinnamon Gum',price:30}
] as const;
const argeelehAddOns=[['إضافة بربيج صحي','Add a Healthy Pipe',2],['تبديل الراس','Change the Bowl',10]] as const;
const coldDrinkGroups=[
 {id:'subcategory-cold-drinks',name:'مشروبات باردة',nameEn:'Cold Drinks',items:[
  ['ايس امريكانو','Iced Americano',15],['ايس كابتشينو','Iced Cappuccino',15],['ايس كافيه لاتيه','Iced Cafe Latte',15],['ايس كراميل لاتيه','Iced Caramel Latte',15],['ايس شاي لاتيه','Iced Chai Latte',15],['ايس بندق لاتيه','Iced Hazelnut Latte',15],['ايس سبانيش لاتيه','Iced Spanish Latte',15],['ايس بستاشيو لاتيه','Iced Pistachio Latte',15],['ايس لوتس لاتيه','Iced Lotus Latte',15],['ايس موكا لاتيه','Iced Mocha Latte',15],['ايس وايت موكا لاتيه','Iced White Mocha Latte',15],['ايس هوت شوكليت','Iced Chocolate',15],['ايس فرنش فانيلا','Iced French Vanilla',15],['ايس سولتد كراميل','Iced Salted Caramel',15]
 ]},
 {id:'subcategory-milkshakes',name:'ميلك شيك',nameEn:'Milkshakes',items:[
  ['ميلك شيك فراولة','Strawberry Milkshake',18],['ميلك شيك بستاشيو','Pistachio Milkshake',18],['ميلك شيك أوريو','Oreo MilkShake',18],['ميلك شيك لوتس','Lotus MilkShake',18],['ميلك شيك فانيلا','Vanilla Milkshake',18],['ميلك شيك بريتزل','Pretzel Milkshake',18],['ميلك شيك شوكولاتة','Chocolate Milkshake',18]
 ]},
 {id:'subcategory-smoothies',name:'سموذي',nameEn:'Smoothies',items:[
  ['سموذي مانجا','Mango Smoothie',18],['سموذي فراولة','Strawberry Smoothie',18],['سموذي ليمون ونعنع','Lemon & Mint Smoothie',18],['سموذي بيريز','Berries Smoothie',18],['سموذي بطيخ','Watermelon Smoothie',18],['سموذي أناناس','Pineapple Smoothie',18],['اعمله ع كيفك!','Make Your Own!',18]
 ]},
 {id:'subcategory-soft-drinks',name:'عصائر ومشروبات خفيفة',nameEn:'Soft Drinks',items:[
  ['عصير برتقال','Orange Juice',15],['عصير ليمون ونعنع','Lemon & Mint Juice',15],['عصير جزر','Carrot Juice',15],['مياه معدنية','Water',5],['صودا','Soda Water',8],['اكس ال','XL',12],['كولا / سبرايت / زيرو','Cola / Sprite / Zero',5]
 ]}
] as const;
async function main(){
 const password=process.env.SEED_ADMIN_PASSWORD;
 if(!password||password.length<12)throw new Error('Set SEED_ADMIN_PASSWORD (12+ chars) before seeding');
 const email=(process.env.SEED_ADMIN_EMAIL||'owner@k2nobeit.local').toLowerCase();
 await db.user.upsert({where:{email},update:{},create:{email,passwordHash:await bcrypt.hash(password,12)}});
 await db.restaurantSettings.upsert({where:{id:1},update:{},create:{id:1}});
 await db.category.updateMany({where:{name:'المشروبات'},data:{name:'المشروبات الساخنة'}});
 await db.menuItem.deleteMany({where:{OR:[{id:{startsWith:'seed-'}},{name:{in:['حمص بالطحينة','متبل باذنجان','مسخّن رول','مقلوبة البيت','قدرة خليلية','كنافة بيتية','مهلبية ماء الزهر']}}]}});
 await db.category.deleteMany({where:{name:{in:['مقبلات','أطباق البيت','حلويات']},items:{none:{}}}});
 for(const[i,name]of categories.entries()){
  await db.category.upsert({where:{name},update:{sortOrder:i},create:{name,sortOrder:i,published:true}});
 }
 await db.category.update({where:{name:'الأراجيل'},data:{description:'Argeeleh',active:true,published:true,deletedAt:null}});
 const category=await db.category.findUniqueOrThrow({where:{name:'🍔 البرجرات'}});
 await db.addOn.deleteMany({where:{category:'برغراتنا',id:{notIn:addOns.map((_,i)=>`addon-burger-${i+1}`)}}});
 const extras=[];
 for(const[i,[name,price]]of addOns.entries()){
  extras.push(await db.addOn.upsert({where:{id:`addon-burger-${i+1}`},update:{name,price,sortOrder:i,available:true,deletedAt:null,category:'برغراتنا'},create:{id:`addon-burger-${i+1}`,name,price,sortOrder:i,category:'برغراتنا'}}));
 }
 for(const[i,b]of burgers.entries()){
  const id=`burger-${i+1}`;
  await db.menuItem.upsert({
   where:{id},
   update:{categoryId:category.id,name:b.name,description:null,fullIngredients:b.ingredients,pricingType:b.variants?PricingType.VARIANTS:PricingType.FIXED,price:b.price??null,proteinType:b.protein??null,proteinWeight:b.weight??null,includesRegularFries:true,featured:!!b.featured,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:extras.map(x=>({id:x.id}))}},
   create:{id,categoryId:category.id,name:b.name,fullIngredients:b.ingredients,pricingType:b.variants?PricingType.VARIANTS:PricingType.FIXED,price:b.price??null,proteinType:b.protein??null,proteinWeight:b.weight??null,includesRegularFries:true,featured:!!b.featured,sortOrder:i,published:true,imageAlt:b.name,addOns:{connect:extras.map(x=>({id:x.id}))}}
  });
  await db.itemVariant.deleteMany({where:{itemId:id}});
  if(b.variants)await db.itemVariant.createMany({data:b.variants.map(([name,price],sortOrder)=>({itemId:id,name,weight:name,price,sortOrder}))});
 }
 const sandwichCategory=await db.category.findUniqueOrThrow({where:{name:'🥪 الساندويشات'}});
 await db.addOn.deleteMany({where:{category:'ساندويشات',id:{notIn:sandwichAddOns.map((_,i)=>`addon-sandwich-${i+1}`)}}});
 const sandwichExtras=[];
 for(const[i,[name,price]]of sandwichAddOns.entries()){
  sandwichExtras.push(await db.addOn.upsert({where:{id:`addon-sandwich-${i+1}`},update:{name,price,sortOrder:i,available:true,deletedAt:null,category:'ساندويشات'},create:{id:`addon-sandwich-${i+1}`,name,price,sortOrder:i,category:'ساندويشات'}}));
 }
 for(const[i,item]of sandwiches.entries()){
  const id=`sandwich-${i+1}`;
  await db.menuItem.upsert({
   where:{id},
   update:{categoryId:sandwichCategory.id,name:item.name,description:null,fullIngredients:item.ingredients,pricingType:PricingType.FIXED,price:item.price,proteinType:item.protein,proteinWeight:item.weight,includesRegularFries:false,featured:false,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:sandwichExtras.map(x=>({id:x.id}))}},
   create:{id,categoryId:sandwichCategory.id,name:item.name,fullIngredients:item.ingredients,pricingType:PricingType.FIXED,price:item.price,proteinType:item.protein,proteinWeight:item.weight,includesRegularFries:false,featured:false,sortOrder:i,published:true,imageAlt:item.name,addOns:{connect:sandwichExtras.map(x=>({id:x.id}))}}
  });
  await db.itemVariant.deleteMany({where:{itemId:id}});
 }
 const breakfastCategory=await db.category.findUniqueOrThrow({where:{name:'🍳 الفطور'}});
 const plateSubcategory=await db.subcategory.upsert({where:{id:'subcategory-breakfast-plates'},update:{categoryId:breakfastCategory.id,name:'صحون',sortOrder:0},create:{id:'subcategory-breakfast-plates',categoryId:breakfastCategory.id,name:'صحون',sortOrder:0}});
 const breakfastSandwichSubcategory=await db.subcategory.upsert({where:{id:'subcategory-breakfast-sandwiches'},update:{categoryId:breakfastCategory.id,name:'ساندويشات',sortOrder:1},create:{id:'subcategory-breakfast-sandwiches',categoryId:breakfastCategory.id,name:'ساندويشات',sortOrder:1}});
 await db.addOn.deleteMany({where:{category:'الفطور',id:{notIn:breakfastAddOns.map((_,i)=>`addon-breakfast-${i+1}`)}}});
 const breakfastExtras=[];
 for(const[i,[name,price]]of breakfastAddOns.entries())breakfastExtras.push(await db.addOn.upsert({where:{id:`addon-breakfast-${i+1}`},update:{name,price,sortOrder:i,available:true,deletedAt:null,category:'الفطور'},create:{id:`addon-breakfast-${i+1}`,name,price,sortOrder:i,category:'الفطور'}}));
 for(const[i,item]of breakfastPlates.entries()){
  const id=`breakfast-plate-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:breakfastCategory.id,subcategoryId:plateSubcategory.id,name:item.name,description:null,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:breakfastExtras.map(x=>({id:x.id}))}},create:{id,categoryId:breakfastCategory.id,subcategoryId:plateSubcategory.id,name:item.name,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,imageAlt:item.name,addOns:{connect:breakfastExtras.map(x=>({id:x.id}))}}});
  await db.choiceGroup.deleteMany({where:{itemId:id}});
  if('choice'in item&&item.choice)await db.choiceGroup.create({data:{itemId:id,name:item.choice.name,required:true,minChoices:1,maxChoices:1,options:{create:item.choice.options.map((name,sortOrder)=>({name,sortOrder}))}}});
 }
 for(const[i,item]of breakfastSandwiches.entries()){
  const id=`breakfast-sandwich-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:breakfastCategory.id,subcategoryId:breakfastSandwichSubcategory.id,name:item.name,description:null,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:breakfastPlates.length+i,published:true,active:true,deletedAt:null,addOns:{set:breakfastExtras.map(x=>({id:x.id}))}},create:{id,categoryId:breakfastCategory.id,subcategoryId:breakfastSandwichSubcategory.id,name:item.name,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:breakfastPlates.length+i,published:true,imageAlt:item.name,addOns:{connect:breakfastExtras.map(x=>({id:x.id}))}}});
 }
 const appetizerCategory=await db.category.findUniqueOrThrow({where:{name:'🍟 المقبلات'}});
 for(const[i,item]of appetizers.entries()){
  const id=`appetizer-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:appetizerCategory.id,subcategoryId:null,name:item.name,description:null,fullIngredients:item.ingredients,quantityLabel:'quantityLabel'in item?item.quantityLabel:null,price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:[]}},create:{id,categoryId:appetizerCategory.id,name:item.name,fullIngredients:item.ingredients,quantityLabel:'quantityLabel'in item?item.quantityLabel:null,price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,imageAlt:item.name}});
  await db.choiceGroup.deleteMany({where:{itemId:id}});
  if('choice'in item&&item.choice)await db.choiceGroup.create({data:{itemId:id,name:item.choice.name,required:true,minChoices:1,maxChoices:1,options:{create:item.choice.options.map((name,sortOrder)=>({name,sortOrder}))}}});
 }
 const saladCategory=await db.category.findUniqueOrThrow({where:{name:'🥗 السلطات'}});
 await db.addOn.deleteMany({where:{category:'السلطات',id:{notIn:saladAddOns.map((_,i)=>`addon-salad-${i+1}`)}}});
 const saladExtras=[];
 for(const[i,[name,price]]of saladAddOns.entries())saladExtras.push(await db.addOn.upsert({where:{id:`addon-salad-${i+1}`},update:{name,price,sortOrder:i,available:true,deletedAt:null,category:'السلطات'},create:{id:`addon-salad-${i+1}`,name,price,sortOrder:i,category:'السلطات'}}));
 for(const[i,item]of salads.entries()){
  const id=`salad-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:saladCategory.id,subcategoryId:null,name:item.name,description:null,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:saladExtras.map(x=>({id:x.id}))}},create:{id,categoryId:saladCategory.id,name:item.name,fullIngredients:[...item.ingredients],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,imageAlt:item.name,addOns:{connect:saladExtras.map(x=>({id:x.id}))}}});
 }
 const mealCategory=await db.category.findUniqueOrThrow({where:{name:'🍽️ الوجبات'}});
 await db.addOn.deleteMany({where:{category:'الوجبات',id:{notIn:mealAddOns.map((_,i)=>`addon-meal-${i+1}`)}}});
 const mealExtras=[];
 for(const[i,[name,price]]of mealAddOns.entries())mealExtras.push(await db.addOn.upsert({where:{id:`addon-meal-${i+1}`},update:{name,price,sortOrder:i,available:true,deletedAt:null,category:'الوجبات'},create:{id:`addon-meal-${i+1}`,name,price,sortOrder:i,category:'الوجبات'}}));
 for(const[i,item]of meals.entries()){
  const id=`meal-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:mealCategory.id,subcategoryId:null,name:item.name,description:null,fullIngredients:[...item.ingredients],price:item.price,proteinType:item.protein,proteinWeight:item.weight,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,addOns:{set:mealExtras.map(x=>({id:x.id}))}},create:{id,categoryId:mealCategory.id,name:item.name,fullIngredients:[...item.ingredients],price:item.price,proteinType:item.protein,proteinWeight:item.weight,pricingType:PricingType.FIXED,sortOrder:i,published:true,imageAlt:item.name,addOns:{connect:mealExtras.map(x=>({id:x.id}))}}});
  await db.choiceGroup.deleteMany({where:{itemId:id}});
  if('choice'in item&&item.choice)await db.choiceGroup.create({data:{itemId:id,name:item.choice.name,required:true,minChoices:1,maxChoices:1,options:{create:item.choice.options.map((name,sortOrder)=>({name,sortOrder}))}}});
 }
 const drinksCategory=await db.category.findUniqueOrThrow({where:{name:'المشروبات الساخنة'}});
 const hotDrinksSubcategory=await db.subcategory.upsert({where:{id:'subcategory-winter-drinks'},update:{categoryId:drinksCategory.id,name:'مشروبات ساخنة',sortOrder:0},create:{id:'subcategory-winter-drinks',categoryId:drinksCategory.id,name:'مشروبات ساخنة',sortOrder:0}});
 await db.menuItem.deleteMany({where:{id:{startsWith:'winter-drink-'}}});
 await db.addOn.deleteMany({where:{category:'المشروبات الساخنة',id:{notIn:hotDrinkAddOns.map((_,i)=>`addon-hot-drink-${i+1}`)}}});
 const hotDrinkExtras=[];
 for(const[i,[name,nameEn,price]]of hotDrinkAddOns.entries())hotDrinkExtras.push(await db.addOn.upsert({where:{id:`addon-hot-drink-${i+1}`},update:{name,nameEn,price,sortOrder:i,available:true,deletedAt:null,category:'المشروبات الساخنة'},create:{id:`addon-hot-drink-${i+1}`,name,nameEn,price,sortOrder:i,category:'المشروبات الساخنة'}}));
 for(const[i,item]of hotDrinks.entries()){
  const id=`hot-drink-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:drinksCategory.id,subcategoryId:hotDrinksSubcategory.id,name:item.name,description:item.english,fullIngredients:[],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,featured:false,addOns:{set:hotDrinkExtras.map(x=>({id:x.id}))}},create:{id,categoryId:drinksCategory.id,subcategoryId:hotDrinksSubcategory.id,name:item.name,description:item.english,fullIngredients:[],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,imageAlt:item.name,addOns:{connect:hotDrinkExtras.map(x=>({id:x.id}))}}});
 }
 const argeelehCategory=await db.category.findUniqueOrThrow({where:{name:'الأراجيل'}});
 await db.addOn.deleteMany({where:{category:'الأراجيل',id:{notIn:argeelehAddOns.map((_,i)=>`addon-argeeleh-${i+1}`)}}});
 const argeelehExtras=[];
 for(const[i,[name,nameEn,price]]of argeelehAddOns.entries())argeelehExtras.push(await db.addOn.upsert({where:{id:`addon-argeeleh-${i+1}`},update:{name,nameEn,price,sortOrder:i,available:true,deletedAt:null,category:'الأراجيل'},create:{id:`addon-argeeleh-${i+1}`,name,nameEn,price,sortOrder:i,category:'الأراجيل'}}));
 for(const[i,item]of argeelehItems.entries()){
  const id=`argeeleh-${i+1}`;
  await db.menuItem.upsert({where:{id},update:{categoryId:argeelehCategory.id,subcategoryId:null,name:item.name,description:item.english,fullIngredients:[],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,deletedAt:null,featured:false,addOns:{set:argeelehExtras.map(x=>({id:x.id}))}},create:{id,categoryId:argeelehCategory.id,name:item.name,description:item.english,fullIngredients:[],price:item.price,pricingType:PricingType.FIXED,sortOrder:i,published:true,active:true,imageAlt:item.name,addOns:{connect:argeelehExtras.map(x=>({id:x.id}))}}});
 }
 const coldDrinksCategory=await db.category.findUniqueOrThrow({where:{name:'المشروبات الباردة'}});
 await db.category.update({where:{id:coldDrinksCategory.id},data:{description:'Cold Drinks',active:true,published:true,deletedAt:null}});
 let coldSortOrder=0;
 for(const[groupOrder,group]of coldDrinkGroups.entries()){
  const subcategory=await db.subcategory.upsert({where:{id:group.id},update:{categoryId:coldDrinksCategory.id,name:group.name,nameEn:group.nameEn,sortOrder:groupOrder},create:{id:group.id,categoryId:coldDrinksCategory.id,name:group.name,nameEn:group.nameEn,sortOrder:groupOrder}});
  for(const[itemOrder,[name,english,price]]of group.items.entries()){
   const id=`cold-drink-${groupOrder+1}-${itemOrder+1}`;
   await db.menuItem.upsert({where:{id},update:{categoryId:coldDrinksCategory.id,subcategoryId:subcategory.id,name,description:english,fullIngredients:[],price,pricingType:PricingType.FIXED,sortOrder:coldSortOrder,published:true,active:true,deletedAt:null,featured:false,addOns:{set:[]}},create:{id,categoryId:coldDrinksCategory.id,subcategoryId:subcategory.id,name,description:english,fullIngredients:[],price,pricingType:PricingType.FIXED,sortOrder:coldSortOrder,published:true,active:true,imageAlt:name}});
   coldSortOrder++;
  }
 }
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
