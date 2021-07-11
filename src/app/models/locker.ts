import { Category } from "./category";
import { Location } from "./location";

export interface Locker {
  category: Category
  location: Location
  id: number;
  name: string
  description: string
  dimensions: string
  price: number
  priceDescription: string
  promoOffer: string
  quantity: number
}
