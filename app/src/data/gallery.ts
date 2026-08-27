import content from '../content/gallery.json'

export interface GalleryItem {
  title: string
  caption?: string
  image?: string
  video?: string
}

export const galleryItems: GalleryItem[] = content.items
