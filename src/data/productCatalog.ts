export type ProductCategory =
  | "latestDrip"
  | "hoodies"
  | "sweatshirts"
  | "oversizedShirts";

export type Product = {
  id: number;
  title: string;
  category: ProductCategory;
  imageSrc: string;
  imageAlt: string;
  price: string;
  originalPrice: string;
};

export const products: Product[] = [
  {
    id: 1,
    title: "Abstract Brushstroke",
    category: "latestDrip",
    imageSrc: "/images/abstractBrushstroke.jpg",
    imageAlt: "Abstract brushstroke shirt",
    price: "$89",
    originalPrice: "$119",
  },
  {
    id: 2,
    title: "Blue Watercolor",
    category: "latestDrip",
    imageSrc: "/images/blueWatercolor.jpg",
    imageAlt: "Blue watercolor shirt",
    price: "$92",
    originalPrice: "$125",
},
{
    id: 3,
    title: "Minimalist Colorblock",
    category: "latestDrip",
    imageSrc: "/images/minimalistColorblock.jpg",
    imageAlt: "Minimalist colorblock shirt",
    price: "$95",
    originalPrice: "$129",
  },
  {
    id: 4,
    title: "Olive Sweatshirt",
    category: "sweatshirts",
    imageSrc: "/images/oliveSweatShirt.jpg",
    imageAlt: "Olive sweatshirt",
    price: "$84",
    originalPrice: "$110",
  },
  {
    id: 5,
    title: "Rust Sweatshirt",
    category: "sweatshirts",
    imageSrc: "/images/rustSweatShirt.jpg",
    imageAlt: "Rust sweatshirt",
    price: "$84",
    originalPrice: "$110",
  },
  {
    id: 6,
    title: "Lavender Sweatshirt",
    category: "sweatshirts",
    imageSrc: "/images/lavenderSweatShirt.jpg",
    imageAlt: "Lavender sweatshirt",
    price: "$84",
    originalPrice: "$110",
  },
  {
    id: 7,
    title: "Gryphon Hoodie",
    category: "hoodies",
    imageSrc: "/images/gryphonHoodie.jpg",
    imageAlt: "Gryphon hoodie",
    price: "$109",
    originalPrice: "$139",
  },
  {
    id: 8,
    title: "Panda Hoodie",
    category: "hoodies",
    imageSrc: "/images/pandaHoodie.jpg",
    imageAlt: "Panda hoodie",
    price: "$105",
    originalPrice: "$135",
  },
  {
    id: 9,
    title: "Grey Hoodie",
    category: "hoodies",
    imageSrc: "/images/greyHoodie.jpg",
    imageAlt: "Grey hoodie",
    price: "$99",
    originalPrice: "$129",
  },
  {
    id: 10,
    title: "Black Dragonfly",
    category: "sweatshirts",
    imageSrc: "/images/blackSweatShirt.jpg",
    imageAlt: "Black dragonfly sweatshirt",
    price: "$89",
    originalPrice: "$119",
  },
  {
    id: 11,
    title: "Burnt Orange",
    category: "sweatshirts",
    imageSrc: "/images/orangeSweatShirt.jpg",
    imageAlt: "Burnt orange sweatshirt",
    price: "$92",
    originalPrice: "$125",
  },
  {
    id: 12,
    title: "Sky Zinna",
    category: "sweatshirts",
    imageSrc: "/images/skySweatShirt.jpg",
    imageAlt: "Sky blue Zinna sweatshirt",
    price: "$95",
    originalPrice: "$129",
  },
  {
    id: 13,
    title: "Navy Oversized Shirt",
    category: "oversizedShirts",
    imageSrc: "/images/navyWaffle.jpg",
    imageAlt: "Navy oversized shirt",
    price: "$79",
    originalPrice: "$105",
  },
  {
    id: 14,
    title: "Grey Oversized Shirt",
    category: "oversizedShirts",
    imageSrc: "/images/greyWaffle.jpg",
    imageAlt: "Grey oversized shirt",
    price: "$79",
    originalPrice: "$105",
  },
  {
    id: 15,
    title: "Black Oversized Shirt",
    category: "oversizedShirts",
    imageSrc: "/images/blacWaffle.jpg",
    imageAlt: "Black oversized shirt",
    price: "$79",
    originalPrice: "$105",
  },
  {
    id: 16,
    title: "Blue Oversized Sweater",
    category: "oversizedShirts",
    imageSrc: "/images/blueSweater.jpg",
    imageAlt: "Blue oversized Sweater",
    price: "$79",
    originalPrice: "$105",
  },
  {
    id: 17,
    title: "Green Oversized Sweater",
    category: "oversizedShirts",
    imageSrc: "/images/greenSweater.jpg",
    imageAlt: "Green Oversized Sweater",
    price: "$79",
    originalPrice: "$105",
  },
  {
    id: 18,
    title: "white Oversized Sweater",
    category: "oversizedShirts",
    imageSrc: "/images/whiteSweater.jpg",
    imageAlt: "White Oversized Sweater",
    price: "$79",
    originalPrice: "$105",
  },
];