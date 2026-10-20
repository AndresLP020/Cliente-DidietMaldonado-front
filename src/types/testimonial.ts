/** Testimonios públicos (ver docs/BILLING-AND-TESTIMONIALS.md). Solo se publican los aprobados en el panel. */
export type TestimonialRating = 1 | 2 | 3 | 4 | 5;

export interface PublicTestimonial {
  id: string;
  name: string;
  company?: string;
  role?: string;
  rating: TestimonialRating;
  message: string;
  createdAt: string;
}

export interface PublicTestimonials {
  items: PublicTestimonial[];
  count: number;
  average: number | null;
}

export interface CreateTestimonialInput {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  rating: number;
  message: string;
  consent: true;
  website?: string;
}
