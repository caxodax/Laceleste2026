'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Image as ImageIcon,
  CreditCard,
  Building2,
  Users2,
  Upload,
  Save,
  Loader2,
  Trash2,
  Plus,
  Globe,
  Instagram,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  ToggleLeft as Toggle,
  Check,
} from 'lucide-react';
import { Button, Input, Card, CardContent, Badge, Modal } from '@/components/ui';
import { getAllSettings, updateSettings } from '@/lib/services/settings';
import { uploadProductImage } from '@/lib/services/storage';
import { RestaurantSettings, HeroSettings, AboutSettings, PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

type TabType = 'general' | 'hero' | 'pagos' | 'nosotros';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for different settings groups
  const [general, setGeneral] = useState<RestaurantSettings | null>(null);
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [about, setAbout] = useState<AboutSettings | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const data = await getAllSettings();
      
      setGeneral(data.restaurant_info || null);
      setHero(data.hero_settings || {
        badge: 'Las mejores de Barquisimeto',
        title: 'Hamburguesas Artesanales',
        subtitle: 'Inspiradas en los sabores de Argentina',
        ctaText: 'Ver Menú',
        ctaLink: '/menu',
        secondaryCtaText: 'Hacer Pedido',
        secondaryCtaLink: '/pedido',
        showStats: true,
        useCarousel: false,
        carouselImages: []
      });
      setPayments(data.payment_methods || []);
      setAbout(data.about_settings || {
        title: 'Sobre Nosotros',
        description: 'La mejor experiencia de sabor argentino en Barquisimeto.',
      });
    } catch (error) {
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | 'about' | 'carousel', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(target === 'carousel' ? `carousel-${index}` : target);
    try {
      const result = await uploadProductImage(file);
      if (target === 'logo') setGeneral(prev => prev ? { ...prev, logo: result.image } : null);
      if (target === 'hero') setHero(prev => prev ? { ...prev, backgroundImage: result.image } : null);
      if (target === 'about') setAbout(prev => prev ? { ...prev, image: result.image } : null);
      if (target === 'carousel' && typeof index === 'number') {
        setHero(prev => {
          if (!prev) return null;
          const newImages = [...(prev.carouselImages || [])];
          newImages[index] = result.image;
          return { ...prev, carouselImages: newImages };
        });
      }
      toast.success('Imagen subida correctamente');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(null);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (activeTab === 'general' && general) {
        await updateSettings('restaurant_info', general);
      } else if (activeTab === 'hero' && hero) {
        await updateSettings('hero_settings', hero);
      } else if (activeTab === 'pagos') {
        await updateSettings('payment_methods', payments);
      } else if (activeTab === 'nosotros' && about) {
        await updateSettings('about_settings', about);
      }
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-celeste-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando configuración...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Empresa', icon: <Building2 className="w-4 h-4" /> },
    { id: 'hero', label: 'Portada (Hero)', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'pagos', label: 'Pagos', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'nosotros', label: 'Nosotros', icon: <Users2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona la identidad y datos de La Celeste</p>
        </div>
        <Button 
          variant="primary" 
          icon={saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-celeste-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'general' && general && (
          <motion.div
            key="general"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Logo de la Empresa</h3>
                  <div className="relative group mx-auto w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {general.logo ? (
                      <img src={general.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Building2 className="w-12 h-12 text-gray-300" />
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {uploadingImage === 'logo' ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-4">Formato sugerido: PNG transparente</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Nombre del Restaurante" 
                    value={general.name} 
                    onChange={e => setGeneral({ ...general, name: e.target.value })} 
                    icon={<Globe className="w-5 h-5" />}
                  />
                  <Input 
                    label="WhatsApp (Con código de país)" 
                    value={general.whatsapp} 
                    onChange={e => setGeneral({ ...general, whatsapp: e.target.value })} 
                    icon={<MessageSquare className="w-5 h-5" />}
                  />
                  <Input 
                    label="Instagram (Usuario)" 
                    value={general.instagram} 
                    onChange={e => setGeneral({ ...general, instagram: e.target.value })} 
                    icon={<Instagram className="w-5 h-5" />}
                  />
                  <Input 
                    label="Teléfono de contacto" 
                    value={general.phone} 
                    onChange={e => setGeneral({ ...general, phone: e.target.value })} 
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <Input 
                    label="Email" 
                    value={general.email || ''} 
                    onChange={e => setGeneral({ ...general, email: e.target.value })} 
                    icon={<Mail className="w-5 h-5" />}
                  />
                  <Input 
                    label="Dirección" 
                    value={general.address} 
                    onChange={e => setGeneral({ ...general, address: e.target.value })} 
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-celeste-600">Finanzas y Entrega</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900">Aplicar IVA</p>
                          <p className="text-sm text-gray-500">¿Cobrar impuesto en pedidos?</p>
                        </div>
                        <button 
                          onClick={() => setGeneral({ ...general, showTax: !general.showTax })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${general.showTax ? 'bg-celeste-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${general.showTax ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      {general.showTax && (
                        <Input 
                          label="Tasa de IVA (0.16 = 16%)" 
                          type="number" 
                          step="0.01" 
                          value={general.taxRate} 
                          onChange={e => setGeneral({ ...general, taxRate: parseFloat(e.target.value) })} 
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900">Mostrar Precios en Bs.</p>
                          <p className="text-sm text-gray-500">¿Mostrar conversión según BCV?</p>
                        </div>
                        <button 
                          onClick={() => setGeneral({ ...general, showBs: !general.showBs })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${general.showBs ? 'bg-celeste-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${general.showBs ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900">Cobrar Delivery</p>
                          <p className="text-sm text-gray-500">¿Cargo extra por envío?</p>
                        </div>
                        <button 
                          onClick={() => setGeneral({ ...general, showDelivery: !general.showDelivery })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${general.showDelivery ? 'bg-celeste-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${general.showDelivery ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                      {general.showDelivery && (
                        <Input 
                          label="Costo de Delivery ($)" 
                          type="number" 
                          step="0.01" 
                          value={general.deliveryFee} 
                          onChange={e => setGeneral({ ...general, deliveryFee: parseFloat(e.target.value) })} 
                        />
                      )}
                    </div>

                    {general.showBs && (
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between p-4 bg-celeste-50/50 rounded-xl border border-celeste-100">
                          <div>
                            <p className="font-semibold text-gray-900">Usar Tasa Manual</p>
                            <p className="text-sm text-gray-500">Ignorar API y usar valor fijo</p>
                          </div>
                          <button 
                            onClick={() => setGeneral({ ...general, useManualRate: !general.useManualRate })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${general.useManualRate ? 'bg-celeste-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${general.useManualRate ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                        {general.useManualRate && (
                          <Input 
                            label="Tasa de Cambio Manual (Bs/$)" 
                            type="number" 
                            step="0.01" 
                            value={general.manualRate} 
                            onChange={e => setGeneral({ ...general, manualRate: parseFloat(e.target.value) })} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'hero' && hero && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Personalización de Portada (Hero)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Input 
                      label="Etiqueta Superior (Badge)" 
                      value={hero.badge} 
                      onChange={e => setHero({ ...hero, badge: e.target.value })} 
                      placeholder="Ej: Lo más pedido"
                    />
                    <Input 
                      label="Título Principal" 
                      value={hero.title} 
                      onChange={e => setHero({ ...hero, title: e.target.value })} 
                    />
                    <div>
                      <label className="label">Subtítulo / Descripción</label>
                      <textarea 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none resize-none"
                        rows={3}
                        value={hero.subtitle}
                        onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Texto Botón Principal" value={hero.ctaText} onChange={e => setHero({ ...hero, ctaText: e.target.value })} />
                      <Input label="Texto Botón Secundario" value={hero.secondaryCtaText} onChange={e => setHero({ ...hero, secondaryCtaText: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">Modo Carrusel</p>
                        <p className="text-sm text-gray-500">Muestra hasta 3 imágenes rotativas</p>
                      </div>
                      <button 
                        onClick={() => setHero({ ...hero, useCarousel: !hero.useCarousel })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${hero.useCarousel ? 'bg-celeste-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hero.useCarousel ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {!hero.useCarousel ? (
                      <div className="space-y-2">
                        <label className="label">Imagen Única de Fondo</label>
                        <div 
                          className="relative w-full h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {hero.backgroundImage ? (
                            <img src={hero.backgroundImage} alt="Hero BG" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="w-12 h-12 mb-2" />
                              <span className="text-sm">Subir imagen de fondo</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Upload className="w-6 h-6 mr-2" /> Cambiar Imagen
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="label">Imágenes del Carrusel (Máximo 3)</label>
                        <div className="grid grid-cols-1 gap-4">
                          {[0, 1, 2].map((idx) => (
                            <div 
                              key={idx}
                              className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center group"
                            >
                              {hero.carouselImages?.[idx] ? (
                                <>
                                  <img src={hero.carouselImages[idx]} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-white hover:bg-white/20"
                                      onClick={() => {
                                        const newImages = [...(hero.carouselImages || [])];
                                        newImages.splice(idx, 1);
                                        setHero({ ...hero, carouselImages: newImages });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center">
                                  {uploadingImage === `carousel-${idx}` ? (
                                    <Loader2 className="w-8 h-8 text-celeste-500 animate-spin" />
                                  ) : (
                                    <>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.onchange = (e) => handleImageUpload(e as any, 'carousel', idx);
                                          input.click();
                                        }}
                                      >
                                        <Plus className="w-5 h-5 mr-2" /> Subir Imagen {idx + 1}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'pagos' && (
          <motion.div
            key="pagos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Métodos de Pago</h2>
                <p className="text-sm text-gray-500">Configura cómo tus clientes pueden pagarte</p>
              </div>
              <Button 
                variant="secondary" 
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setPayments([...payments, { id: Date.now().toString(), name: 'Nuevo Método', type: 'transfer', details: '', active: true }])}
              >
                Añadir Otro
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.map((method, index) => (
                <Card key={method.id} className={!method.active ? 'opacity-60' : ''}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-celeste-50 flex items-center justify-center text-celeste-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <input 
                          className="font-bold text-gray-900 border-none bg-transparent focus:ring-0 p-0"
                          value={method.name} 
                          onChange={e => {
                            const newP = [...payments];
                            newP[index].name = e.target.value;
                            setPayments(newP);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const newP = [...payments];
                            newP[index].active = !newP[index].active;
                            setPayments(newP);
                          }}
                          className={`p-2 rounded-lg transition-colors ${method.active ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setPayments(payments.filter(p => p.id !== method.id))}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Detalles de la cuenta</label>
                      <textarea 
                        className="w-full mt-1 p-3 text-sm bg-gray-50 rounded-xl border-none focus:ring-1 focus:ring-celeste-500 resize-none"
                        rows={3}
                        value={method.details}
                        onChange={e => {
                          const newP = [...payments];
                          newP[index].details = e.target.value;
                          setPayments(newP);
                        }}
                        placeholder="Ej: Banco Mercantil, Cuenta Ahorros, Cédula..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'nosotros' && about && (
          <motion.div
            key="nosotros"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Información Corporativa (Nosotros)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Input 
                      label="Título de Sección" 
                      value={about.title} 
                      onChange={e => setAbout({ ...about, title: e.target.value })} 
                    />
                    <div>
                      <label className="label">Historia / Descripción</label>
                      <textarea 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-celeste-500 focus:outline-none resize-none font-serif"
                        rows={8}
                        value={about.description}
                        onChange={e => setAbout({ ...about, description: e.target.value })}
                        placeholder="Cuenta la historia de La Celeste..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="label">Imagen de la Sección</label>
                    <div 
                      className="relative w-full h-80 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {about.image ? (
                        <img src={about.image} alt="About" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <span className="text-sm">Subir imagen corporativa</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Upload className="w-6 h-6 mr-2" /> Cambiar Imagen
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'about')} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
