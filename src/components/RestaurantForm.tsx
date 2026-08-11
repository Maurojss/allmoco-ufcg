import React, { useState, useEffect } from 'react';
import { Restaurant, Dish } from '../types';
import { isValidUrl } from '../utils/security';
import { User } from '../lib/firebase';
import {
  Store,
  MapPin,
  Clock,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  DollarSign,
  Sparkles,
  ChevronLeft,
  UserCheck,
  LogIn,
} from 'lucide-react';

interface RestaurantFormProps {
  initialData?: Restaurant | null;
  currentUser: User | null;
  onLoginGoogle: () => void;
  onSave: (restaurantData: Omit<Restaurant, 'id' | 'createdAt'>, editingId?: string) => void;
  onCancel: () => void;
}

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  initialData,
  currentUser,
  onLoginGoogle,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialData);

  // Restaurant fields
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('11:00 - 14:00');
  const [hasStudentDiscount, setHasStudentDiscount] = useState(true);
  const [studentDiscountDetails, setStudentDiscountDetails] = useState('');
  const [campusZone, setCampusZone] = useState('Praça Central do Campus');

  // Dishes fields (starts with at least 2 dishes)
  const [dishes, setDishes] = useState<Omit<Dish, 'id'>[]>([
    {
      name: '',
      size: 'Prato Feito (500g)',
      availableDays: 'Segunda a Sexta',
      price: 15.0,
      description: '',
      isLactoseFree: false,
      isVegan: false,
      isGlutenFree: false,
    },
    {
      name: '',
      size: 'Marmita M (400g)',
      availableDays: 'Segunda a Sexta',
      price: 18.0,
      description: '',
      isLactoseFree: false,
      isVegan: false,
      isGlutenFree: false,
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setImageUrl(initialData.imageUrl || '');
      setGoogleMapsUrl(initialData.googleMapsUrl || '');
      setOpeningHours(initialData.openingHours || '');
      setHasStudentDiscount(Boolean(initialData.hasStudentDiscount));
      setStudentDiscountDetails(initialData.studentDiscountDetails || '');
      setCampusZone(initialData.campusZone || 'Praça Central do Campus');
      if (initialData.dishes && initialData.dishes.length >= 2) {
        setDishes(
          initialData.dishes.map((d) => ({
            name: d.name,
            size: d.size,
            availableDays: d.availableDays,
            price: d.price,
            description: d.description,
            isLactoseFree: d.isLactoseFree,
            isVegan: d.isVegan,
            isGlutenFree: d.isGlutenFree,
          }))
        );
      }
    }
  }, [initialData]);

  // Add Dish
  const handleAddDish = () => {
    setDishes([
      ...dishes,
      {
        name: '',
        size: 'Prato Feito',
        availableDays: 'Segunda a Sexta',
        price: 15.0,
        description: '',
        isLactoseFree: false,
        isVegan: false,
        isGlutenFree: false,
      },
    ]);
  };

  // Remove Dish (prevent dropping below 2)
  const handleRemoveDish = (index: number) => {
    if (dishes.length <= 2) {
      setErrors(['O restaurante precisa ter no mínimo 2 pratos cadastrados.']);
      return;
    }
    const updated = dishes.filter((_, i) => i !== index);
    setDishes(updated);
    setErrors([]);
  };

  // Update specific dish field
  const handleDishChange = (index: number, field: keyof Omit<Dish, 'id'>, value: any) => {
    const updated = [...dishes];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setDishes(updated);
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('O nome do restaurante é obrigatório.');
    }

    if (!googleMapsUrl.trim()) {
      newErrors.push('O link do Google Maps é obrigatório.');
    } else if (!isValidUrl(googleMapsUrl)) {
      newErrors.push('O link do Google Maps deve ser uma URL válida (ex: https://maps.google.com/...).');
    }

    if (imageUrl.trim() && !isValidUrl(imageUrl)) {
      newErrors.push('A URL da imagem fornecida é inválida.');
    }

    if (!openingHours.trim()) {
      newErrors.push('O horário de funcionamento é obrigatório.');
    }

    if (dishes.length < 2) {
      newErrors.push('Cadastre no mínimo 2 pratos para o restaurante.');
    }

    dishes.forEach((dish, idx) => {
      if (!dish.name.trim()) {
        newErrors.push(`O nome do prato #${idx + 1} é obrigatório.`);
      }
      if (isNaN(dish.price) || dish.price <= 0) {
        newErrors.push(`O valor do prato #${idx + 1} deve ser maior que R$ 0,00.`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);

    // Format dishes with IDs
    const preparedDishes: Dish[] = dishes.map((d, i) => ({
      ...d,
      id: initialData?.dishes[i]?.id || `dish-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    onSave(
      {
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        openingHours: openingHours.trim(),
        hasStudentDiscount,
        studentDiscountDetails: studentDiscountDetails.trim(),
        campusZone: campusZone.trim(),
        dishes: preparedDishes,
        ownerId: currentUser?.uid || initialData?.ownerId,
        ownerEmail: currentUser?.email || initialData?.ownerEmail,
        ownerName: currentUser?.displayName || initialData?.ownerName,
      },
      initialData?.id
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-600" />
            <span>{isEditing ? 'Editar Restaurante' : 'Cadastrar Novo Restaurante'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preencha as informações abaixo para disponibilizar o restaurante para os estudantes do campus.
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      {/* Auth Callout */}
      {currentUser ? (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || ''}
                className="w-7 h-7 rounded-full border border-emerald-400"
              />
            ) : (
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                Conectado como <span className="underline">{currentUser.displayName || currentUser.email}</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80">
                Você será identificado como o responsável e dono por este cadastro no campus.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div>
            <p className="font-extrabold text-sm flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
              <LogIn className="w-4 h-4 text-amber-600" />
              <span>Identificação do Restaurante/Proprietário</span>
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
              Recomendamos fazer login com sua conta do Google para poder editar e gerenciar seu local no futuro.
            </p>
          </div>
          <button
            type="button"
            onClick={onLoginGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 hover:bg-amber-100 font-extrabold text-xs rounded-xl shadow-xs transition-all border border-amber-300 shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entrar com Google</span>
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {errors.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Por favor, corrija os seguintes erros antes de continuar:</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-0.5 pl-2">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Dados do Restaurante */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 border-b border-slate-100 dark:border-slate-800 pb-1">
            1. Informações Básicas do Restaurante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Nome do Restaurante <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cantina do CEEI / Hamburgueria Coruja"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden font-medium"
              />
            </div>

            {/* URL da Imagem */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                URL da Imagem (opcional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
              />
            </div>

            {/* Google Maps URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Link do Google Maps <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=UFCG"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
              />
            </div>

            {/* Horário de funcionamento */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Horário de Funcionamento <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="Ex: 08:00 - 22:00 ou 18:00 - 02:00"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5 text-[11px] text-slate-500">
                <span>Atalhos:</span>
                <button
                  type="button"
                  onClick={() => setOpeningHours('11:00 - 14:00')}
                  className="text-orange-600 hover:underline cursor-pointer font-medium"
                >
                  Almoço (11h-14h)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setOpeningHours('08:00 - 22:00')}
                  className="text-orange-600 hover:underline cursor-pointer font-medium"
                >
                  Dia todo (08h-22h)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setOpeningHours('18:00 - 02:00')}
                  className="text-orange-600 hover:underline cursor-pointer font-medium"
                >
                  Noturno (18h-02h)
                </button>
              </div>
            </div>

            {/* Desconto Estudante Toggle & Details */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Benefício / Desconto para Estudantes
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStudentDiscount}
                    onChange={(e) => setHasStudentDiscount(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <span>Possui desconto / fidelidade para estudantes</span>
                </label>
              </div>

              {hasStudentDiscount && (
                <input
                  type="text"
                  value={studentDiscountDetails}
                  onChange={(e) => setStudentDiscountDetails(e.target.value)}
                  placeholder="Ex: 10% com carteirinha ou refeição a R$ 3,50"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-hidden mt-1"
                />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Pratos do Restaurante */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                2. Cardápio / Pratos Disponíveis (Mínimo de 2)
              </h3>
              <p className="text-xs text-slate-500">
                Cadastre os pratos oferecidos pelo restaurante com seus respectivos preços e restrições.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddDish}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200 hover:bg-orange-200 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Prato</span>
            </button>
          </div>

          {/* Dish List Inputs */}
          <div className="space-y-4">
            {dishes.map((dish, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    Prato #{idx + 1}
                  </span>

                  {dishes.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveDish(idx)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Mínimo de 2 pratos
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Dish Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Prato <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dish.name}
                      onChange={(e) => handleDishChange(idx, 'name', e.target.value)}
                      placeholder="Ex: Strogonoff de Frango / Marmita Vegana"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden font-medium"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Valor em R$ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        value={dish.price}
                        onChange={(e) =>
                          handleDishChange(idx, 'price', parseFloat(e.target.value) || 0)
                        }
                        placeholder="15.00"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden font-extrabold text-orange-600 dark:text-orange-400"
                      />
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tamanho / Porção
                    </label>
                    <input
                      type="text"
                      value={dish.size}
                      onChange={(e) => handleDishChange(idx, 'size', e.target.value)}
                      placeholder="Ex: Marmita P, 500g, Prato Feito"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
                    />
                  </div>

                  {/* Available Days */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Dias / Datas Disponíveis
                    </label>
                    <input
                      type="text"
                      value={dish.availableDays}
                      onChange={(e) => handleDishChange(idx, 'availableDays', e.target.value)}
                      placeholder="Ex: Segunda a Sexta, Todos os dias"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Descrição do Prato
                    </label>
                    <textarea
                      rows={2}
                      value={dish.description}
                      onChange={(e) => handleDishChange(idx, 'description', e.target.value)}
                      placeholder="Acompanhamentos, temperos, ingredientes..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-hidden resize-none"
                    />
                  </div>
                </div>

                {/* Dietary Restriction Checkboxes */}
                <div className="pt-2 flex flex-wrap items-center gap-4 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Restrições Alimentares:
                  </span>

                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dish.isLactoseFree}
                      onChange={(e) => handleDishChange(idx, 'isLactoseFree', e.target.checked)}
                      className="rounded-xs border-slate-300 text-slate-800 focus:ring-slate-500 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1 rounded font-bold">
                      SL
                    </span>
                    <span>Sem Lactose</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dish.isVegan}
                      onChange={(e) => handleDishChange(idx, 'isVegan', e.target.checked)}
                      className="rounded-xs border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] bg-emerald-700 text-white px-1 rounded font-bold">
                      VG
                    </span>
                    <span>Vegano</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dish.isGlutenFree}
                      onChange={(e) => handleDishChange(idx, 'isGlutenFree', e.target.checked)}
                      className="rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] bg-blue-700 text-white px-1 rounded font-bold">
                      SG
                    </span>
                    <span>Sem Glúten</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isEditing ? 'Atualizar Restaurante' : 'Salvar Restaurante'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
