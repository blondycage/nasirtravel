'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';
import { authFetch } from '@/hooks/useAuth';

export default function EditBlogPage() { const params = useParams(); const [post, setPost] = useState<any>(null); const [error, setError] = useState(''); useEffect(() => { if (!params.id) return; authFetch(`/api/admin/blog/${params.id}`).then((response) => response.json().then((json) => { if (!response.ok) throw new Error(json.error); setPost(json.data); })).catch((err) => setError(err.message)); }, [params.id]); if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>; if (!post) return <div className="p-12 text-center text-slate-500">Loading article…</div>; return <BlogEditor initialData={post} />; }
