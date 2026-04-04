import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { PostPreview } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()
}

const fallbackPosts = [
  {
    slug: '#',
    title: 'Beyond RAG: The Future of Cognitive Search in Enterprise',
    category: 'Research',
    date: '04 May 2024',
    cover_image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAndoLhQrUqEwOrAc3W_-XFYo1owA2JYt4pipS83Zsn9BCRMIgz1dztnIuDfDwRdzshy1e029JrjyH_03TJwRz2Mzc-4jxVX1nIQTXiS_XGYwDD-0UhEQRWVXNejcnpW1kDBVRL7yP8i2Rnwer9ST-OfWExqSGXmCdtLVuSSWmBBndNkCEM-U-UDfc43UEhjd-pHE_pNWgTTuwhWHnMxDCTCzTMmufJ28WhHCrnMJG0N1-hFHv-G4clEUUWbAv9gTxAC38htuU6Q2rM',
  },
  {
    slug: '#',
    title: 'The Cost of Latency: Why Local LLMs Win in Production',
    category: 'Whitepaper',
    date: '12 Apr 2024',
    cover_image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBf__uEZzYHvF4fBWXg4r9YHeuL4XOQkURzO1MJA6aAyk8gowusonxDG5aijdjffXUflPR9B30u8DXYYHzZTN_JMoNphVXnaGjXikkDnCcsoTWBM114gE7uMOtm7ZdCHeNE8FZiWQRaXPK0UDy6_QMWzzsAqKYEl8sLwQZWI0TTpsJzeKklWiijtj6WTl4H9zTxg0yVf_tM5kHbK25_Vpa_N9fODioy7yzN4JsCGhAK6Amt9x--7Sxiru7nuMixyKHGpzg1DMnm-1fa',
  },
  {
    slug: '#',
    title: "How We Automated 70% of a Legal Firm's Discovery Process",
    category: 'Case Study',
    date: '29 Mar 2024',
    cover_image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_MXbx3yn5t7U32QW_txV-8MqP5cPao3pv12QQdZaUv4E2CIcFrFAGcrM4p7XtrmdSERqfqbBjhGzg8PN8rnE_2rCoCEjIvGYWA674Q5rm-kPfAv99WyPaCfDXK7QMA_ASq0xftU_8I7176aEDNC4l6Iid8RwHEa5u99sqAjXQE7SjVsSW43qBobsQoqc-d5tQIZhRyzlbOViY1ZOveGv2LIidYSH7hbAS6DcSqHgIbX9i5Hw-BhRhXvTEkyin6SAabOyZ_yekZpwa',
  },
]

interface DisplayPost {
  slug: string
  title: string
  category: string
  date: string
  cover_image: string
}

function toDisplayPosts(posts: PostPreview[]): DisplayPost[] {
  if (posts.length === 0) return fallbackPosts
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: (p.tags?.[0] ?? 'Blog'),
    date: formatDate(p.published_at ?? p.created_at),
    cover_image: p.cover_image ?? '',
  }))
}

export async function BlogPreview() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('posts')
    .select(
      'id, slug, title, excerpt, cover_image, published_at, is_published, author, tags, created_at, updated_at'
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  const posts = toDisplayPosts((data ?? []) as PostPreview[])

  return (
    <section className="py-32 max-w-screen-2xl mx-auto px-6 md:px-8" id="blog">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16">
        <h2 className="text-4xl font-headline font-bold text-[#e2e3df]">Blog technologiczny</h2>
        <Link
          href="/blog"
          className="text-[#70e5ea] font-headline font-bold flex items-center gap-2 group mt-4 md:mt-0"
        >
          <ArrowUpRight
            size={20}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.slug} className="group">
            <Link href={post.slug.startsWith('#') ? '#blog' : `/blog/${post.slug}`}>
              <div className="glass-card p-4 rounded-[2rem] border border-[#3d4949]/10 mb-6 hover:border-[#70e5ea]/30 transition-all">
                {/* Image */}
                {post.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-2xl mb-6"
                  />
                ) : (
                  <div className="w-full h-48 rounded-2xl mb-6 bg-[#282a28] flex items-center justify-center">
                    <span className="text-[#70e5ea]/30 text-4xl font-headline font-black">AI</span>
                  </div>
                )}

                {/* Category + date */}
                <div className="font-label text-[10px] text-[#70e5ea] tracking-widest uppercase mb-3">
                  {post.category} — {post.date}
                </div>

                {/* Title */}
                <h4 className="text-xl font-headline font-bold leading-tight text-[#e2e3df] group-hover:text-[#70e5ea] transition-colors">
                  {post.title}
                </h4>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
