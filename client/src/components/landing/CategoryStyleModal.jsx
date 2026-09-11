import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIconMap } from '../../data/categoryIcons';
import { iconService } from '../../services/iconService';
import { X, Search, Check, Layers, CircleDot, Palette, Grid3X3, ArrowRight, SlidersHorizontal } from 'lucide-react';
import {
  getDirectR2Url,
  fetchAndCacheSvg,
  getCachedSvg,
  normalizeSvgForCanvas,
  getSafeIconUrl,
} from '../../services/svgCacheService';
import { cleanIconTitle } from '../../utils/titleCleaner';

const styleOptions = [
  { id: 'filled', label: 'Fill / Bold', icon: CircleDot, desc: 'Solid filled glyphs' },
  { id: 'outline', label: 'Outline', icon: Layers, desc: 'Clean stroke line icons' },
  { id: 'color', label: 'Color / Flat', icon: Palette, desc: 'Multi-color vibrant assets' },
  { id: 'all', label: 'All Styles', icon: Grid3X3, desc: 'Complete category collection' },
];

export const CATEGORY_PREVIEW_KEYWORDS = {
  interface: 'home,settings,search,bell,user,menu,check,filter',
  shopping: 'cart,store,basket,bag,shop,sale,price,checkout',
  brands: 'google,apple,github,twitter,figma,spotify,slack,instagram,youtube',
  charts: 'chart,graph,analytics,diagram,dashboard,statistic,pie',
  ai: 'robot,brain,chip,neural,bot,spark,algorithm',
  code: 'code,git,terminal,developer,browser,database,html',
  files: 'file,folder,document,pdf,text,archive,paper',
  business: 'briefcase,wallet,bank,cash,money,dollar,handshake',
  food: 'coffee,burger,pizza,cake,drink,bread,food,restaurant',
  transport: 'plane,car,truck,bus,train,vehicle,bicycle,ship',
  weather: 'cloud,sun,rain,wind,umbrella,storm,snow,moon',
  music: 'music,headphones,volume,sound,speaker,note,mic,audio',
  media: 'camera,video,film,photo,play,movie,image',
  security: 'shield,lock,padlock,password,protection,safe,guard',
  'health-medical': 'hospital,medical,pill,stethoscope,doctor,pulse,cross',
  nature: 'plant,tree,leaf,flower,seed,forest,sprout',
  education: 'book,graduation,school,pencil,student,diploma',
  emoji: 'smile,heart,laugh,grin,star,fire,happy',
  animals: 'cat,dog,bird,fish,bear,rabbit,animal',
  tools: 'wrench,hammer,screwdriver,tool,repair',
  travel: 'passport,luggage,ticket,hotel,compass,map',
  arrows: 'arrow,chevron,direction,pointer',
  devices: 'phone,laptop,tablet,computer,device,screen',
  sports: 'ball,trophy,medal,football,basketball,tennis,sport',
  design: 'palette,pen,brush,vector,layer,design,art',
  social: 'share,heart,like,chat,message,social,user',
  settings: 'settings,gear,cog,filter,adjust,sliders,tool',
  cloud: 'cloud,storage,upload,download,server,database',
  time: 'clock,watch,time,calendar,alarm,timer,hour',
  home: 'home,house,building,door,roof,room,window',
  photography: 'camera,photo,lens,focus,image,picture,film',
  science: 'atom,flask,lab,test,molecule,dna,science',
  calendar: 'calendar,date,schedule,event,month,year',
  art: 'art,palette,brush,easel,canvas,draw,paint',
  buildings: 'building,house,office,bank,store,city,tower',
  mail: 'mail,email,envelope,inbox,send,letter,message',
  maps: 'map,pin,location,navigation,gps,compass,marker',
  alerts: 'alert,warning,info,bell,exclamation,error,notice',
  energy: 'battery,power,lightning,energy,electricity,charge',
  game: 'game,gamepad,controller,dice,play,joystick',
  gifts: 'gift,box,present,ribbon,party,surprise',
  people: 'user,users,person,people,team,group,profile',
  notifications: 'bell,ring,notification,alarm,alert,notice',
  network: 'network,wifi,signal,router,connection,globe',
  shapes: 'circle,square,triangle,hexagon,star,shape,polygon',
  communication: 'chat,message,bubble,speech,talk,discussion,phone',
};

export const previewCache = new Map();

/**
 * Prefetch category preview icons on hover for instantaneous modal render
 */
