import { Category, Product, Review } from '../types/index.ts';

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Flagships, high-performance camera phones & foldable devices',
    icon: 'Smartphone',
    subcategories: ['Flagship Phones', 'Mid-Rangers', 'Foldables', 'Budget Champions']
  },
  {
    id: 'cat-2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Gaming rigs, ultrabooks, creator studios & productivity laptops',
    icon: 'Laptop',
    subcategories: ['Gaming Laptops', 'Ultrabooks', 'Creator Laptops', 'Business Workstations']
  },
  {
    id: 'cat-3',
    name: 'Headphones & Earbuds',
    slug: 'headphones-earbuds',
    description: 'Active noise-cancelling headphones, wireless earbuds & audiophile gear',
    icon: 'Headphones',
    subcategories: ['Over-Ear ANC', 'TWS Earbuds', 'Audiophile', 'Sports Earphones']
  },
  {
    id: 'cat-4',
    name: 'Monitors',
    slug: 'monitors',
    description: 'High refresh rate gaming displays, 4K UHD & curved ultrawide screens',
    icon: 'Monitor',
    subcategories: ['Gaming Monitors', '4K Professional', 'Curved Ultrawide', 'Portable Displays']
  },
  {
    id: 'cat-5',
    name: 'Keyboards & Mouse',
    slug: 'keyboards-mouse',
    description: 'Custom mechanical keyboards, ergonomic mice & gaming peripherals',
    icon: 'Keyboard',
    subcategories: ['Mechanical Keyboards', 'Wireless Mice', 'Ergonomic Peripherals', 'Custom Keycaps']
  },
  {
    id: 'cat-6',
    name: 'Speakers',
    slug: 'speakers',
    description: 'Home theater soundbars, smart assistants & high-fidelity bluetooth speakers',
    icon: 'Volume2',
    subcategories: ['Soundbars', 'Portable Bluetooth', 'Smart Speakers', 'Studio Monitors']
  },
  {
    id: 'cat-7',
    name: 'Smartwatches',
    slug: 'smartwatches',
    description: 'Advanced health trackers, cellular sports watches & luxury timepieces',
    icon: 'Watch',
    subcategories: ['Sports & Fitness', 'Cellular Wearables', 'Rugged Outdoor', 'Everyday Smartwatches']
  },
  {
    id: 'cat-8',
    name: 'Cameras',
    slug: 'cameras',
    description: 'Full-frame mirrorless, action cameras & handheld gimbal stabilization',
    icon: 'Camera',
    subcategories: ['Mirrorless Cameras', 'Action Cams', 'Vlogging Gear', 'Gimbals & Lenses']
  },
  {
    id: 'cat-9',
    name: 'Smart Home',
    slug: 'smart-home',
    description: 'Intelligent security cameras, smart lighting & automated home hubs',
    icon: 'Home',
    subcategories: ['Smart Lighting', 'Security Cameras', 'Smart Displays', 'Power & Plugs']
  },
  {
    id: 'cat-10',
    name: 'Accessories',
    slug: 'accessories',
    description: 'High-speed GaN chargers, Thunderbolt 4 docks & braided high-durability cables',
    icon: 'Cpu',
    subcategories: ['GaN Chargers', 'Thunderbolt Docks', 'MagSafe Accessories', 'High-Speed Cables']
  }
];

