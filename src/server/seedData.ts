import type { Category, Product, Review } from '../types/index.ts';

export const initialCategories: Category[] = [
  {
    id: 'cat-smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Flagship & high-performance smartphones with 5G, OLED displays, and pro-grade camera systems.',
    subcategories: ['Flagship Phones', 'Camera Phones', 'Foldable Phones', 'Budget Flagships'],
    productCount: 4
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Pro creator notebooks, ultrabooks, and high-refresh gaming laptops.',
    subcategories: ['Ultrabooks', 'Creator Laptops', 'Gaming Laptops', 'Business Notebooks'],
    productCount: 4
  },
  {
    id: 'cat-audio',
    name: 'Headphones & ANC',
    slug: 'headphones-earbuds',
    description: 'Audiophile grade over-ear noise cancelling headphones and low-latency TWS earbuds.',
    subcategories: ['Wireless Over-Ear', 'True Wireless Earbuds', 'Studio Monitors', 'Gaming Headsets'],
    productCount: 4
  },
  {
    id: 'cat-monitors',
    name: 'Gaming Monitors',
    slug: 'monitors',
    description: '4K UHD, OLED gaming displays, ultra-wide curved productivity monitors.',
    subcategories: ['4K OLED Displays', '240Hz Gaming Monitors', 'Ultrawide Curved', 'Color Accurate Studio'],
    productCount: 3
  },
  {
    id: 'cat-peripherals',
    name: 'Keyboards & Peripherals',
    slug: 'keyboards-mouse',
    description: 'Custom mechanical keyboards, wireless precision mice, and desk accessories.',
    subcategories: ['Mechanical Keyboards', 'Wireless Mice', 'Desk Mats', 'USB Docks'],
    productCount: 3
  },
  {
    id: 'cat-smartwatches',
    name: 'Smartwatches',
    slug: 'smartwatches',
    description: 'Cellular smartwatches, titanium fitness trackers, and advanced health monitors.',
    subcategories: ['Cellular Smartwatches', 'Sports & Fitness GPS', 'Titanium Luxury Wear'],
    productCount: 2
  }
];

