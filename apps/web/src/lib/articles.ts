import { IMAGES } from './catalog';

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Buying Guide' | 'Nutrition' | 'Storage' | 'Gifting';
  readTime: string;
  date: string;
  image: string;
  sections: { heading?: string; text: string }[];
}

/** Journal articles, newest first. */
export const ARTICLES: Article[] = [
  {
    slug: 'mamra-vs-californian-almonds',
    title: 'Mamra vs. Californian Almonds: What Really Is the Difference?',
    excerpt:
      'Why do Mamra almonds cost so much more? We compare taste, oil content, shape and value so you can choose the right almond for your family.',
    category: 'Buying Guide',
    readTime: '5 min read',
    date: 'October 14, 2026',
    image: IMAGES.almonds,
    sections: [
      {
        text: 'Walk into any dry fruit shop in India and you will see two kinds of almonds at very different prices: the smaller, wrinkled Mamra almond and the larger, smoother Californian almond. Both are healthy — but they are not the same.',
      },
      {
        heading: 'Where they come from',
        text: 'Mamra almonds are grown in small quantities in Iran, Afghanistan and Kashmir and are usually hand-cracked. Californian almonds come from large orchards in the USA and make up most of the almonds sold worldwide.',
      },
      {
        heading: 'Taste and texture',
        text: 'Mamra almonds have a boat-like concave shape, a higher natural oil content and a sweeter, richer taste. Californian almonds are flatter, crunchier and milder — ideal for baking, cooking and everyday snacking.',
      },
      {
        heading: 'Which should you buy?',
        text: 'Choose Mamra for soaking, festive gifting and when you want the best taste. Choose Californian for daily handfuls, kids’ tiffins and recipes where almonds are one of many ingredients. Many families keep both.',
      },
    ],
  },
  {
    slug: 'how-many-dry-fruits-a-day',
    title: 'How Many Dry Fruits Should You Eat in a Day?',
    excerpt:
      'Dry fruits are nutritious but energy-dense. Here is a simple, practical guide to sensible daily portions for adults and children.',
    category: 'Nutrition',
    readTime: '4 min read',
    date: 'September 28, 2026',
    image: IMAGES.mixedNuts,
    sections: [
      {
        text: 'Nuts and dried fruits pack protein, healthy fats, fibre, vitamins and minerals into a small handful. Because they are also high in calories, portion size matters.',
      },
      {
        heading: 'A practical daily handful',
        text: 'For most healthy adults, about 30 grams of nuts a day is a commonly recommended serving — roughly 20–23 almonds, 15–18 cashews, or 7 walnut halves. Add 2–3 dates or a small spoon of raisins if you like something sweet.',
      },
      {
        heading: 'For children',
        text: 'Children can enjoy smaller portions, chopped or powdered for younger kids to avoid choking. Soaked and peeled almonds are a popular choice.',
      },
      {
        heading: 'A note on health conditions',
        text: 'If you have a nut allergy, diabetes, kidney disease or follow a special diet, ask your doctor or dietitian what portion is right for you. This article is general information, not medical advice.',
      },
    ],
  },
  {
    slug: 'storing-nuts-at-home',
    title: 'Storing Nuts at Home: Keep Them Fresh for Months',
    excerpt:
      'Heat, light and moisture are the enemies of fresh nuts. Simple storage habits that keep your dry fruits crunchy and tasty.',
    category: 'Storage',
    readTime: '3 min read',
    date: 'September 12, 2026',
    image: IMAGES.walnutsWhole,
    sections: [
      {
        text: 'Nuts are rich in natural oils. When exposed to warmth, light and air, those oils slowly oxidise and the nuts turn stale or bitter. Good storage keeps them fresh far longer.',
      },
      {
        heading: 'Use airtight containers',
        text: 'Move dry fruits from an opened pouch into an airtight glass or steel jar. Keep it in a cool, dark cupboard away from the stove.',
      },
      {
        heading: 'Refrigerate or freeze for longer storage',
        text: 'Walnuts and pine nuts are the most delicate — refrigerate them once opened. For bulk buys, freeze nuts in airtight bags for months and take out small portions as needed.',
      },
      {
        heading: 'Always use a dry spoon',
        text: 'Moisture invites mould. Never put a wet spoon into the jar, and keep jars away from the sink and the steam of cooking.',
      },
    ],
  },
  {
    slug: 'choosing-dates-medjool-ajwa-kimia',
    title: 'Medjool, Ajwa or Kimia? A Simple Guide to Choosing Dates',
    excerpt:
      'Every date variety has its own taste and texture. Here is how to pick the right one for snacking, fasting, cooking and gifting.',
    category: 'Buying Guide',
    readTime: '4 min read',
    date: 'August 30, 2026',
    image: IMAGES.dates,
    sections: [
      {
        heading: 'Medjool',
        text: 'Large, soft and caramel-like. Medjool dates are the classic choice for gifting and a dessert-like snack. Try them stuffed with an almond or walnut.',
      },
      {
        heading: 'Ajwa',
        text: 'Small, dark and gently sweet with a slightly dry texture. Ajwa dates from Madinah hold special significance and are especially popular during Ramadan.',
      },
      {
        heading: 'Kimia',
        text: 'Soft, juicy and dark, Kimia dates are good value for everyday eating and for blending into milkshakes, laddoos and energy bars.',
      },
    ],
  },
  {
    slug: 'diwali-dry-fruit-gifting-guide',
    title: 'The Festive Dry Fruit Gifting Guide',
    excerpt:
      'Planning Diwali, Eid or wedding gifts? How to choose the right hamper size, mix and budget — and when to order.',
    category: 'Gifting',
    readTime: '4 min read',
    date: 'August 16, 2026',
    image: IMAGES.datesBowl,
    sections: [
      {
        text: 'A dry fruit hamper is one of the most loved festive gifts in India — healthy, long-lasting and welcome in every home.',
      },
      {
        heading: 'Pick the right mix',
        text: 'A classic hamper combines almonds, cashews, raisins and dates. For premium gifts, add Mamra almonds, Kashmiri walnuts or Medjool dates.',
      },
      {
        heading: 'Order early',
        text: 'Festive weeks are our busiest time of year. Order at least a week before the festival so your hampers arrive on time.',
      },
      {
        heading: 'Bulk and corporate gifting',
        text: 'Sending 20 or more hampers? Contact us for custom contents, packaging and delivery to multiple addresses.',
      },
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
