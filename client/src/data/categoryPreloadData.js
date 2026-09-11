import {
  // Interface & Common
  Home, Settings, Search, Bell, CheckSquare, Sliders, ToggleLeft, Wrench, ShieldCheck,
  // Shopping & Commerce
  ShoppingCart, Store, ShoppingBag, Tag, CreditCard,
  // Brands
  Award, Github, Twitter, Youtube, Chrome,
  // Charts & Metrics
  BarChart3, LineChart, PieChart, TrendingUp, Activity,
  // AI & Tech
  Sparkles, Cpu, Bot, Brain, Wand2,
  // Code & Dev
  Code2, Terminal, GitBranch, Database, Braces,
  // Files & Docs
  FileText, Folder, Archive, FileCode, FileSpreadsheet,
  // Business & Finance
  Briefcase, Building2, Landmark, Wallet, DollarSign,
  // Food & Dining
  Utensils, Coffee, Pizza, Apple, Cake,
  // Transport & Vehicles
  Truck, Car, Plane, Train, Bike, Luggage, Hotel,
  // Weather
  CloudSun, CloudRain, Sun, Zap, Snowflake, Moon,
  // Music & Audio
  Music, Headphones, Volume2, Mic, Radio,
  // Media & Video
  Film, Video, Camera, PlayCircle, Image,
  // Security
  Lock, Key, Fingerprint, Eye,
  // Health & Medical
  HeartPulse, Stethoscope, Pill, Hospital, Syringe,
  // Nature
  Trees, Leaf, Flower2, Sprout, Mountain,
  // Education
  GraduationCap, BookOpen, School, Library,
  // Emoji & Emotions
  Smile, Heart, ThumbsUp, Star, Flame, Frown, Laugh,
  // Animals
  Cat, Dog, Bird, Fish, PawPrint,
  // Tools & Hardware
  Hammer, Scissors, Ruler,
  // Devices & Hardware
  Laptop, Smartphone, Tablet, Monitor, Watch,
  // Design & Art
  PenTool, Palette, Layers, Brush, Pipette, Paintbrush, Frame,
  // Social & People
  Share2, MessageCircle, Users, Send, User, UserCheck, UserPlus, HeartHandshake,
  // Cloud & Network
  Cloud, CloudUpload, CloudDownload, Server, HardDrive, Network, Wifi, Router, Globe,
  // Time & Calendar
  Clock, Hourglass, Calendar, Timer, CalendarDays, CalendarCheck,
  // Home & Furniture
  Bed, Lamp, DoorClosed, Armchair, Tv,
  // Photography
  Aperture, Target,
  // Science & Space
  FlaskConical, Atom, Dna, TestTube, Microscope, Rocket, Telescope, Orbit,
  // Buildings
  Castle, Warehouse, Factory,
  // Mail & Communication
  Mail, Inbox, MailOpen, MailCheck, MessageSquare, Phone,
  // Maps & Location
  MapPin, Navigation, Compass, Map,
  // Alerts & Emergency
  AlertCircle, AlertTriangle, Info, BellRing, ShieldAlert, Siren, PhoneCall, LifeBuoy,
  // Energy
  BatteryCharging, Power,
  // Games & Sports
  Gamepad2, Trophy, Dice5, Swords, Medal, Dumbbell, Flag,
  // Gifts & Events
  Gift, PartyPopper, Ticket,
  // Notifications
  BellPlus,
  // Shapes & Abstract
  Circle, Square, Triangle, Hexagon, Shapes, Component, Boxes, Spline,
  // Accessibility
  Accessibility, Ear, Glasses, Footprints, Hand,
  // Clipboard
  Clipboard, ClipboardList, ClipboardCheck, ClipboardCopy, ClipboardEdit,
  // Clothing
  Shirt, Crown,
  // Edit
  Pencil, PenLine, FileEdit, Eraser,
  // Layout
  LayoutGrid, LayoutList, Columns, Rows, PanelLeft,
  // Legal
  Scale, Gavel, FileCheck, Shield, ScrollText,
  // Stars & Ratings
  StarHalf, Bookmark,
  // Text & Typography
  Type, Heading, AlignLeft, Bold,
  // Misc
  Grid3X3,
  // Arrows
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Repeat
} from 'lucide-react';