export const prefetchCategoryPreviews = async (categorySlug, style = 'filled') => {
  if (!categorySlug) return;
  const cacheKey = `${categorySlug}_${style}`;
  if (previewCache.has(cacheKey)) return;

  try {
    const params = {
      category: categorySlug,
      style: style !== 'all' ? style : undefined,
      q: CATEGORY_PREVIEW_KEYWORDS[categorySlug] || undefined,
      limit: 5,
      skipCount: 'true',
    };
    let res = await iconService.getIcons(params);
    // Fallback: If keywords returned 0 icons, load top icons in category directly
    if ((!res.data || !res.data.icons || res.data.icons.length === 0) && params.q) {
      res = await iconService.getIcons({
        category: categorySlug,
        style: style !== 'all' ? style : undefined,
        limit: 5,
        skipCount: 'true',
      });
    }

    if (res.data && res.data.icons && res.data.icons.length > 0) {
      const list = res.data.icons.slice(0, 5);
      previewCache.set(cacheKey, list);
      // Pre-warm SVG vector cache for all 5 preview icons
      list.forEach((ic) => {
        const iconId = ic._id || ic.slug;
        const directCdnUrl = ic.r2Url || getDirectR2Url(ic);
        const proxyUrl = ic.svgUrl && ic.svgUrl.startsWith('/api') ? ic.svgUrl : (ic._id ? `/api/icons/svg/${ic._id}` : '');
        const fetchUrl = directCdnUrl || proxyUrl;
        if (fetchUrl) {
          fetchAndCacheSvg(fetchUrl, iconId, proxyUrl);
        }
      });
    }
  } catch (err) {
    // Silently handle prefetch errors
  }
};

/**
 * Individual preview item rendering real vector SVGs with direct DOM mounting,
 * normalization, caching, and fallback protection.
 */
const PreviewIconItem = ({ icon }) => {
  const iconId = icon._id || icon.slug;
  const directCdnUrl = icon.r2Url || getDirectR2Url(icon);
  const proxyUrl = icon.svgUrl && icon.svgUrl.startsWith('/api') ? icon.svgUrl : (icon._id ? `/api/icons/svg/${icon._id}` : '');
  const displayTitle = cleanIconTitle(icon.title);

  const cachedSvg = icon.svgContent
    ? normalizeSvgForCanvas(icon.svgContent, iconId)
    : (getCachedSvg(iconId) || getCachedSvg(proxyUrl) || getCachedSvg(directCdnUrl));

  const [svgMarkup, setSvgMarkup] = useState(cachedSvg);
  const [imgFallback, setImgFallback] = useState(false);

  useEffect(() => {
    const newCached = icon.svgContent
      ? normalizeSvgForCanvas(icon.svgContent, iconId)
      : (getCachedSvg(iconId) || getCachedSvg(proxyUrl) || getCachedSvg(directCdnUrl));
    setSvgMarkup(newCached);
    setImgFallback(false);
  }, [iconId, directCdnUrl, proxyUrl, icon.svgContent]);

  useEffect(() => {
    if (svgMarkup) return;
    let isMounted = true;
    const fetchUrl = directCdnUrl || proxyUrl;
    if (!fetchUrl) return;

    fetchAndCacheSvg(fetchUrl, iconId, proxyUrl)
      .then((raw) => {
        if (isMounted && raw) {
          setSvgMarkup(normalizeSvgForCanvas(raw, iconId));
        }
      })
      .catch(() => {
        if (isMounted) setImgFallback(true);
      });

    return () => {
      isMounted = false;
    };
  }, [iconId, directCdnUrl, proxyUrl, svgMarkup]);

  return (
    <div
      className="h-16 rounded-xl bg-white border border-landing-surface-container flex flex-col items-center justify-center p-1.5 shadow-2xs hover:shadow-xs transition-all group overflow-hidden"
      title={displayTitle}
    >
      <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden relative shrink-0">
        {svgMarkup ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block [&>svg]:m-auto [&>svg]:overflow-hidden"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : !imgFallback ? (
          <img
            src={directCdnUrl || proxyUrl}
            alt={displayTitle}
            className="w-full h-full max-w-full max-h-full object-contain m-auto"
            loading="eager"
            onError={() => {
              // Try fetching raw vector on image load error
              const fetchUrl = directCdnUrl || proxyUrl;
              if (fetchUrl && !svgMarkup) {
                fetchAndCacheSvg(fetchUrl, iconId, proxyUrl)
                  .then((raw) => {
                    if (raw) setSvgMarkup(normalizeSvgForCanvas(raw, iconId));
                    else setImgFallback(true);
                  })
                  .catch(() => setImgFallback(true));
              } else {
                setImgFallback(true);
              }
            }}
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-landing-surface-container" />
        )}
      </div>
      <span className="text-[9px] font-medium text-landing-on-surface-variant truncate w-full text-center mt-1 px-1">
        {displayTitle}
      </span>
    </div>
  );
};