export const initialProducts: Product[] = [
  // 1. Smartphones
  {
    id: 'prod-sp-1',
    name: 'Apple iPhone 16 Pro Max (256GB - Desert Titanium)',
    brand: 'Apple',
    categoryId: 'cat-1',
    categoryName: 'Smartphones',
    subcategory: 'Flagship Phones',
    description: 'The pinnacle of smartphone innovation. Features grade 5 titanium design, the groundbreaking A18 Pro chip, 48MP Fusion camera system with 5x optical zoom, and incredible all-day battery life.',
    price: 144900,
    originalPrice: 154900,
    discount: 6,
    stock: 24,
    rating: 4.9,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Apple A18 Pro (3nm)',
      'RAM': '8GB Unified',
      'Storage': '256GB NVMe',
      'Display': '6.9-inch Super Retina XDR OLED, 120Hz ProMotion',
      'Rear Camera': '48MP Main + 48MP Ultra-Wide + 12MP 5x Telephoto',
      'Front Camera': '12MP TrueDepth',
      'Battery': '4685 mAh, 33W Fast Charge & MagSafe',
      'OS': 'iOS 18',
      'Weight': '227 grams'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'Bestseller',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sp-2',
    name: 'Samsung Galaxy S24 Ultra 5G (512GB - Titanium Gray)',
    brand: 'Samsung',
    categoryId: 'cat-1',
    categoryName: 'Smartphones',
    subcategory: 'Flagship Phones',
    description: 'Unleash your creativity and productivity with Galaxy AI. Powered by Snapdragon 8 Gen 3 for Galaxy, 200MP camera system, built-in S-Pen, and flat Titanium armor glass display.',
    price: 129999,
    originalPrice: 144999,
    discount: 10,
    stock: 18,
    rating: 4.8,
    reviewCount: 98,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Snapdragon 8 Gen 3 (4nm)',
      'RAM': '12GB LPDDR5X',
      'Storage': '512GB UFS 4.0',
      'Display': '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits peak',
      'Rear Camera': '200MP + 50MP (5x) + 10MP (3x) + 12MP Ultra-Wide',
      'Battery': '5000 mAh, 45W Fast Charging',
      'OS': 'One UI 6.1 (Android 14) with 7 years updates',
      'Stylus': 'Embedded Bluetooth S-Pen'
    },
    featured: true,
    trending: true,
    newArrival: false,
    badge: 'Galaxy AI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sp-3',
    name: 'OnePlus 12 5G (16GB RAM + 512GB - Silky Black)',
    brand: 'OnePlus',
    categoryId: 'cat-1',
    categoryName: 'Smartphones',
    subcategory: 'Flagship Phones',
    description: 'Smooth Beyond Belief. Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, 5400 mAh battery with ultra-fast 100W SUPERVOOC charging, and 2K 120Hz ProXDR display.',
    price: 64999,
    originalPrice: 69999,
    discount: 7,
    stock: 15,
    rating: 4.7,
    reviewCount: 64,
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Qualcomm Snapdragon 8 Gen 3',
      'RAM': '16GB LPDDR5X',
      'Storage': '512GB UFS 4.0',
      'Display': '6.82-inch 2K 120Hz ProXDR LTPO',
      'Camera': '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide',
      'Charging': '100W Wired + 50W Wireless AIRVOOC',
      'Battery': '5400 mAh Dual Cell'
    },
    featured: false,
    trending: true,
    newArrival: false,
    badge: 'Speed King',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2. Laptops
  {
    id: 'prod-lp-1',
    name: 'Apple MacBook Pro 16-inch (M3 Max, 36GB RAM, 1TB SSD)',
    brand: 'Apple',
    categoryId: 'cat-2',
    categoryName: 'Laptops',
    subcategory: 'Creator Laptops',
    description: 'Mind-blowing performance for extreme workflows. Powered by the 14-core M3 Max chip with 30-core GPU, Liquid Retina XDR display with 1600 nits peak brightness, and up to 22 hours of battery life.',
    price: 349900,
    originalPrice: 379900,
    discount: 8,
    stock: 10,
    rating: 4.9,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Apple M3 Max (14-core CPU, 30-core GPU)',
      'RAM': '36GB Unified Memory',
      'Storage': '1TB Ultra-Fast SSD',
      'Display': '16.2-inch Liquid Retina XDR (3456x2234), 120Hz ProMotion',
      'Ports': '3x Thunderbolt 4, HDMI 2.1, SDXC card slot, MagSafe 3',
      'Battery Life': 'Up to 22 hours video playback',
      'Weight': '2.14 kg',
      'Audio': 'Six-speaker sound system with force-cancelling woofers'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'M3 Max Powerhouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-lp-2',
    name: 'ASUS ROG Zephyrus G16 (Intel Core Ultra 9, RTX 4080, 32GB RAM, 1TB)',
    brand: 'ASUS',
    categoryId: 'cat-2',
    categoryName: 'Laptops',
    subcategory: 'Gaming Laptops',
    description: 'Precision gaming in an ultra-sleek CNC aluminum chassis. Features stunning 2.5K 240Hz ROG Nebula OLED display, NVIDIA GeForce RTX 4080 Laptop GPU, and Slash Lighting on the lid.',
    price: 279990,
    originalPrice: 309990,
    discount: 10,
    stock: 8,
    rating: 4.8,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Intel Core Ultra 9 185H (16 cores, up to 5.1GHz)',
      'Graphics': 'NVIDIA GeForce RTX 4080 12GB GDDR6 (115W TGP)',
      'RAM': '32GB LPDDR5X-7467',
      'Storage': '1TB PCIe 4.0 NVMe M.2 SSD',
      'Display': '16-inch 2.5K (2560x1600) OLED 240Hz 0.2ms G-Sync',
      'Cooling': 'ROG Intelligent Cooling with Vapor Chamber',
      'Weight': '1.95 kg'
    },
    featured: true,
    trending: false,
    newArrival: true,
    badge: 'OLED Gaming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-lp-3',
    name: 'Dell XPS 14 (Intel Core Ultra 7, 16GB RAM, 512GB SSD, FHD+)',
    brand: 'Dell',
    categoryId: 'cat-2',
    categoryName: 'Laptops',
    subcategory: 'Ultrabooks',
    description: 'Iconic modern minimalism. Seamless glass touchpad, touch function row, Intel Core Ultra with dedicated AI NPU, and CNC-machined aluminum body for all-day mobile productivity.',
    price: 154990,
    originalPrice: 169990,
    discount: 9,
    stock: 12,
    rating: 4.6,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Intel Core Ultra 7 155H with Intel AI Boost',
      'RAM': '16GB LPDDR5X',
      'Storage': '512GB PCIe NVMe SSD',
      'Display': '14.5-inch FHD+ InfinityEdge, 100% sRGB, 500 nits',
      'Battery': '69.5 Whr, ExpressCharge 1.0',
      'Weight': '1.68 kg'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-lp-4',
    name: 'ASUS Vivobook 15 OLED (AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD)',
    brand: 'ASUS',
    categoryId: 'cat-2',
    categoryName: 'Laptops',
    subcategory: 'Ultrabooks',
    description: 'Perfect for programming, multitasking, and STEM development. Vibrant 15.6-inch FHD OLED NanoEdge display with 100% DCI-P3 color gamut, 8-core Ryzen 7 processor, 16GB high-speed RAM, and 180-degree lay-flat hinge.',
    price: 64990,
    originalPrice: 79990,
    discount: 18,
    stock: 22,
    rating: 4.8,
    reviewCount: 65,
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'AMD Ryzen 7 7730U (8 cores / 16 threads, up to 4.5GHz)',
      'RAM': '16GB DDR4 3200MHz',
      'Storage': '512GB M.2 NVMe PCIe 3.0 SSD',
      'Display': '15.6-inch FHD (1920 x 1080) OLED 600nits peak',
      'Graphics': 'AMD Radeon Graphics',
      'Keyboard': 'Backlit Chiclet Keyboard with Num-key',
      'Weight': '1.70 kg',
      'Battery': '50WHrs 3-cell Li-ion'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'Best Value Coder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-lp-5',
    name: 'Lenovo IdeaPad Slim 5 (Intel Core i5 13th Gen, 16GB RAM, 1TB SSD)',
    brand: 'Lenovo',
    categoryId: 'cat-2',
    categoryName: 'Laptops',
    subcategory: 'Business Workstations',
    description: 'Military-grade rugged aluminum laptop for software engineering and university. Features 14-inch WUXGA IPS anti-glare display, 16GB LPDDR5 RAM, and massive 1TB PCIe 4.0 SSD.',
    price: 59990,
    originalPrice: 72990,
    discount: 17,
    stock: 18,
    rating: 4.7,
    reviewCount: 52,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Processor': 'Intel Core i5-13420H (10 cores, up to 4.6GHz)',
      'RAM': '16GB LPDDR5-5200',
      'Storage': '1TB SSD M.2 2242 PCIe 4.0x4 NVMe',
      'Display': '14-inch WUXGA (1920x1200) IPS 300nits',
      'Security': 'FHD 1080p camera with Privacy Shutter + IR sensor',
      'Weight': '1.46 kg'
    },
    featured: false,
    trending: true,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3. Headphones & Earbuds
  {
    id: 'prod-hp-1',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Black)',
    brand: 'Sony',
    categoryId: 'cat-3',
    categoryName: 'Headphones & Earbuds',
    subcategory: 'Over-Ear ANC',
    description: 'Industry-leading noise cancellation powered by two processors and 8 microphones. Enjoy ultra-clear hands-free calling, Hi-Res wireless audio with LDAC, and up to 30 hours of continuous battery life.',
    price: 29990,
    originalPrice: 34990,
    discount: 14,
    stock: 35,
    rating: 4.9,
    reviewCount: 312,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Driver Unit': '30mm Carbon Fiber Composite',
      'Noise Cancelling': 'Dual Processor V1 + HD QN1 with Auto NC Optimizer',
      'Battery Life': 'Up to 30 hours (ANC On), 40 hours (ANC Off)',
      'Quick Charge': '3 min charge gives 3 hours playback',
      'Bluetooth': 'Version 5.2, Multipoint connection, LDAC/AAC/SBC',
      'Weight': '250 grams'
    },
    featured: true,
    trending: true,
    newArrival: false,
    badge: 'Industry Leading ANC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-hp-2',
    name: 'Apple AirPods Pro 2nd Gen with USB-C MagSafe Case',
    brand: 'Apple',
    categoryId: 'cat-3',
    categoryName: 'Headphones & Earbuds',
    subcategory: 'TWS Earbuds',
    description: 'Up to 2x more Active Noise Cancellation than the previous generation. Features Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and dust/water resistance.',
    price: 23900,
    originalPrice: 24900,
    discount: 4,
    stock: 45,
    rating: 4.8,
    reviewCount: 220,
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Chip': 'Apple H2 Headphone Chip, Apple U1 in MagSafe Case',
      'Audio Tech': 'Adaptive Audio, Active Noise Cancellation, Transparency Mode',
      'Battery Life': 'Up to 6 hours (30 hours total with MagSafe Case)',
      'Resistance': 'IP54 dust, sweat, and water resistant'
    },
    featured: false,
    trending: true,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-hp-3',
    name: 'Bose QuietComfort Ultra Headphones (White Smoke)',
    brand: 'Bose',
    categoryId: 'cat-3',
    categoryName: 'Headphones & Earbuds',
    subcategory: 'Over-Ear ANC',
    description: 'World-class noise cancellation meets groundbreaking Bose Immersive Audio for a completely realistic soundstage. CustomTune technology personalizes sound performance to your ear canal.',
    price: 35900,
    originalPrice: 38900,
    discount: 8,
    stock: 20,
    rating: 4.8,
    reviewCount: 75,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Spatial Sound': 'Bose Immersive Audio Spatializer',
      'Modes': 'Quiet, Aware, and Immersion',
      'Battery': 'Up to 24 hours (18 hours with Immersive Audio)',
      'Materials': 'Ultra-soft protein leather ear cushions'
    },
    featured: false,
    trending: false,
    newArrival: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 4. Monitors
  {
    id: 'prod-mon-1',
    name: 'LG UltraGear 27-inch OLED QHD 240Hz 0.03ms Gaming Monitor',
    brand: 'LG',
    categoryId: 'cat-4',
    categoryName: 'Monitors',
    subcategory: 'Gaming Monitors',
    description: 'Experience pure blacks and near-instantaneous 0.03ms response time. Features 27-inch QHD OLED panel, blazing 240Hz refresh rate, 98.5% DCI-P3 color gamut, and NVIDIA G-SYNC compatibility.',
    price: 69999,
    originalPrice: 84999,
    discount: 18,
    stock: 14,
    rating: 4.9,
    reviewCount: 54,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Screen Size': '27-inch QHD (2560 x 1440)',
      'Panel Type': 'OLED with Anti-Glare & Low Reflection',
      'Refresh Rate': '240Hz',
      'Response Time': '0.03ms (GtG)',
      'Color Gamut': 'DCI-P3 98.5% (CIE1976)',
      'Ports': '2x HDMI 2.1, 1x DisplayPort 1.4, 2x USB 3.0 downstream',
      'Sync': 'NVIDIA G-Sync Compatible & AMD FreeSync Premium Pro'
    },
    featured: true,
    trending: true,
    newArrival: false,
    badge: '240Hz OLED Speed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-mon-2',
    name: 'Dell UltraSharp 32-inch 4K Video Conferencing Monitor (U3223VZ)',
    brand: 'Dell',
    categoryId: 'cat-4',
    categoryName: 'Monitors',
    subcategory: '4K Professional',
    description: 'Elevate your desktop workflow with brilliant IPS Black technology with 2000:1 contrast ratio, built-in 4K Sony Starvis HDR webcam, echo-cancelling dual mics, and 90W USB-C Power Delivery hub.',
    price: 89990,
    originalPrice: 104990,
    discount: 14,
    stock: 9,
    rating: 4.7,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Resolution': '3840 x 2160 (4K UHD) IPS Black',
      'Contrast Ratio': '2000:1 True Black',
      'Webcam': 'Built-in 4K Sony STARVIS sensor with tilt',
      'Connectivity': 'USB-C Hub (90W PD), RJ45 Ethernet, DisplayPort, HDMI',
      'Speakers': 'Dual 14W stereo speakers'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 5. Keyboards & Mouse
  {
    id: 'prod-kb-1',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (Gateron Jupiter Brown)',
    brand: 'Keychron',
    categoryId: 'cat-5',
    categoryName: 'Keyboards & Mouse',
    subcategory: 'Mechanical Keyboards',
    description: 'Full CNC machined aluminum body, double-gasket design for acoustic comfort, hot-swappable sockets, south-facing RGB backlight, programmable programmable knob, and Bluetooth 5.1 connectivity.',
    price: 17999,
    originalPrice: 19999,
    discount: 10,
    stock: 22,
    rating: 4.9,
    reviewCount: 92,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Body Material': 'Full CNC Machined 6063 Aluminum',
      'Layout': '75% Layout with Multi-function Rotary Knob',
      'Switches': 'Gateron Jupiter Brown (Tactile, Pre-lubed)',
      'Keycaps': 'KSA double-shot PBT keycaps',
      'Connectivity': 'Bluetooth 5.1 (up to 3 devices) + Type-C Wired',
      'Battery': '4000 mAh rechargeable battery (up to 300 hours)'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'Audiophile Thock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-kb-2',
    name: 'Logitech MX Master 3S Wireless Performance Mouse (Graphite)',
    brand: 'Logitech',
    categoryId: 'cat-5',
    categoryName: 'Keyboards & Mouse',
    subcategory: 'Wireless Mice',
    description: 'An icon remastered. Quiet Clicks provide satisfying tactile feel with 90% less click noise, 8000 DPI track-on-glass sensor, and the MagSpeed electromagnetic scroll wheel that scrolls 1,000 lines a second.',
    price: 9495,
    originalPrice: 10995,
    discount: 14,
    stock: 40,
    rating: 4.8,
    reviewCount: 260,
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Sensor': 'Darkfield high precision (200 - 8000 DPI)',
      'Scroll Wheel': 'MagSpeed Electromagnetic Scroll with SmartShift',
      'Buttons': '7 buttons with thumbwheel and gesture button',
      'Battery': 'Rechargeable Li-Po (500 mAh) - up to 70 days per charge',
      'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB Receiver'
    },
    featured: false,
    trending: true,
    newArrival: false,
    badge: 'Ergonomic Standard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 6. Speakers
  {
    id: 'prod-spk-1',
    name: 'Sonos Era 300 Spatial Audio Smart Speaker (Matte Black)',
    brand: 'Sonos',
    categoryId: 'cat-6',
    categoryName: 'Speakers',
    subcategory: 'Smart Speakers',
    description: 'Revolutionary spatial audio speaker featuring six optimally positioned drivers that project sound from wall to wall and ceiling to floor. Supports Dolby Atmos Music, Apple AirPlay 2, and Trueplay tuning.',
    price: 54999,
    originalPrice: 59999,
    discount: 8,
    stock: 16,
    rating: 4.8,
    reviewCount: 48,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Acoustic Drivers': '4 tweeters, 2 woofers powered by 6 Class-D digital amplifiers',
      'Audio Formats': 'Dolby Atmos Music, High-Res Audio',
      'Connectivity': 'Wi-Fi 6, Bluetooth 5.0, USB-C Line In with adapter',
      'Voice Assistant': 'Sonos Voice Control, Amazon Alexa built-in'
    },
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Dolby Atmos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-spk-2',
    name: 'Marshall Acton III Bluetooth Home Speaker (Black & Brass)',
    brand: 'Marshall',
    categoryId: 'cat-6',
    categoryName: 'Speakers',
    subcategory: 'Portable Bluetooth',
    description: 'A wider soundstage that delivers signature heavy-hitting room-filling sound. Features analog control knobs for bass and treble, iconic vintage fret design, and Bluetooth 5.2 readiness.',
    price: 31999,
    originalPrice: 34999,
    discount: 9,
    stock: 19,
    rating: 4.7,
    reviewCount: 62,
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Amplifiers': 'One 30W Class D (Woofer) + Two 15W Class D (Tweeters)',
      'Frequency Range': '45-20,000 Hz',
      'Controls': 'Brass knobs for Volume, Bass, and Treble',
      'Inputs': 'Bluetooth 5.2, 3.5mm Aux'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 7. Smartwatches
  {
    id: 'prod-sw-1',
    name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium - Orange Ocean Band)',
    brand: 'Apple',
    categoryId: 'cat-7',
    categoryName: 'Smartwatches',
    subcategory: 'Rugged Outdoor',
    description: 'The ultimate sports and adventure watch. Powered by S9 SiP with Double Tap gesture, brilliant 3000-nit display, precision dual-frequency GPS, depth gauge to 40 meters, and 36-hour normal battery life.',
    price: 89900,
    originalPrice: 89900,
    discount: 0,
    stock: 15,
    rating: 4.9,
    reviewCount: 110,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Case': '49mm aerospace-grade titanium with raised sapphire crystal',
      'Display': 'Always-On Retina display, up to 3000 nits brightness',
      'Sensors': 'ECG, Blood Oxygen, Skin Temperature, Water Depth Gauge',
      'Water Resistance': '100m water resistant, certified EN13319 dive computer',
      'Battery': 'Up to 36 hours regular use, up to 72 hours low power mode'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: 'Adventure Proof',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sw-2',
    name: 'Samsung Galaxy Watch 6 Classic (47mm LTE - Black)',
    brand: 'Samsung',
    categoryId: 'cat-7',
    categoryName: 'Smartwatches',
    subcategory: 'Cellular Wearables',
    description: 'Timeless style with the beloved rotating physical bezel. Advanced sleep coaching, comprehensive body composition analysis (BIA), heart rate zoning, and Wear OS powered by Samsung.',
    price: 36999,
    originalPrice: 43999,
    discount: 16,
    stock: 25,
    rating: 4.7,
    reviewCount: 84,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Bezel': 'Physical rotating stainless steel bezel',
      'Display': '1.5-inch Super AMOLED (480x480), Sapphire Crystal',
      'Sensors': 'BioActive Sensor (Optical Heart Rate + Electrical Heart + BIA)',
      'Connectivity': '4G LTE eSIM, Wi-Fi, Bluetooth 5.3, NFC'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 8. Cameras
  {
    id: 'prod-cam-1',
    name: 'Sony Alpha 7 IV Full-Frame Hybrid Mirrorless Camera (Body Only)',
    brand: 'Sony',
    categoryId: 'cat-8',
    categoryName: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    description: 'The baseline for full-frame excellence. Newly developed 33MP Exmor R back-illuminated CMOS sensor, BIONZ XR engine, 4K 60p 10-bit 4:2:2 recording, Real-time Eye AF for humans, animals, and birds.',
    price: 219990,
    originalPrice: 242990,
    discount: 9,
    stock: 7,
    rating: 4.9,
    reviewCount: 45,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Sensor': '33.0 Megapixel 35mm Full-Frame Exmor R CMOS',
      'Image Processor': 'BIONZ XR (8x processing power)',
      'Autofocus': '759 phase-detection points (94% frame coverage)',
      'Video': '4K 60p 10-bit 4:2:2 in Super 35, 4K 30p 7K oversampled Full-Frame',
      'Stabilization': '5-axis in-body optical image stabilization (5.5 stops)'
    },
    featured: true,
    trending: false,
    newArrival: false,
    badge: 'Pro Creator Choice',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-cam-2',
    name: 'DJI Osmo Pocket 3 Creator Combo (1-inch CMOS Pocket Gimbal)',
    brand: 'DJI',
    categoryId: 'cat-8',
    categoryName: 'Cameras',
    subcategory: 'Vlogging Gear',
    description: 'Compact handheld camera featuring a powerful 1-inch CMOS sensor, 4K/120fps recording, 3-axis mechanical stabilization, 2-inch rotatable OLED touchscreen, and wireless DJI Mic 2 transmitter included.',
    price: 66990,
    originalPrice: 71990,
    discount: 7,
    stock: 17,
    rating: 4.9,
    reviewCount: 78,
    images: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Sensor': '1-inch CMOS Sensor',
      'Screen': '2.0-inch Rotatable OLED Touchscreen',
      'Video': '4K at up to 120fps, 10-bit D-Log M & HLG',
      'Gimbal': '3-Axis Mechanical Stabilization',
      'Audio': 'Three-mic array with stereo recording + DJI Mic 2 included'
    },
    featured: false,
    trending: true,
    newArrival: true,
    badge: 'Vlogging Essential',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 9. Smart Home
  {
    id: 'prod-sh-1',
    name: 'Philips Hue White & Color Ambiance Smart Bulb Starter Kit (E27, 3 Bulbs + Hue Bridge)',
    brand: 'Philips Hue',
    categoryId: 'cat-9',
    categoryName: 'Smart Home',
    subcategory: 'Smart Lighting',
    description: 'Transform your living space with 16 million colors and shades of white light. Sync your smart lights to movies, games, and music. Includes 3 smart bulbs and the Zigbee Hue Bridge.',
    price: 13999,
    originalPrice: 15999,
    discount: 13,
    stock: 28,
    rating: 4.7,
    reviewCount: 114,
    images: [
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Bulb Base': 'E27 Screw Base (800 lumens / 1100 lumens peak)',
      'Colors': '16 Million Colors + 50,000 shades of warm-to-cool white',
      'Control': 'Hue App, Apple HomeKit, Google Assistant, Amazon Alexa',
      'Protocol': 'Zigbee + Bluetooth'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 10. Accessories
  {
    id: 'prod-acc-1',
    name: 'Anker Prime 20,000mAh Power Bank (200W Output with Smart Digital Display)',
    brand: 'Anker',
    categoryId: 'cat-10',
    categoryName: 'Accessories',
    subcategory: 'GaN Chargers',
    description: 'Charge two high-powered laptops simultaneously at 100W each. Real-time smart digital display shows remaining battery capacity, input power, output power, and recharge time estimates.',
    price: 10999,
    originalPrice: 12999,
    discount: 15,
    stock: 32,
    rating: 4.9,
    reviewCount: 168,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Capacity': '20,000 mAh (72Wh)',
      'Total Output': '200W (Max 100W single port)',
      'Ports': '2x USB-C (100W each) + 1x USB-A (65W)',
      'Display': 'Full-color smart TFT display',
      'Fast Recharge': 'Recharges to full in only 75 minutes at 100W input'
    },
    featured: true,
    trending: true,
    newArrival: true,
    badge: '200W Total Beast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-acc-2',
    name: 'CalDigit TS4 Thunderbolt 4 Dock (18 Ports with 98W Power Delivery)',
    brand: 'CalDigit',
    categoryId: 'cat-10',
    categoryName: 'Accessories',
    subcategory: 'Thunderbolt Docks',
    description: 'The king of workstation docks. Features an astounding 18 ports including 3 Thunderbolt 4 ports, 2.5 Gigabit Ethernet, DisplayPort 1.4, SD/microSD 4.0 UHS-II card readers, and 98W host charging.',
    price: 39999,
    originalPrice: 44999,
    discount: 11,
    stock: 11,
    rating: 4.8,
    reviewCount: 52,
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=1000&auto=format&fit=crop'
    ],
    specifications: {
      'Ports': '18 ports (3x TB4, 5x USB-A, 3x USB-C, DP 1.4, 2.5GbE, Audio)',
      'Power Delivery': 'Up to 98W to host laptop',
      'Display Support': 'Up to dual 6K 60Hz or single 8K 60Hz',
      'Ethernet': '2.5GbE RJ-45'
    },
    featured: false,
    trending: false,
    newArrival: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-sp-1',
    userId: 'user-demo-1',
    userName: 'Rohan Sharma',
    rating: 5,
    comment: 'The desert titanium finish is stunning! Battery easily lasts 1.5 days of heavy productivity. 5x zoom is crisp even in low light.',
    createdAt: '2026-09-15T10:30:00.000Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-sp-1',
    userId: 'user-demo-2',
    userName: 'Priya Mehta',
    rating: 5,
    comment: 'Upgrade from iPhone 13 was massive. The 120Hz ProMotion screen and camera shutter button make it feel like a real professional camera.',
    createdAt: '2026-09-20T14:15:00.000Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-lp-1',
    userId: 'user-demo-1',
    userName: 'Rohan Sharma',
    rating: 5,
    comment: 'The M3 Max compiles our massive monorepo in 18 seconds without the fans even turning on. Best developer machine ever built.',
    createdAt: '2026-09-10T12:00:00.000Z'
  },
  {
    id: 'rev-4',
    productId: 'prod-hp-1',
    userId: 'user-demo-2',
    userName: 'Priya Mehta',
    rating: 5,
    comment: 'Flight ANC is pure silence. Cuts out engine hum completely. Super lightweight on head for 8+ hour work sessions.',
    createdAt: '2026-09-18T09:45:00.000Z'
  }
];