/**
 * Curated 5-icon apt sets for every single canonical category in IconsUniverse.
 * Guaranteed 0ms instant loading, perfect 24x24 Lucide vector paths, and 100% thematic relevance.
 */
export const CATEGORY_PRELOADED_ICONS = {
  // 1. Interface
  interface: [
    { title: 'Home', comp: Home },
    { title: 'Settings', comp: Settings },
    { title: 'Search', comp: Search },
    { title: 'Bell', comp: Bell },
    { title: 'Check', comp: CheckSquare },
  ],

  // 2. Abstract
  abstract: [
    { title: 'Shapes', comp: Shapes },
    { title: 'Component', comp: Component },
    { title: 'Boxes', comp: Boxes },
    { title: 'Hexagon', comp: Hexagon },
    { title: 'Spline', comp: Spline },
  ],

  // 3. Accessibility
  accessibility: [
    { title: 'Access', comp: Accessibility },
    { title: 'Vision', comp: Eye },
    { title: 'Hearing', comp: Ear },
    { title: 'Glasses', comp: Glasses },
    { title: 'Mobility', comp: Footprints },
  ],

  // 4. AI
  ai: [
    { title: 'Sparkles', comp: Sparkles },
    { title: 'Microchip', comp: Cpu },
    { title: 'Robot', comp: Bot },
    { title: 'Neural', comp: Brain },
    { title: 'Magic', comp: Wand2 },
  ],

  // 5. Alerts
  alerts: [
    { title: 'Alert', comp: AlertCircle },
    { title: 'Warning', comp: AlertTriangle },
    { title: 'Notice', comp: Info },
    { title: 'Alarm', comp: BellRing },
    { title: 'Shield Alert', comp: ShieldAlert },
  ],

  // 6. Animals
  animals: [
    { title: 'Cat', comp: Cat },
    { title: 'Dog', comp: Dog },
    { title: 'Bird', comp: Bird },
    { title: 'Fish', comp: Fish },
    { title: 'Paw', comp: PawPrint },
  ],

  // 7. Art
  art: [
    { title: 'Palette', comp: Palette },
    { title: 'Paint', comp: Paintbrush },
    { title: 'Frame', comp: Frame },
    { title: 'Canvas', comp: Image },
    { title: 'Sketch', comp: Brush },
  ],

  // 8. Body Parts
  'body-parts': [
    { title: 'Hand', comp: Hand },
    { title: 'Foot', comp: Footprints },
    { title: 'Eye', comp: Eye },
    { title: 'Ear', comp: Ear },
    { title: 'Brain', comp: Brain },
  ],

  // 9. Brands
  brands: [
    { title: 'Github', comp: Github },
    { title: 'Twitter', comp: Twitter },
    { title: 'Youtube', comp: Youtube },
    { title: 'Chrome', comp: Chrome },
    { title: 'Brand Award', comp: Award },
  ],

  // 10. Buildings
  buildings: [
    { title: 'Skyscraper', comp: Building2 },
    { title: 'Landmark', comp: Landmark },
    { title: 'Castle', comp: Castle },
    { title: 'Warehouse', comp: Warehouse },
    { title: 'Factory', comp: Factory },
  ],

  // 11. Business
  business: [
    { title: 'Briefcase', comp: Briefcase },
    { title: 'Corporate', comp: Building2 },
    { title: 'Bank', comp: Landmark },
    { title: 'Wallet', comp: Wallet },
    { title: 'Finance', comp: DollarSign },
  ],

  // 12. Calendar
  calendar: [
    { title: 'Calendar', comp: Calendar },
    { title: 'Schedule', comp: CalendarDays },
    { title: 'Event', comp: CalendarCheck },
    { title: 'Time', comp: Clock },
    { title: 'Deadline', comp: Timer },
  ],

  // 13. Charts
  charts: [
    { title: 'Bar Chart', comp: BarChart3 },
    { title: 'Line Chart', comp: LineChart },
    { title: 'Pie Chart', comp: PieChart },
    { title: 'Growth', comp: TrendingUp },
    { title: 'Metrics', comp: Activity },
  ],

  // 14. Clipboard
  clipboard: [
    { title: 'Clipboard', comp: Clipboard },
    { title: 'Checklist', comp: ClipboardList },
    { title: 'Completed', comp: ClipboardCheck },
    { title: 'Copy', comp: ClipboardCopy },
    { title: 'Edit Sheet', comp: ClipboardEdit },
  ],

  // 15. Clothing
  clothing: [
    { title: 'Shirt', comp: Shirt },
    { title: 'Watch', comp: Watch },
    { title: 'Eyewear', comp: Glasses },
    { title: 'Crown', comp: Crown },
    { title: 'Tag', comp: Tag },
  ],

  // 16. Cloud
  cloud: [
    { title: 'Cloud', comp: Cloud },
    { title: 'Upload', comp: CloudUpload },
    { title: 'Download', comp: CloudDownload },
    { title: 'Server', comp: Server },
    { title: 'Storage', comp: HardDrive },
  ],

  // 17. Code
  code: [
    { title: 'Code', comp: Code2 },
    { title: 'Terminal', comp: Terminal },
    { title: 'Git Branch', comp: GitBranch },
    { title: 'Database', comp: Database },
    { title: 'Syntax', comp: Braces },
  ],

  // 18. Communication
  communication: [
    { title: 'Chat', comp: MessageSquare },
    { title: 'Phone', comp: Phone },
    { title: 'Send', comp: Send },
    { title: 'Discuss', comp: MessageCircle },
    { title: 'Email', comp: Mail },
  ],

  // 19. Design
  design: [
    { title: 'Vector Pen', comp: PenTool },
    { title: 'Palette', comp: Palette },
    { title: 'Layers', comp: Layers },
    { title: 'Brush', comp: Brush },
    { title: 'Picker', comp: Pipette },
  ],

  // 20. Devices
  devices: [
    { title: 'Laptop', comp: Laptop },
    { title: 'Phone', comp: Smartphone },
    { title: 'Tablet', comp: Tablet },
    { title: 'Monitor', comp: Monitor },
    { title: 'Watch', comp: Watch },
  ],

  // 21. Edit
  edit: [
    { title: 'Pencil', comp: Pencil },
    { title: 'Write', comp: PenLine },
    { title: 'Edit File', comp: FileEdit },
    { title: 'Eraser', comp: Eraser },
    { title: 'Cut', comp: Scissors },
  ],

  // 22. Education
  education: [
    { title: 'Graduate', comp: GraduationCap },
    { title: 'Book', comp: BookOpen },
    { title: 'School', comp: School },
    { title: 'Library', comp: Library },
    { title: 'Diploma', comp: Award },
  ],

  // 23. Emergency
  emergency: [
    { title: 'Siren', comp: Siren },
    { title: 'SOS', comp: ShieldAlert },
    { title: 'Fire', comp: Flame },
    { title: 'Emergency Call', comp: PhoneCall },
    { title: 'Rescue', comp: LifeBuoy },
  ],

  // 24. Emoji
  emoji: [
    { title: 'Smile', comp: Smile },
    { title: 'Heart', comp: Heart },
    { title: 'Like', comp: ThumbsUp },
    { title: 'Star', comp: Star },
    { title: 'Fire', comp: Flame },
  ],

  // 25. Emotions
  emotions: [
    { title: 'Happy', comp: Smile },
    { title: 'Love', comp: Heart },
    { title: 'Sad', comp: Frown },
    { title: 'Joy', comp: Laugh },
    { title: 'Passion', comp: Flame },
  ],

  // 26. Energy
  energy: [
    { title: 'Lightning', comp: Zap },
    { title: 'Battery', comp: BatteryCharging },
    { title: 'Power', comp: Flame },
    { title: 'Solar', comp: Sun },
    { title: 'Switch', comp: Power },
  ],

  // 27. Events
  events: [
    { title: 'Party', comp: PartyPopper },
    { title: 'Event', comp: Calendar },
    { title: 'Ticket', comp: Ticket },
    { title: 'Festival', comp: Sparkles },
    { title: 'Celebration', comp: Gift },
  ],

  // 28. Files
  files: [
    { title: 'Document', comp: FileText },
    { title: 'Folder', comp: Folder },
    { title: 'Archive', comp: Archive },
    { title: 'Code File', comp: FileCode },
    { title: 'Sheet', comp: FileSpreadsheet },
  ],

  // 29. Food
  food: [
    { title: 'Dine', comp: Utensils },
    { title: 'Coffee', comp: Coffee },
    { title: 'Pizza', comp: Pizza },
    { title: 'Fruit', comp: Apple },
    { title: 'Dessert', comp: Cake },
  ],

  // 30. Furniture
  furniture: [
    { title: 'Armchair', comp: Armchair },
    { title: 'Bed', comp: Bed },
    { title: 'Lamp', comp: Lamp },
    { title: 'Door', comp: DoorClosed },
    { title: 'Television', comp: Tv },
  ],

  // 31. Game
  game: [
    { title: 'Gamepad', comp: Gamepad2 },
    { title: 'Trophy', comp: Trophy },
    { title: 'Dice', comp: Dice5 },
    { title: 'Combat', comp: Swords },
    { title: 'Play', comp: PlayCircle },
  ],

  // 32. Gifts
  gifts: [
    { title: 'Gift', comp: Gift },
    { title: 'Party', comp: PartyPopper },
    { title: 'Cake', comp: Cake },
    { title: 'Prize', comp: Award },
    { title: 'Surprise', comp: Sparkles },
  ],

  // 33. Health & Medical
  'health-medical': [
    { title: 'Heartbeat', comp: HeartPulse },
    { title: 'Stethoscope', comp: Stethoscope },
    { title: 'Medicine', comp: Pill },
    { title: 'Hospital', comp: Hospital },
    { title: 'Clinic', comp: Syringe },
  ],

  // 34. Home
  home: [
    { title: 'House', comp: Home },
    { title: 'Bed', comp: Bed },
    { title: 'Lamp', comp: Lamp },
    { title: 'Door', comp: DoorClosed },
    { title: 'Living Room', comp: Armchair },
  ],

  // 35. Layout
  layout: [
    { title: 'Grid', comp: LayoutGrid },
    { title: 'List View', comp: LayoutList },
    { title: 'Columns', comp: Columns },
    { title: 'Rows', comp: Rows },
    { title: 'Sidebar', comp: PanelLeft },
  ],

  // 36. Legal
  legal: [
    { title: 'Justice', comp: Scale },
    { title: 'Verdict', comp: Gavel },
    { title: 'Contract', comp: FileCheck },
    { title: 'Compliance', comp: Shield },
    { title: 'Document', comp: ScrollText },
  ],

  // 37. Mail
  mail: [
    { title: 'Mail', comp: Mail },
    { title: 'Inbox', comp: Inbox },
    { title: 'Send', comp: Send },
    { title: 'Read', comp: MailOpen },
    { title: 'Delivered', comp: MailCheck },
  ],

  // 38. Maps
  maps: [
    { title: 'Location', comp: MapPin },
    { title: 'Route', comp: Navigation },
    { title: 'Compass', comp: Compass },
    { title: 'Globe', comp: Globe },
    { title: 'Map', comp: Map },
  ],

  // 39. Media
  media: [
    { title: 'Cinema', comp: Film },
    { title: 'Video', comp: Video },
    { title: 'Camera', comp: Camera },
    { title: 'Play', comp: PlayCircle },
    { title: 'Picture', comp: Image },
  ],

  // 40. Music
  music: [
    { title: 'Note', comp: Music },
    { title: 'Headset', comp: Headphones },
    { title: 'Volume', comp: Volume2 },
    { title: 'Mic', comp: Mic },
    { title: 'Radio', comp: Radio },
  ],

  // 41. Nature
  nature: [
    { title: 'Forest', comp: Trees },
    { title: 'Leaf', comp: Leaf },
    { title: 'Bloom', comp: Flower2 },
    { title: 'Sprout', comp: Sprout },
    { title: 'Mountain', comp: Mountain },
  ],

  // 42. Network
  network: [
    { title: 'Network', comp: Network },
    { title: 'Wi-Fi', comp: Wifi },
    { title: 'Web', comp: Globe },
    { title: 'Server', comp: Server },
    { title: 'Router', comp: Router },
  ],

  // 43. Notifications
  notifications: [
    { title: 'Bell', comp: Bell },
    { title: 'Ringing', comp: BellRing },
    { title: 'New Alert', comp: BellPlus },
    { title: 'Notice', comp: AlertCircle },
    { title: 'Message', comp: MessageSquare },
  ],

  // 44. People
  people: [
    { title: 'User', comp: User },
    { title: 'Team', comp: Users },
    { title: 'Verified', comp: UserCheck },
    { title: 'Add User', comp: UserPlus },
    { title: 'Partner', comp: HeartHandshake },
  ],

  // 45. Photography
  photography: [
    { title: 'Camera', comp: Camera },
    { title: 'Aperture', comp: Aperture },
    { title: 'Photo', comp: Image },
    { title: 'Film', comp: Film },
    { title: 'Focus', comp: Target },
  ],

  // 46. Science
  science: [
    { title: 'Flask', comp: FlaskConical },
    { title: 'Atom', comp: Atom },
    { title: 'DNA', comp: Dna },
    { title: 'Test Tube', comp: TestTube },
    { title: 'Microscope', comp: Microscope },
  ],

  // 47. Security
  security: [
    { title: 'Shield', comp: ShieldCheck },
    { title: 'Lock', comp: Lock },
    { title: 'Key', comp: Key },
    { title: 'Biometric', comp: Fingerprint },
    { title: 'Privacy', comp: Eye },
  ],

  // 48. Settings
  settings: [
    { title: 'Gear', comp: Settings },
    { title: 'Controls', comp: Sliders },
    { title: 'Toggle', comp: ToggleLeft },
    { title: 'Tune', comp: Wrench },
    { title: 'Guard', comp: ShieldCheck },
  ],

  // 49. Shapes
  shapes: [
    { title: 'Circle', comp: Circle },
    { title: 'Square', comp: Square },
    { title: 'Triangle', comp: Triangle },
    { title: 'Hexagon', comp: Hexagon },
    { title: 'Star', comp: Star },
  ],

  // 50. Shopping
  shopping: [
    { title: 'Cart', comp: ShoppingCart },
    { title: 'Store', comp: Store },
    { title: 'Bag', comp: ShoppingBag },
    { title: 'Tag', comp: Tag },
    { title: 'Card', comp: CreditCard },
  ],

  // 51. Social
  social: [
    { title: 'Share', comp: Share2 },
    { title: 'Chat', comp: MessageCircle },
    { title: 'Favorite', comp: Heart },
    { title: 'Community', comp: Users },
    { title: 'Send', comp: Send },
  ],

  // 52. Space
  space: [
    { title: 'Rocket', comp: Rocket },
    { title: 'Telescope', comp: Telescope },
    { title: 'Moon', comp: Moon },
    { title: 'Sun', comp: Sun },
    { title: 'Orbit', comp: Orbit },
  ],

  // 53. Sports
  sports: [
    { title: 'Trophy', comp: Trophy },
    { title: 'Medal', comp: Medal },
    { title: 'Fitness', comp: Dumbbell },
    { title: 'Flag', comp: Flag },
    { title: 'Target', comp: Target },
  ],

  // 54. Stars
  stars: [
    { title: 'Star', comp: Star },
    { title: 'Half Star', comp: StarHalf },
    { title: 'Glitter', comp: Sparkles },
    { title: 'Badge', comp: Award },
    { title: 'Bookmark', comp: Bookmark },
  ],

  // 55. Text
  text: [
    { title: 'Font', comp: Type },
    { title: 'Heading', comp: Heading },
    { title: 'Align', comp: AlignLeft },
    { title: 'Bold', comp: Bold },
    { title: 'Text File', comp: FileText },
  ],

  // 56. Time
  time: [
    { title: 'Clock', comp: Clock },
    { title: 'Watch', comp: Watch },
    { title: 'Hourglass', comp: Hourglass },
    { title: 'Calendar', comp: Calendar },
    { title: 'Timer', comp: Timer },
  ],

  // 57. Tools
  tools: [
    { title: 'Wrench', comp: Wrench },
    { title: 'Hammer', comp: Hammer },
    { title: 'Cut', comp: Scissors },
    { title: 'Ruler', comp: Ruler },
    { title: 'Adjust', comp: Sliders },
  ],

  // 58. Transport
  transport: [
    { title: 'Truck', comp: Truck },
    { title: 'Car', comp: Car },
    { title: 'Flight', comp: Plane },
    { title: 'Train', comp: Train },
    { title: 'Bicycle', comp: Bike },
  ],

  // 59. Weather
  weather: [
    { title: 'Sun & Cloud', comp: CloudSun },
    { title: 'Rainy', comp: CloudRain },
    { title: 'Sunny', comp: Sun },
    { title: 'Storm', comp: Zap },
    { title: 'Snow', comp: Snowflake },
  ],

  // 60. Others / General / Full List
  others: [
    { title: 'Collection', comp: Grid3X3 },
    { title: 'Layers', comp: Layers },
    { title: 'Package', comp: Boxes },
    { title: 'Various', comp: Shapes },
    { title: 'Explore', comp: Compass },
  ],

  // Helpful Aliases & Specialized Sub-sets
  travel: [
    { title: 'Flight', comp: Plane },
    { title: 'Luggage', comp: Luggage },
    { title: 'Compass', comp: Compass },
    { title: 'Location', comp: MapPin },
    { title: 'Hotel', comp: Hotel },
  ],

  arrows: [
    { title: 'Right', comp: ArrowRight },
    { title: 'Left', comp: ArrowLeft },
    { title: 'Up', comp: ArrowUp },
    { title: 'Down', comp: ArrowDown },
    { title: 'Cycle', comp: Repeat },
  ],
};

