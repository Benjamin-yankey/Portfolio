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
