'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ReviewFormModalProps {
  bookingId: number;
  vendorName: string;
  serviceName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewFormModal = ({
  bookingId,
  vendorName,
  serviceName,
  open,
  onClose,
  onSuccess,
}: ReviewFormModalProps) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select an overall rating');
      return;
    }

    setLoading(true);
    try {
      await apiService.reviews.create({
        review: {
          booking_id: bookingId,
          rating,
          quality_rating: qualityRating || null,
          communication_rating: communicationRating || null,
          value_rating: valueRating || null,
          punctuality_rating: punctualityRating || null,
          comment: comment || null,
        },
      });

      toast.success('Review submitted successfully!');
      onSuccess();
      onClose();

      // Reset form
      setRating(0);
      setQualityRating(0);
      setCommunicationRating(0);
      setValueRating(0);
      setPunctualityRating(0);
      setComment('');
    } catch (error: any) {
      const errorMessage = error.extractedMessage || error.response?.data?.error || error.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#16191e] border border-white/[0.03]">
        <DialogHeader>
          <DialogTitle className="text-white">Leave a Review</DialogTitle>
          <p className="text-xs text-slate-400 mt-2">
            {serviceName} • {vendorName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Overall Rating (Required) */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white">Overall Rating *</label>
            <div className="flex gap-2">
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            {rating > 0 && (
              <p className="text-xs text-slate-400">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Sub-ratings Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Quality</label>
              <StarRating value={qualityRating} onChange={setQualityRating} size={18} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Communication</label>
              <StarRating value={communicationRating} onChange={setCommunicationRating} size={18} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Value</label>
              <StarRating value={valueRating} onChange={setValueRating} size={18} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Punctuality</label>
              <StarRating value={punctualityRating} onChange={setPunctualityRating} size={18} />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Share your experience with this professional..."
              className="bg-[#0f1115] border border-white/[0.05] text-white placeholder:text-slate-600 resize-none min-h-[100px]"
            />
            <p className="text-xs text-slate-500">{comment.length}/1000 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !rating}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