/**
 * Returns the exact 5 apt preloaded icons for any category.
 * Fully supports exact slugs, category names, kebab-case, snake_case, and aliases.
 */
export function getAptPreloadedIcons(categoryIdentifier) {
  if (!categoryIdentifier) return CATEGORY_PRELOADED_ICONS.interface;

  const raw = String(categoryIdentifier).toLowerCase().trim();
  const slugified = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  if (CATEGORY_PRELOADED_ICONS[raw]) return CATEGORY_PRELOADED_ICONS[raw];
  if (CATEGORY_PRELOADED_ICONS[slugified]) return CATEGORY_PRELOADED_ICONS[slugified];

  // Common aliases & variations
  const aliasMap = {
    'health': 'health-medical',
    'medical': 'health-medical',
    'health-and-medical': 'health-medical',
    'health_medical': 'health-medical',
    'clothes': 'clothing',
    'chat': 'communication',
    'audio': 'music',
    'sound': 'music',
    'video': 'media',
    'cinema': 'media',
    'documents': 'files',
    'camera': 'photography',
    'photo': 'photography',
    'finance': 'business',
    'money': 'business',
    'bank': 'business',
    'hardware': 'devices',
    'warning': 'alerts',
    'alert': 'alerts',
    'misc': 'others',
    'more': 'others',
    'all': 'others',
    'full-list': 'others',
    'full': 'others',
    'full_list': 'others',
  };

  const alias = aliasMap[raw] || aliasMap[slugified];
  if (alias && CATEGORY_PRELOADED_ICONS[alias]) {
    return CATEGORY_PRELOADED_ICONS[alias];
  }

  return CATEGORY_PRELOADED_ICONS[raw] || CATEGORY_PRELOADED_ICONS[slugified] || CATEGORY_PRELOADED_ICONS.interface;
}