export const initialProducts: Product[] = [
  // Smartphones
  {
    id: 'prod-iphone-16-pro',
    name: 'Apple iPhone 16 Pro Max (256GB, Titanium)',
    brand: 'Apple',
    categoryId: 'cat-smartphones',
    categoryName: 'Smartphones',
    subcategory: 'Flagship Phones',
    price: 144900,
    originalPrice: 159900,
    discount: 9,
    stock: 24,
    rating: 4.9,
    reviewCount: 48,
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'Pro Flagship',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Desert Titanium'],
    description: 'Engineered with Grade 5 Titanium and the blazing A18 Pro Bionic chip. Features a 6.9-inch Super Retina XDR ProMotion OLED display, 48MP Fusion Camera with 5x telephoto optical zoom, and 4K 120fps Dolby Vision recording.',
    specifications: {
      'Processor': 'Apple A18 Pro 3nm',
      'Display': '6.9-inch OLED 120Hz ProMotion',
      'RAM & Storage': '8GB Unified / 256GB NVMe',
      'Main Camera': '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto',
      'Battery': '4,685 mAh (Up to 33 hrs video playback)',
      'OS': 'iOS 18 with Apple Intelligence'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)',
    brand: 'Samsung',
    categoryId: 'cat-smartphones',
    categoryName: 'Smartphones',
    subcategory: 'Flagship Phones',
    price: 129999,
    originalPrice: 144999,
    discount: 10,
    stock: 18,
    rating: 4.8,
    reviewCount: 39,
    featured: true,
    trending: true,
    newArrival: false,
    badge: '200MP Zoom Pro',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    description: 'Equipped with Snapdragon 8 Gen 3 for Galaxy, titanium armor frame, integrated S Pen, anti-reflective Corning Gorilla Armor glass, and quad camera system with 200MP primary sensor and 100x Space Zoom.',
    specifications: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Display': '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits',
      'RAM & Storage': '12GB LPDDR5X / 512GB UFS 4.0',
      'Main Camera': '200MP Wide + 50MP 5x Periscope + 10MP 3x + 12MP Ultra-wide',
      'Battery': '5,000 mAh with 45W Fast Charging',
      'Special Features': 'Integrated S-Pen Stylus, Galaxy AI Live Translate'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-oneplus-12',
    name: 'OnePlus 12 5G (16GB RAM, 512GB, Silky Black)',
    brand: 'OnePlus',
    categoryId: 'cat-smartphones',
    categoryName: 'Smartphones',
    subcategory: 'Budget Flagships',
    price: 64999,
    originalPrice: 69999,
    discount: 7,
    stock: 15,
    rating: 4.7,
    reviewCount: 31,
    featured: false,
    trending: true,
    newArrival: false,
    badge: '100W SuperVOOC',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Silky Black', 'Flowy Emerald'],
    description: 'Extreme speed powered by Snapdragon 8 Gen 3, 16GB LPDDR5X RAM, 4th Gen Hasselblad Camera system, and 5400 mAh battery with 100W wired and 50W wireless charging.',
    specifications: {
      'Processor': 'Snapdragon 8 Gen 3',
      'Display': '6.82-inch 2K 120Hz ProXDR AMOLED',
      'RAM & Storage': '16GB LPDDR5X / 512GB UFS 4.0',
      'Camera': '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-wide',
      'Charging': '100W SuperVOOC (1-100% in 26 mins)',
      'Battery': '5,400 mAh Dual-Cell'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-pixel-9-pro',
    name: 'Google Pixel 9 Pro (128GB, Obsidian)',
    brand: 'Google',
    categoryId: 'cat-smartphones',
    categoryName: 'Smartphones',
    subcategory: 'Camera Phones',
    price: 109999,
    originalPrice: 119999,
    discount: 8,
    stock: 12,
    rating: 4.8,
    reviewCount: 22,
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Pro Camera Studio',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Obsidian', 'Porcelain', 'Hazel', 'Rose Quartz'],
    description: 'Powered by Google Tensor G4 with 16GB RAM for on-device Gemini Nano. Super Actua display, triple rear camera with 30x Super Res Zoom, and 7 years of Android OS updates.',
    specifications: {
      'Processor': 'Google Tensor G4 + Titan M2 security coprocessor',
      'Display': '6.3-inch Super Actua LTPO OLED (1-120Hz, 3000 nits)',
      'RAM & Storage': '16GB RAM / 128GB Storage',
      'Cameras': '50MP Octa PD Wide + 48MP Quad PD Ultrawide + 48MP 5x Telephoto',
      'Battery': '4,700 mAh Fast Qi-Certified Wireless Charging',
      'OS': 'Pure Android 15 with 7 Years Feature Drops'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },

  // Laptops
  {
    id: 'prod-macbook-pro-16',
    name: 'Apple MacBook Pro 16" (M3 Max, 36GB RAM, 1TB SSD)',
    brand: 'Apple',
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    subcategory: 'Creator Laptops',
    price: 349900,
    originalPrice: 379900,
    discount: 8,
    stock: 9,
    rating: 4.9,
    reviewCount: 35,
    featured: true,
    trending: true,
    newArrival: false,
    badge: 'Ultimate Creator Beast',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Space Black', 'Silver'],
    description: 'Massive compute capability with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak HDR brightness, hardware-accelerated ray tracing, and up to 22 hours battery endurance.',
    specifications: {
      'Chip': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'Display': '16.2-inch Liquid Retina XDR (3456x2234, 120Hz ProMotion)',
      'Memory': '36GB Unified Memory (300GB/s bandwidth)',
      'Storage': '1TB Ultra-Fast PCIe Gen 4 SSD',
      'Battery': '100Wh Lithium-Polymer (Up to 22 hrs runtime)',
      'Ports': '3x Thunderbolt 4, HDMI 2.1, SDXC Card Slot, MagSafe 3'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-dell-xps-16',
    name: 'Dell XPS 16 9640 (Intel Core Ultra 9, RTX 4070, 32GB)',
    brand: 'Dell',
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    subcategory: 'Ultrabooks',
    price: 289990,
    originalPrice: 319990,
    discount: 9,
    stock: 8,
    rating: 4.7,
    reviewCount: 19,
    featured: false,
    trending: true,
    newArrival: true,
    badge: '4K OLED Touch',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Platinum Silver', 'Graphite'],
    description: 'CNC machined aluminum chassis with zero-lattice keyboard, invisible haptic glass touchpad, and 4K+ OLED infinity edge touch display driven by NVIDIA GeForce RTX 4070.',
    specifications: {
      'CPU': 'Intel Core Ultra 9 185H (16 Cores, 22 Threads, 5.1GHz)',
      'GPU': 'NVIDIA GeForce RTX 4070 8GB GDDR6 (60W)',
      'Display': '16.3-inch 4K+ (3840 x 2400) OLED Touch 90Hz',
      'RAM': '32GB LPDDR5X Dual Channel 7467MHz',
      'Storage': '1TB M.2 PCIe NVMe SSD',
      'Weight': '2.13 kg'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-rog-zephyrus-g16',
    name: 'ASUS ROG Zephyrus G16 OLED (Core Ultra 9, RTX 4080)',
    brand: 'ASUS',
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    subcategory: 'Gaming Laptops',
    price: 249990,
    originalPrice: 279990,
    discount: 11,
    stock: 7,
    rating: 4.8,
    reviewCount: 24,
    featured: true,
    trending: true,
    newArrival: false,
    badge: '240Hz OLED Gaming',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Eclipse Gray', 'Platinum White'],
    description: 'Ultra-slim CNC unibody with Slash Lighting array. Features the world’s first 2.5K 240Hz 0.2ms ROG Nebula OLED display with G-Sync support and vapor chamber cooling.',
    specifications: {
      'CPU': 'Intel Core Ultra 9 185H with dedicated AI NPU',
      'GPU': 'NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP with Dynamic Boost)',
      'Display': '16-inch 2.5K (2560x1600) 240Hz OLED 0.2ms G-Sync',
      'RAM & Storage': '32GB LPDDR5X-7467MHz / 2TB PCIe 4.0 NVMe',
      'Audio': '6-Speaker system with dual force-canceling woofers and Dolby Atmos',
      'Weight': '1.85 kg ultra-portable'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-macbook-air-m3',
    name: 'Apple MacBook Air 15" (M3, 16GB RAM, 512GB SSD)',
    brand: 'Apple',
    categoryId: 'cat-laptops',
    categoryName: 'Laptops',
    subcategory: 'Ultrabooks',
    price: 144900,
    originalPrice: 154900,
    discount: 6,
    stock: 14,
    rating: 4.8,
    reviewCount: 42,
    featured: false,
    trending: false,
    newArrival: true,
    badge: 'Thinnest 15-inch',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'],
    description: 'Fanless, completely silent operation with M3 performance. 15.3-inch Liquid Retina display, 1080p FaceTime HD camera, six-speaker sound with Spatial Audio, and up to 18 hours battery life.',
    specifications: {
      'Chip': 'Apple M3 chip (8-core CPU, 10-core GPU)',
      'Display': '15.3-inch Liquid Retina with True Tone (500 nits)',
      'RAM': '16GB Unified Memory',
      'Storage': '512GB SSD Storage',
      'Thickness': '1.15 cm ultra-thin profile',
      'Battery': '66.5Wh with 35W Dual USB-C Power Adapter'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },

  // Audio / Headphones
  {
    id: 'prod-sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    categoryId: 'cat-audio',
    categoryName: 'Headphones & ANC',
    subcategory: 'Wireless Over-Ear',
    price: 29990,
    originalPrice: 34990,
    discount: 14,
    stock: 22,
    rating: 4.8,
    reviewCount: 65,
    featured: true,
    trending: true,
    newArrival: false,
    badge: 'Industry Best ANC',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Silver', 'Black', 'Midnight Blue'],
    description: 'Auto NC Optimizer automatically optimizes noise canceling based on your wearing conditions. Dual processors control 8 microphones for unprecedented noise cancelation quality and crystal clear hands-free calling.',
    specifications: {
      'Drivers': '30mm specially designed carbon fiber driver unit',
      'ANC Processor': 'Integrated Processor V1 + HD Noise Cancelling Processor QN1',
      'Battery Life': '30 Hours with ANC on (3-min charge = 3 hrs playback)',
      'Codecs': 'LDAC, AAC, SBC, Hi-Res Audio Wireless Certified',
      'Weight': '250 grams with soft-fit leather headband',
      'Connectivity': 'Bluetooth 5.2 Multipoint Connection'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-airpods-max',
    name: 'Apple AirPods Max (USB-C, Active Noise Cancellation)',
    brand: 'Apple',
    categoryId: 'cat-audio',
    categoryName: 'Headphones & ANC',
    subcategory: 'Wireless Over-Ear',
    price: 59900,
    originalPrice: 64900,
    discount: 8,
    stock: 11,
    rating: 4.7,
    reviewCount: 38,
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Computational Audio',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Midnight', 'Starlight', 'Blue', 'Purple', 'Orange'],
    description: 'Anodized aluminum ear cups with breathable mesh canopy. Apple-designed 40mm dynamic driver, personalized spatial audio with dynamic head tracking, and pro-level active noise cancellation with Transparency mode.',
    specifications: {
      'Acoustic Architecture': 'Apple-designed 40mm dynamic driver with dual neodymium ring magnet',
      'Chips': 'Apple H1 headphone chip in each ear cup',
      'Audio Technologies': 'Pro Active Noise Cancellation, Personalized Spatial Audio',
      'Charging': 'USB-C Fast Charging (20 hrs playback on single charge)',
      'Microphones': '9 total microphones (8 for ANC, 3 for voice pickup)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra Wireless Headphones',
    brand: 'Bose',
    categoryId: 'cat-audio',
    categoryName: 'Headphones & ANC',
    subcategory: 'Wireless Over-Ear',
    price: 35900,
    originalPrice: 39900,
    discount: 10,
    stock: 16,
    rating: 4.8,
    reviewCount: 29,
    featured: false,
    trending: false,
    newArrival: false,
    badge: 'Bose Immersive Audio',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Black', 'White Smoke', 'Sandstone'],
    description: 'Breakthrough spatialized audio for more immersive listening that makes music feel more real than ever. CustomTune technology personalizes the noise cancellation and sound performance to your ear shape.',
    specifications: {
      'Sound Technology': 'Bose Immersive Audio + CustomTune sound calibration',
      'Modes': 'Quiet Mode, Aware Mode, Immersion Mode',
      'Battery Life': 'Up to 24 hours (18 hours with Immersive Audio)',
      'Connectivity': 'Bluetooth 5.3 with Snapdragon Sound (aptX Adaptive)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-sony-wf1000xm5',
    name: 'Sony WF-1000XM5 True Wireless Noise Cancelling Earbuds',
    brand: 'Sony',
    categoryId: 'cat-audio',
    categoryName: 'Headphones & ANC',
    subcategory: 'True Wireless Earbuds',
    price: 24990,
    originalPrice: 29990,
    discount: 17,
    stock: 19,
    rating: 4.7,
    reviewCount: 51,
    featured: true,
    trending: false,
    newArrival: false,
    badge: 'Hi-Res TWS',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Black', 'Silver'],
    description: 'The best noise canceling true wireless earbuds with Dynamic Driver X, two proprietary processors, dual feedback microphones, and noise isolation earbud tips for a stable fit.',
    specifications: {
      'Driver Unit': '8.4mm Dynamic Driver X',
      'Processors': 'Integrated Processor V2 + HD Noise Cancelling Processor QN2e',
      'Battery': '8 hrs in earbuds + 16 hrs in Qi wireless case (Total 24 hrs)',
      'Water Resistance': 'IPX4 sweat and splash resistant'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },

  // Monitors
  {
    id: 'prod-samsung-odyssey-oled-g9',
    name: 'Samsung Odyssey OLED G9 49" Curved Gaming Monitor',
    brand: 'Samsung',
    categoryId: 'cat-monitors',
    categoryName: 'Gaming Monitors',
    subcategory: 'Ultrawide Curved',
    price: 139999,
    originalPrice: 169999,
    discount: 18,
    stock: 6,
    rating: 4.9,
    reviewCount: 17,
    featured: true,
    trending: true,
    newArrival: false,
    badge: '0.03ms 240Hz Dual QHD',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Silver Metallic'],
    description: '49-inch Dual QHD (5120 x 1440) 32:9 curved OLED panel powered by the Neo Quantum Processor Pro. Blazing 0.03ms response time and 240Hz refresh rate with AMD FreeSync Premium Pro.',
    specifications: {
      'Screen Size': '49-inch 1800R Curved OLED (Dual QHD 5120x1440)',
      'Refresh Rate & Response': '240Hz Refresh Rate / 0.03ms (GtG) response time',
      'Aspect Ratio': '32:9 Super Ultra-Wide (equivalent to two 27" QHD side-by-side)',
      'Peak Brightness': 'VESA DisplayHDR True Black 400',
      'Ports': '1x DisplayPort 1.4, 1x HDMI 2.1, 1x Micro HDMI 2.1, USB Hub'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-lg-ultragear-32-oled',
    name: 'LG UltraGear 32GS95UE 32" Dual-Mode 4K OLED Gaming Monitor',
    brand: 'Sony',
    categoryId: 'cat-monitors',
    categoryName: 'Gaming Monitors',
    subcategory: '4K OLED Displays',
    price: 124999,
    originalPrice: 139999,
    discount: 11,
    stock: 8,
    rating: 4.8,
    reviewCount: 14,
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Dual-Hz Switch',
    images: [
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Hexagon Black'],
    description: 'Revolutionary Dual-Mode monitor allowing one-click toggle between 4K 240Hz for visual immersion and FHD 480Hz for lightning fast competitive esport gameplay.',
    specifications: {
      'Panel': '32-inch 4K UHD (3840x2160) Anti-glare Micro Lens Array OLED',
      'Dual Mode': '4K @ 240Hz OR Full HD @ 480Hz with hotkey switch',
      'Response Time': '0.03ms (GtG)',
      'Audio': 'Pixel Sound integrated front-firing acoustic panel'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-dell-ultrasharp-27-4k',
    name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor (U2723QE)',
    brand: 'Dell',
    categoryId: 'cat-monitors',
    categoryName: 'Gaming Monitors',
    subcategory: 'Color Accurate Studio',
    price: 52990,
    originalPrice: 59990,
    discount: 12,
    stock: 12,
    rating: 4.7,
    reviewCount: 28,
    featured: false,
    trending: false,
    newArrival: false,
    badge: 'IPS Black Tech',
    images: [
      'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Platinum Silver'],
    description: 'Groundbreaking IPS Black technology with 2000:1 contrast ratio. 98% DCI-P3 color coverage, 90W USB-C power delivery, and built-in RJ45 Ethernet hub for single cable connectivity.',
    specifications: {
      'Resolution': '27-inch 4K UHD (3840x2160) at 60Hz',
      'Contrast Ratio': '2,000:1 IPS Black Technology',
      'Color Gamut': '100% sRGB, 98% DCI-P3, Delta E < 2 accuracy',
      'Hub Connectivity': '90W USB-C PD, RJ45 Ethernet, 5x USB-A 10Gbps'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },

  // Peripherals
  {
    id: 'prod-keychron-q1-pro',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    brand: 'Keychron',
    categoryId: 'cat-peripherals',
    categoryName: 'Keyboards & Peripherals',
    subcategory: 'Mechanical Keyboards',
    price: 18499,
    originalPrice: 20999,
    discount: 12,
    stock: 15,
    rating: 4.9,
    reviewCount: 32,
    featured: true,
    trending: false,
    newArrival: false,
    badge: 'CNC Full Aluminum',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Carbon Black', 'Silver Grey', 'Shell White'],
    description: 'Full CNC machined 6063 aluminum body with double-gasket acoustic mount design, KSA double-shot PBT keycaps, and hot-swappable Keychron K Pro mechanical switches.',
    specifications: {
      'Layout': '75% Layout (81 Keys with Programmable CNC Rotary Knob)',
      'Body Material': 'Full CNC machined 6063 Aluminum with Double-Gasket Design',
      'Switches': 'Keychron K Pro Mechanical (Banana Tactile / Red Linear)',
      'Firmware': 'QMK / VIA open-source reprogrammable keymaps',
      'Battery': '4,000 mAh rechargeable li-polymer battery (up to 300 hrs)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    brand: 'Logitech',
    categoryId: 'cat-peripherals',
    categoryName: 'Keyboards & Peripherals',
    subcategory: 'Wireless Mice',
    price: 9995,
    originalPrice: 11995,
    discount: 17,
    stock: 25,
    rating: 4.9,
    reviewCount: 78,
    featured: false,
    trending: true,
    newArrival: false,
    badge: '8K DPI MagSpeed',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Graphite', 'Pale Grey'],
    description: 'Quiet Clicks deliver 90% less click noise. 8,000 DPI track-on-glass optical sensor, MagSpeed electromagnetic scroll wheel that scrolls 1,000 lines per second, and ergonomic thumb rest.',
    specifications: {
      'Sensor': 'Darkfield High Precision 8,000 DPI (tracks on glass min 4mm)',
      'Scroll Wheel': 'MagSpeed electromagnetic with Smartshift mechanism',
      'Buttons': '7 buttons (Left/Right-click, Back/Forward, App-Switch, Thumb Wheel)',
      'Battery': '500 mAh rechargeable Li-Po (Up to 70 days on full charge)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-logitech-g-pro-x-superlight-2',
    name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse',
    brand: 'Logitech',
    categoryId: 'cat-peripherals',
    categoryName: 'Keyboards & Peripherals',
    subcategory: 'Wireless Mice',
    price: 14995,
    originalPrice: 16995,
    discount: 12,
    stock: 14,
    rating: 4.8,
    reviewCount: 36,
    featured: false,
    trending: false,
    newArrival: true,
    badge: '60g Ultra-Light',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Black', 'White', 'Magenta'],
    description: 'Weighing only 60 grams, built in collaboration with world champion esports pros. LIGHTFORCE hybrid optical-mechanical switches and HERO 2 sensor with up to 32,000 DPI and 4K wireless polling.',
    specifications: {
      'Weight': '60 grams featherweight',
      'Sensor': 'HERO 2 Sensor (100 - 32,000 DPI, >500 IPS, 40G acceleration)',
      'Switches': 'LIGHTFORCE optical-mechanical hybrid',
      'Polling Rate': '4,000 Hz LIGHTSPEED Wireless polling'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },

  // Smartwatches
  {
    id: 'prod-apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2 (49mm Titanium, Cellular, Ocean Band)',
    brand: 'Apple',
    categoryId: 'cat-smartwatches',
    categoryName: 'Smartwatches',
    subcategory: 'Cellular Smartwatches',
    price: 89900,
    originalPrice: 94900,
    discount: 5,
    stock: 10,
    rating: 4.9,
    reviewCount: 26,
    featured: true,
    trending: true,
    newArrival: false,
    badge: '3000 Nits Titanium',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Natural Titanium', 'Black Titanium'],
    description: 'Rugged 49mm aerospace-grade titanium case with flat sapphire crystal display. 3,000 nits peak brightness, precision dual-frequency GPS, customizable Action button, and 100m water resistance.',
    specifications: {
      'Case': '49mm Aerospace-grade Titanium case with raised edge protection',
      'Display': 'Always-On Retina OLED (Up to 3,000 nits peak brightness)',
      'Chip': 'S9 SiP with 64-bit dual-core processor and 4-core Neural Engine',
      'Water Resistance': '100m water resistance, EN13319 certified for diving to 40m',
      'Battery': 'Up to 36 hours regular use (Up to 72 hours in Low Power Mode)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'prod-galaxy-watch-ultra',
    name: 'Samsung Galaxy Watch Ultra (47mm Titanium, LTE)',
    brand: 'Samsung',
    categoryId: 'cat-smartwatches',
    categoryName: 'Smartwatches',
    subcategory: 'Cellular Smartwatches',
    price: 59999,
    originalPrice: 65999,
    discount: 9,
    stock: 12,
    rating: 4.7,
    reviewCount: 18,
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Cushion Titanium Design',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop'
    ],
    colors: ['Titanium Gray', 'Titanium Silver', 'Titanium White'],
    description: '3nm processor for seamless performance and battery efficiency. Dual-frequency GPS, Functional Quick Button, 10ATM water resistance with Marine Band, and advanced BioActive Health sensor.',
    specifications: {
      'Build': 'Grade 4 Titanium cushion case with sapphire crystal glass',
      'Processor': 'Exynos W1000 (3nm, 5-Core)',
      'Display': '1.5-inch Super AMOLED (480x480, 3,000 nits)',
      'Water Resistance': '10ATM + IP68 + MIL-STD-810H durability',
      'Battery': '590 mAh (Up to 100 hrs in Power Saving Mode)'
    },
    adminEmail: 'admin@buygen.com',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-iphone-16-pro',
    userId: 'user-sample-1',
    userName: 'Karthik Raman',
    rating: 5,
    comment: 'The 5x telephoto optical zoom and battery endurance on the 16 Pro Max are astounding. Titanium finish feels much lighter in hand.',
    orderId: 'ORD-94281',
    createdAt: '2026-09-12T10:30:00.000Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-macbook-pro-16',
    userId: 'user-sample-2',
    userName: 'Ananya Sharma',
    rating: 5,
    comment: 'Rendered a 4K 10-bit ProRes timeline in Premiere Pro with zero thermal throttling. The Liquid Retina XDR screen is unmatched.',
    orderId: 'ORD-81729',
    createdAt: '2026-09-14T14:20:00.000Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-sony-wh1000xm5',
    userId: 'user-sample-3',
    userName: 'Vignesh Balaji',
    rating: 5,
    comment: 'Noise cancellation in flights completely silences the engine roar. Battery easily lasted through a round trip to Dubai.',
    orderId: 'ORD-72941',
    createdAt: '2026-09-18T18:45:00.000Z'
  }
];
