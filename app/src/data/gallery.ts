import content from '../content/gallery.json'

export interface GalleryItem {
  title: string
  caption?: string
  category?: string
  date?: string
  image?: string
  video?: string
}

export const galleryItems: GalleryItem[] = content.items

/**
 * One displayable photo or video. A `GalleryItem` with both an image and a
 * video unpacks into two of these — so uploading both in the CMS shows both
 * in the grid — while an item with just one field produces a single entry.
 */
export interface GalleryMedia {
  key: string
  title: string
  caption?: string
  category?: string
  date?: string
  type: 'image' | 'video'
  src: string
  /** For a video entry, the item's image (if any) doubles as its poster
   *  frame — shown in the same slot the standalone image entry also uses. */
  poster?: string
}

export function toGalleryMedia(items: GalleryItem[]): GalleryMedia[] {
  return items.flatMap((item, index) => {
    const shared = { title: item.title, caption: item.caption, category: item.category, date: item.date }
    const media: GalleryMedia[] = []
    if (item.image) {
      media.push({ key: `${index}-image`, ...shared, type: 'image', src: item.image })
    }
    if (item.video) {
      media.push({ key: `${index}-video`, ...shared, type: 'video', src: item.video, poster: item.image })
    }
    return media
  })
}
