'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { CatchEntry } from './catchData';

interface LogCatchFormData {
  species: string;
  customSpecies: string;
  weight: string;
  length: string;
  location: string;
  waterType: string;
  weather: string;
  bait: string;
  date: string;
  notes: string;
}

interface LogCatchPanelProps {
  onClose: () => void;
  onSave: (entry: CatchEntry) => void;
  totalCatches: number;
}

const SPECIES_OPTIONS = [
  'Rainbow Trout',
  'Brown Trout',
  'Murray Cod',
  'Yellowbelly',
  'Flathead',
  'Silver Perch',
  'Redfin Perch',
  'Australian Bass',
  'Yellowfin Bream',
  'Snapper',
  'Barramundi',
  'Cod',
  'Other (specify below)',
];

const SPECIES_EMOJI: Record<string, string> = {
  'Rainbow Trout': '🐟',
  'Brown Trout': '🐟',
  'Murray Cod': '🐠',
  'Yellowbelly': '🦈',
  'Flathead': '🐡',
  'Silver Perch': '🐟',
  'Redfin Perch': '🐠',
  'Australian Bass': '🦈',
  'Yellowfin Bream': '🐡',
  Snapper: '🐠',
  Barramundi: '🐟',
  Cod: '🐠',
};

export default function LogCatchPanel({ onClose, onSave, totalCatches }: LogCatchPanelProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LogCatchFormData>({
    defaultValues: {
      species: '',
      customSpecies: '',
      weight: '',
      length: '',
      location: '',
      waterType: 'River',
      weather: 'Sunny',
      bait: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedSpecies = watch('species');

  // Trap focus in panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Backend integration point: POST to /api/catches with form data
  const onSubmit = async (data: LogCatchFormData) => {
    await new Promise((r) => setTimeout(r, 800));

    const finalSpecies = data.species === 'Other (specify below)' && data.customSpecies
      ? data.customSpecies
      : data.species;

    const newEntry: CatchEntry = {
      id: `catch-${String(totalCatches + 1).padStart(3, '0')}`,
      species: finalSpecies,
      weight: data.weight ? `${data.weight} kg` : '— kg',
      length: data.length ? `${data.length} cm` : '— cm',
      location: data.location,
      waterType: data.waterType,
      weather: data.weather,
      bait: data.bait,
      date: new Date(data.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: data.notes,
      emoji: SPECIES_EMOJI[finalSpecies] || '🐟',
    };

    onSave(newEntry);
    toast.success(`🎣 ${finalSpecies} logged! Great catch, Finn!`);
  };

  const inputClass = (hasError: boolean) => `
    w-full px-3.5 py-2.5 rounded-xl border font-sans text-sm
    bg-white text-primary-900 placeholder-earth-300
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
    ${hasError ? 'border-red-400 bg-red-50' : 'border-adventure-border hover:border-primary-300'}
  `;

  const labelClass = 'block text-sm font-sans font-semibold text-primary-800 mb-1.5';
  const helperClass = 'text-xs font-sans text-earth-400 mb-1.5';
  const errorClass = 'mt-1 text-xs font-sans text-red-600 flex items-center gap-1';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-panel slide-in-panel overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-adventure-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff751f, #e85a00)' }}>
              <Icon name="PlusCircleIcon" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl text-primary-800">Log a Catch</h2>
              <p className="text-xs font-sans text-earth-400">Record your fishing adventure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
            aria-label="Close panel"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-5">
          {/* Species */}
          <div>
            <label htmlFor="species" className={labelClass}>
              Fish Species <span className="text-red-500">*</span>
            </label>
            <p className={helperClass}>Select the type of fish you caught</p>
            <select
              id="species"
              className={inputClass(!!errors.species)}
              {...register('species', { required: 'Please select a species' })}
            >
              <option value="">Select a species...</option>
              {SPECIES_OPTIONS.map((s) => (
                <option key={`species-${s}`} value={s}>{s}</option>
              ))}
            </select>
            {errors.species && (
              <p className={errorClass}>
                <Icon name="ExclamationCircleIcon" size={13} />
                {errors.species.message}
              </p>
            )}
          </div>

          {/* Custom species */}
          {selectedSpecies === 'Other (specify below)' && (
            <div className="fade-in">
              <label htmlFor="customSpecies" className={labelClass}>
                Species Name <span className="text-red-500">*</span>
              </label>
              <input
                id="customSpecies"
                type="text"
                placeholder="e.g. Mackerel, Bream..."
                className={inputClass(!!errors.customSpecies)}
                {...register('customSpecies', { required: 'Please enter the species name' })}
              />
              {errors.customSpecies && (
                <p className={errorClass}>
                  <Icon name="ExclamationCircleIcon" size={13} />
                  {errors.customSpecies.message}
                </p>
              )}
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="date" className={labelClass}>
              Date Caught <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              className={inputClass(!!errors.date)}
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className={errorClass}>
                <Icon name="ExclamationCircleIcon" size={13} />
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Weight + Length row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className={labelClass}>Weight (kg)</label>
              <p className={helperClass}>Optional — best guess is fine</p>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="e.g. 1.8"
                className={inputClass(!!errors.weight)}
                {...register('weight', {
                  min: { value: 0, message: 'Weight must be positive' },
                  max: { value: 100, message: 'That is one big fish!' },
                })}
              />
              {errors.weight && (
                <p className={errorClass}>
                  <Icon name="ExclamationCircleIcon" size={13} />
                  {errors.weight.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="length" className={labelClass}>Length (cm)</label>
              <p className={helperClass}>Optional</p>
              <input
                id="length"
                type="number"
                step="1"
                min="0"
                placeholder="e.g. 42"
                className={inputClass(!!errors.length)}
                {...register('length', {
                  min: { value: 0, message: 'Must be positive' },
                })}
              />
              {errors.length && (
                <p className={errorClass}>
                  <Icon name="ExclamationCircleIcon" size={13} />
                  {errors.length.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className={labelClass}>
              Location <span className="text-red-500">*</span>
            </label>
            <p className={helperClass}>River, lake, or spot name</p>
            <input
              id="location"
              type="text"
              placeholder="e.g. Thredbo River, Lake Eildon..."
              className={inputClass(!!errors.location)}
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && (
              <p className={errorClass}>
                <Icon name="ExclamationCircleIcon" size={13} />
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Water type */}
          <div>
            <label htmlFor="waterType" className={labelClass}>Water Type</label>
            <select
              id="waterType"
              className={inputClass(false)}
              {...register('waterType')}
            >
              {['River', 'Lake', 'Sea', 'Dam', 'Creek', 'Estuary'].map((w) => (
                <option key={`wt-${w}`} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Weather */}
          <div>
            <label htmlFor="weather" className={labelClass}>Weather Conditions</label>
            <select
              id="weather"
              className={inputClass(false)}
              {...register('weather')}
            >
              {['Sunny', 'Partly Cloudy', 'Overcast', 'Rainy', 'Foggy', 'Windy', 'Calm', 'Clear', 'Stormy'].map((w) => (
                <option key={`wx-${w}`} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Bait */}
          <div>
            <label htmlFor="bait" className={labelClass}>Bait / Lure Used</label>
            <input
              id="bait"
              type="text"
              placeholder="e.g. Worm, Soft plastic, Dry fly..."
              className={inputClass(false)}
              {...register('bait')}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className={labelClass}>Adventure Notes</label>
            <p className={helperClass}>What was the trip like? Any special moments?</p>
            <textarea
              id="notes"
              rows={3}
              placeholder="Tell the story of this catch..."
              className={`${inputClass(false)} resize-none`}
              {...register('notes')}
            />
          </div>

          {/* Required fields note */}
          <p className="text-xs font-sans text-earth-400">
            <span className="text-red-500">*</span> Required fields
          </p>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-white border-t border-adventure-border -mx-6 px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-adventure-border text-primary-700 font-sans font-semibold text-sm hover:bg-primary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex-1 py-3 rounded-xl font-sans font-semibold text-sm
                bg-primary-500 text-white
                flex items-center justify-center gap-2
                transition-all duration-150 active:scale-95
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-600 shadow-card'}
              `}
            >
              {isSubmitting ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  Saving Catch...
                </>
              ) : (
                <>
                  <Icon name="CheckCircleIcon" size={16} />
                  Save Catch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}