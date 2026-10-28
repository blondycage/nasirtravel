import mongoose, { Document, Schema } from 'mongoose';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status: BlogPostStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 320 },
    content: { type: String, required: true },
    coverImage: { type: String, trim: true },
    coverImageAlt: { type: String, trim: true, maxlength: 180 },
    coverImageCaption: { type: String, trim: true, maxlength: 240 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    readingTime: { type: Number, default: 1, min: 1 },
    seoTitle: { type: String, trim: true, maxlength: 160 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
    canonicalUrl: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, status: 1 });
BlogPostSchema.index({ tags: 1, status: 1 });

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
