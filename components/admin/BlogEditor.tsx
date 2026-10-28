'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import { authFetch } from '@/hooks/useAuth';

const empty = { title: '', slug: '', excerpt: '', content: '', coverImage: '', coverImageAlt: '', coverImageCaption: '', category: 'Travel', tags: '', author: 'Naasir Travel', seoTitle: '', seoDescription: '', canonicalUrl: '', status: 'draft' };

export default function BlogEditor({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...empty, ...initialData, tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : initialData?.tags || '' });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key: string, value: string) => setForm((current: typeof form) => ({ ...current, [key]: value }));
  const upload = async (file: File) => { const data = new FormData(); data.append('file', file); data.append('folder', 'blog'); const response = await authFetch('/api/upload', { method: 'POST', body: data }); const json = await response.json(); if (!response.ok) throw new Error(json.error || 'Upload failed'); return json.data.url; };
  const uploadCover = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { update('coverImage', await upload(file)); } catch (err: any) { setError(err.message); } };
  const save = async (status: string) => {
    setSaving(true); setError('');
    try { const response = await authFetch(initialData?._id ? `/api/admin/blog/${initialData._id}` : '/api/admin/blog', { method: initialData?._id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, status }) }); const json = await response.json(); if (!response.ok) throw new Error(json.error || 'Unable to save article'); router.push(`/admin/blog/${json.data._id}`); router.refresh(); }
    catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };
  const previewPost = { ...form, tags: form.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean), publishedAt: new Date().toISOString(), readingTime: 1 };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><Link href="/admin/blog" className="text-sm font-semibold text-blue-700">← All articles</Link><h1 className="mt-2 text-3xl font-extrabold text-slate-950">{initialData ? 'Edit article' : 'New article'}</h1></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPreview(!preview)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">{preview ? 'Edit article' : 'Live preview'}</button><button type="button" disabled={saving} onClick={() => save('draft')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Save draft</button>{initialData && <button type="button" disabled={saving} onClick={() => save('archived')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">Archive</button>}<button type="button" disabled={saving} onClick={() => save('published')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Publish</button></div></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className={preview ? 'grid gap-6 xl:grid-cols-2' : ''}>
      <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2">Title<input value={form.title} onChange={(e) => update('title', e.target.value)} className="admin-input" /></label><label>Slug<input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated-if-empty" className="admin-input" /></label><label>Category<input value={form.category} onChange={(e) => update('category', e.target.value)} className="admin-input" /></label><label className="sm:col-span-2">Excerpt<textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} rows={3} className="admin-input" /></label><label>Author<input value={form.author} onChange={(e) => update('author', e.target.value)} className="admin-input" /></label><label>Tags<input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="umrah, travel tips" className="admin-input" /></label></div>
        <div><label>Cover image URL<input value={form.coverImage} onChange={(e) => update('coverImage', e.target.value)} className="admin-input" /></label><label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Upload cover image<input type="file" accept="image/*" onChange={uploadCover} className="sr-only" /></label></div><div><label className="block">Cover image alt text<input value={form.coverImageAlt} onChange={(e) => update('coverImageAlt', e.target.value)} className="admin-input" /></label><label className="mt-3 block">Caption<input value={form.coverImageCaption} onChange={(e) => update('coverImageCaption', e.target.value)} className="admin-input" /></label></div>
        <div><p className="mb-2 text-sm font-semibold text-slate-700">Article content</p><RichTextEditor initialContent={form.content} onChange={(value) => update('content', value)} onUploadImage={upload} /></div>
        <details className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-semibold text-slate-800">SEO settings</summary><div className="mt-4 space-y-4"><label>SEO title<input value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} className="admin-input" /></label><label>SEO description<textarea value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} rows={3} className="admin-input" /></label><label>Canonical URL<input value={form.canonicalUrl} onChange={(e) => update('canonicalUrl', e.target.value)} className="admin-input" /></label></div></details>
      </div>
      {preview && <div className="min-w-0 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><p className="border-b border-slate-200 px-5 py-4 text-sm font-bold uppercase tracking-wider text-slate-500">Article preview</p><div className="max-h-[calc(100vh-12rem)] overflow-y-auto"><BlogPreview post={previewPost} /></div></div>}
    </div>
  </div>;
}

function BlogPreview({ post }: { post: any }) { return <article className="p-6"><p className="text-sm font-bold uppercase tracking-widest text-orange-600">{post.category || 'Travel'}</p><h2 className="mt-3 text-3xl font-extrabold text-slate-950">{post.title || 'Your article title'}</h2><p className="mt-3 text-slate-600">{post.excerpt || 'Your article excerpt will appear here.'}</p>{post.coverImage && <img src={post.coverImage} alt={post.coverImageAlt || ''} className="mt-6 aspect-video w-full rounded-2xl object-cover" />}<div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: post.content || '<p>Your article content will appear here.</p>' }} /></article>; }