const CategoryStyleModal = ({ isOpen, onClose, category }) => {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState('filled');
  const [previewIcons, setPreviewIcons] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (!isOpen || !category) return;

    const cacheKey = `${category.slug}_${selectedStyle}`;
    if (previewCache.has(cacheKey)) {
      setPreviewIcons(previewCache.get(cacheKey));
      setLoadingPreview(false);
      return;
    }

    let isMounted = true;
    const fetchPreviews = async () => {
      setLoadingPreview(true);
      try {
        const params = {
          category: category.slug,
          style: selectedStyle !== 'all' ? selectedStyle : undefined,
          q: CATEGORY_PREVIEW_KEYWORDS[category.slug] || undefined,
          limit: 5,
          skipCount: 'true',
        };
        let res = await iconService.getIcons(params);
        if ((!res.data || !res.data.icons || res.data.icons.length === 0) && params.q) {
          res = await iconService.getIcons({
            category: category.slug,
            style: selectedStyle !== 'all' ? selectedStyle : undefined,
            limit: 5,
            skipCount: 'true',
          });
        }
        if (isMounted && res.data && res.data.icons) {
          const list = res.data.icons.slice(0, 5);
          previewCache.set(cacheKey, list);
          setPreviewIcons(list);
          // Pre-warm SVG vector cache for all 5 preview icons
          list.forEach((ic) => {
            const iconId = ic._id || ic.slug;
            const directCdnUrl = ic.r2Url || getDirectR2Url(ic);
            const proxyUrl = ic.svgUrl && ic.svgUrl.startsWith('/api') ? ic.svgUrl : (ic._id ? `/api/icons/svg/${ic._id}` : '');
            const fetchUrl = directCdnUrl || proxyUrl;
            if (fetchUrl) {
              fetchAndCacheSvg(fetchUrl, iconId, proxyUrl);
            }
          });
        }
      } catch (err) {
        if (isMounted) setPreviewIcons([]);
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    };

    fetchPreviews();
    return () => {
      isMounted = false;
    };
  }, [isOpen, category, selectedStyle]);

  // Background warm other styles when modal is opened for instant switching
  useEffect(() => {
    if (!isOpen || !category) return;
    const otherStyles = ['outline', 'color', 'all', 'filled'].filter((s) => s !== selectedStyle);
    otherStyles.forEach((style) => {
      prefetchCategoryPreviews(category.slug, style);
    });
  }, [isOpen, category, selectedStyle]);

  if (!isOpen || !category) return null;

  const IconComp = CategoryIconMap[category.iconName] || Layers;

  const handleSearch = () => {
    navigate(`/search?category=${category.slug}&style=${selectedStyle}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white border border-landing-surface-container shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-landing-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${category.color || '#00327d'}18`, color: category.color || '#00327d' }}
            >
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold font-heading text-landing-primary">
                {category.name} Icons
              </h2>
              <p className="text-xs text-landing-on-surface-variant font-medium">
                Choose the icon style you want to explore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-landing-on-surface-variant hover:text-landing-primary hover:bg-landing-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Style Selection Cards / Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-landing-primary tracking-wide flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-landing-primary" />
              <span>Select Icon Style</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {styleOptions.map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = selectedStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer relative ${
                      isSelected
                        ? 'bg-landing-primary text-white border-landing-primary shadow-sm scale-102'
                        : 'bg-landing-surface-container-low hover:bg-landing-surface-container border-landing-surface-container text-landing-on-surface'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <OptIcon className={`w-4 h-4 ${isSelected ? 'text-landing-sunny-yellow' : 'text-landing-primary'}`} />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Icon Preview Strip */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-landing-surface-container-low border border-landing-surface-container">
            <div className="flex items-center justify-between text-[11px] font-bold text-landing-on-surface-variant">
              <span>Live Preview ({selectedStyle.toUpperCase()})</span>
              <span>5 sample icons</span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {loadingPreview ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-white border border-landing-surface-container/60 animate-shimmer"
                  />
                ))
              ) : previewIcons.length > 0 ? (
                previewIcons.map((ic) => (
                  <PreviewIconItem key={ic._id || ic.slug} icon={ic} />
                ))
              ) : (
                <div className="col-span-5 py-4 text-center text-xs text-landing-on-surface-variant">
                  No preview icons available for this style
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Search Button on Right Corner */}
        <div className="px-5 sm:px-6 py-4 bg-landing-surface-container/40 border-t border-landing-surface-container flex items-center justify-between gap-3">
          <p className="text-[11px] text-landing-on-surface-variant font-medium hidden sm:block">
            Showing <strong className="capitalize text-landing-primary">{selectedStyle}</strong> icons first, followed by others.
          </p>

          <button
            type="button"
            onClick={handleSearch}
            className="ml-auto px-5 py-2.5 rounded-2xl bg-energy-gradient text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search & Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryStyleModal;
