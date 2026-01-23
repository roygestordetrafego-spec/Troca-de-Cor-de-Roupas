
import React, { useState } from 'react';
import { Review } from '../types';
import { CheckIcon } from './Icons';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

const StarRating = ({ rating, interactive = false, onRatingChange }: { rating: number; interactive?: boolean; onRatingChange?: (r: number) => void }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? "#1c1917" : "none"}
            stroke="#1c1917"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, onAddReview }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !comment) return;
    onAddReview({ userName, rating, comment });
    setUserName('');
    setRating(5);
    setComment('');
    setIsFormOpen(false);
  };

  return (
    <div className="mt-12 border-t border-stone-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-serif text-stone-900">Avaliações de Clientes</h3>
          <p className="text-stone-400 text-sm">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="text-stone-900 font-bold text-xs uppercase tracking-widest border-b-2 border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors"
          >
            Deixar um comentário
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-12 bg-stone-50 p-6 rounded-2xl border border-stone-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start mb-6">
            <h4 className="font-semibold text-stone-900">Sua Avaliação</h4>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-600">
              Cancelar
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Classificação</label>
              <StarRating rating={rating} interactive onRatingChange={setRating} />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Seu Nome</label>
              <input
                type="text"
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-stone-900/10 outline-none"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Comentário</label>
              <textarea
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-stone-900/10 outline-none min-h-[100px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg"
            >
              Publicar Avaliação
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-stone-50 pb-8 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-stone-900">{review.userName}</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                    {new Date(review.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-stone-600 text-sm leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-400 text-sm italic">Este produto ainda não possui avaliações. Seja o primeiro a comentar!</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
